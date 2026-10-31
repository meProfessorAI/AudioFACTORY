/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * AudioFACTORY Client-Side Firebase Service with Error Handling & Google Auth
 */
import { 
  auth, 
  db,
  signInWithPopup, 
  linkWithPopup,
  signInWithRedirect,
  linkWithRedirect,
  getRedirectResult,
  GoogleAuthProvider, 
  signInAnonymously as firebaseSignInAnonymously, 
  signOut as firebaseSignOut,
  onAuthStateChanged,
  User,
  collection, 
  doc, 
  setDoc, 
  deleteDoc, 
  onSnapshot, 
  getDocFromServer,
  query,
  orderBy,
  googleAuthProvider
} from '../config/firebaseConfig';
import { SavedAudioProject, SavedMonologue, ProjectInput, MonologueInput, UsageRecord } from '../../types';

export { auth, db };
export type { User };

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

/**
 * Validate connection to Firestore on boot (conforms to skill requirement)
 */
export async function testFirestoreConnection(): Promise<boolean> {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
    return true;
  } catch (error: any) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    const errorCode = error?.code || '';
    if (
      errorCode === 'unavailable' ||
      errorMsg.includes('the client is offline') || 
      errorMsg.includes('unavailable') ||
      errorMsg.includes('Could not reach Cloud Firestore backend')
    ) {
      console.warn("Firestore connection check: Operating in offline / local cache mode.");
      return false;
    }
    return true;
  }
}

/**
 * Check if the user just returned from a Google redirect authentication
 */
export async function checkRedirectResult(): Promise<User | null> {
  try {
    const result = await getRedirectResult(auth);
    if (result && result.user) {
      console.log("[Auth] Successfully authenticated from redirect:", result.user.email);
      return result.user;
    }
  } catch (err: any) {
    console.warn("[Auth] Redirect result notification:", err?.message || err);
  }
  return null;
}

/**
 * Google Sign In / Sign Up handler using GoogleAuthProvider with popup and redirect fallback
 */
export async function signInWithGoogle(): Promise<{ user: User; isNewUser?: boolean }> {
  try {
    const result = await signInWithPopup(auth, googleAuthProvider);
    return { user: result.user };
  } catch (err: any) {
    console.warn("Google sign-in popup attempt error:", err?.code || err?.message);
    // If popup is blocked or unsupported in current environment (e.g. mobile webview), fallback to redirect
    if (
      err.code === 'auth/popup-blocked' ||
      err.code === 'auth/operation-not-supported-in-this-environment' ||
      err.code === 'auth/cancelled-popup-request'
    ) {
      console.log("[Auth] Falling back to signInWithRedirect...");
      await signInWithRedirect(auth, googleAuthProvider);
      return new Promise(() => {}); // Wait for redirect to occur
    }
    throw err;
  }
}

/**
 * Google Sign In with Account Linking:
 * Links anonymous guest account to Google without losing existing UID and work,
 * with graceful redirect fallback for mobile webviews.
 */
export async function linkOrSignInWithGoogle(): Promise<{ user: User; linked: boolean }> {
  const currentUser = auth.currentUser;

  if (currentUser && currentUser.isAnonymous) {
    try {
      const result = await linkWithPopup(currentUser, googleAuthProvider);
      return { user: result.user, linked: true };
    } catch (err: any) {
      if (err.code === 'auth/credential-already-in-use' || err.code === 'auth/email-already-in-use') {
        try {
          const credential = await signInWithPopup(auth, googleAuthProvider);
          return { user: credential.user, linked: false };
        } catch (subErr: any) {
          if (
            subErr.code === 'auth/popup-blocked' ||
            subErr.code === 'auth/operation-not-supported-in-this-environment'
          ) {
            console.log("[Auth] Falling back to signInWithRedirect...");
            await signInWithRedirect(auth, googleAuthProvider);
            return new Promise(() => {});
          }
          throw subErr;
        }
      } else if (
        err.code === 'auth/popup-blocked' ||
        err.code === 'auth/operation-not-supported-in-this-environment'
      ) {
        console.log("[Auth] Falling back to linkWithRedirect...");
        await linkWithRedirect(currentUser, googleAuthProvider);
        return new Promise(() => {});
      }
      throw err;
    }
  }

  try {
    const credential = await signInWithPopup(auth, googleAuthProvider);
    return { user: credential.user, linked: false };
  } catch (err: any) {
    if (
      err.code === 'auth/popup-blocked' ||
      err.code === 'auth/operation-not-supported-in-this-environment'
    ) {
      console.log("[Auth] Falling back to signInWithRedirect...");
      await signInWithRedirect(auth, googleAuthProvider);
      return new Promise(() => {});
    }
    throw err;
  }
}

/**
 * Explicit Anonymous Sign In for Guest Mode
 */
export async function signInAnonymously(): Promise<User> {
  const credential = await firebaseSignInAnonymously(auth);
  return credential.user;
}

/**
 * Sign out
 */
export async function signOutUser(): Promise<void> {
  await firebaseSignOut(auth);
}

/**
 * Listen to auth state changes
 */
export function subscribeToAuth(callback: (user: User | null) => void): () => void {
  return onAuthStateChanged(auth, callback);
}

/**
 * Save an Audio Factory multi-speaker project to Firestore
 */
export async function saveAudioProject(
  projectData: ProjectInput
): Promise<string> {
  const user = auth.currentUser;
  if (!user) throw new Error("Authentication session required to save projects.");

  const projectId = projectData.id && projectData.id.trim() ? projectData.id : `proj_${Date.now()}`;
  const now = new Date().toISOString();
  const path = `users/${user.uid}/projects/${projectId}`;

  const cleanLines = (projectData.lines || []).map(line => ({
    id: line.id,
    speaker: line.speaker,
    text: line.text,
    scene: line.scene || 'Scene 1',
    emotion: line.emotion || 'Natural',
  }));

  const cleanSpeakers = (projectData.speakers || []).map(s => ({
    name: s.name,
    voice: s.voice,
    provider: s.provider,
    gender: s.gender || 'MALE',
    color: s.color || 'yellow',
  }));

  const payload: SavedAudioProject = {
    id: projectId,
    title: projectData.title || 'Untitled Audio Project',
    summary: projectData.summary || '',
    format: projectData.format || 'Podcast Dialogue',
    style: projectData.style || 'High Stakes & Dramatic',
    speakerCount: projectData.speakerCount || cleanSpeakers.length,
    speakers: cleanSpeakers,
    lines: cleanLines,
    userId: user.uid,
    createdAt: projectData.createdAt || now,
    updatedAt: now,
  };

  try {
    await setDoc(doc(db, path), payload);
    return projectId;
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

/**
 * Subscribe to the current user's audio projects in real-time
 */
export function subscribeToUserProjects(callback: (projects: SavedAudioProject[]) => void): () => void {
  const user = auth.currentUser;
  if (!user) {
    callback([]);
    return () => {};
  }

  const collPath = `users/${user.uid}/projects`;
  const q = query(collection(db, collPath), orderBy('updatedAt', 'desc'));

  return onSnapshot(
    q,
    (snapshot) => {
      const items: SavedAudioProject[] = [];
      snapshot.forEach((docSnap: any) => {
        items.push(docSnap.data() as SavedAudioProject);
      });
      callback(items);
    },
    (error) => {
      handleFirestoreError(error, OperationType.LIST, collPath);
    }
  );
}

/**
 * Delete an audio project
 */
export async function deleteAudioProject(projectId: string): Promise<void> {
  const user = auth.currentUser;
  if (!user) throw new Error("Authentication required.");

  const path = `users/${user.uid}/projects/${projectId}`;
  try {
    await deleteDoc(doc(db, path));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

/**
 * Save a single-speaker monologue/script
 */
export async function saveMonologue(
  monologueData: MonologueInput
): Promise<string> {
  const user = auth.currentUser;
  if (!user) throw new Error("Authentication session required.");

  const monoId = monologueData.id && monologueData.id.trim() ? monologueData.id : `mono_${Date.now()}`;
  const now = new Date().toISOString();
  const path = `users/${user.uid}/monologues/${monoId}`;

  const payload: SavedMonologue = {
    id: monoId,
    title: monologueData.title || 'Untitled Monologue',
    styleId: monologueData.styleId || 'custom',
    voice: monologueData.voice || 'Algieba',
    text: monologueData.text,
    userId: user.uid,
    createdAt: monologueData.createdAt || now,
    updatedAt: now,
  };

  try {
    await setDoc(doc(db, path), payload);
    return monoId;
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

/**
 * Subscribe to saved monologues
 */
export function subscribeToUserMonologues(callback: (monologues: SavedMonologue[]) => void): () => void {
  const user = auth.currentUser;
  if (!user) {
    callback([]);
    return () => {};
  }

  const collPath = `users/${user.uid}/monologues`;
  const q = query(collection(db, collPath), orderBy('updatedAt', 'desc'));

  return onSnapshot(
    q,
    (snapshot) => {
      const items: SavedMonologue[] = [];
      snapshot.forEach((docSnap: any) => {
        items.push(docSnap.data() as SavedMonologue);
      });
      callback(items);
    },
    (error) => {
      handleFirestoreError(error, OperationType.LIST, collPath);
    }
  );
}

/**
 * Delete a monologue
 */
export async function deleteMonologue(monologueId: string): Promise<void> {
  const user = auth.currentUser;
  if (!user) throw new Error("Authentication required.");

  const path = `users/${user.uid}/monologues/${monologueId}`;
  try {
    await deleteDoc(doc(db, path));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

/**
 * Real-time listener for today's user usage record (read-only for clients)
 */
export function subscribeToDailyUsage(callback: (usage: UsageRecord | null) => void): () => void {
  const user = auth.currentUser;
  if (!user) {
    callback(null);
    return () => {};
  }

  const today = new Date().toISOString().split('T')[0];
  const docRef = doc(db, `users/${user.uid}/usage/${today}`);

  return onSnapshot(
    docRef,
    (snapshot) => {
      if (snapshot.exists()) {
        callback(snapshot.data() as UsageRecord);
      } else {
        callback(null);
      }
    },
    (error) => {
      console.warn("Usage snapshot warning:", error);
    }
  );
}
