/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * AudioFACTORY Client-Side Firebase Service with Hardened Google Auth & Redirect Recovery
 */
import {
  auth,
  db,
  effectiveFirebaseConfig,
  ensureAuthPersistence,
  isAuthPersistenceReady,
  signInWithPopup,
  linkWithPopup,
  signInWithRedirect,
  linkWithRedirect,
  getRedirectResult,
  signInWithCredential,
  linkWithCredential,
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
  googleAuthProvider,
} from '../config/firebaseConfig';
import { Capacitor } from '@capacitor/core';
import { SavedAudioProject, SavedMonologue, ProjectInput, MonologueInput, UsageRecord } from '../../types';

export { auth, db, effectiveFirebaseConfig, ensureAuthPersistence };
export type { User };

export const REDIRECT_PENDING_STORAGE_KEY = 'af_auth_redirect_pending';

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

export interface AuthEnvironmentInfo {
  isServer: boolean;
  isCapacitorNative: boolean;
  hasNativeAuthBridge: boolean;
  isAndroidWebView: boolean;
  isAndroidMobile: boolean;
  isIOSMobile: boolean;
  isMobileBrowser: boolean;
  isCrossOriginIframe: boolean;
  isSameOriginAuthProxy: boolean;
}

/**
 * Detects whether Google Sign-In is running inside Desktop Chrome, Android Chrome mobile browser,
 * iOS Safari, Android WebView (`; wv`), or Native Android Capacitor container with JS bridge.
 */
export function detectAuthEnvironment(
  customUserAgent?: string,
  customWindow?: any
): AuthEnvironmentInfo {
  const win = customWindow !== undefined ? customWindow : typeof window !== 'undefined' ? window : undefined;
  if (!win) {
    return {
      isServer: true,
      isCapacitorNative: false,
      hasNativeAuthBridge: false,
      isAndroidWebView: false,
      isAndroidMobile: false,
      isIOSMobile: false,
      isMobileBrowser: false,
      isCrossOriginIframe: false,
      isSameOriginAuthProxy: false,
    };
  }

  const ua =
    customUserAgent !== undefined
      ? customUserAgent
      : typeof navigator !== 'undefined'
      ? navigator.userAgent || ''
      : '';

  const isCapacitorNative =
    customWindow === undefined
      ? Capacitor.isNativePlatform()
      : Boolean(win.Capacitor?.isNativePlatform?.());

  const hasNativeAuthBridge = Boolean(
    typeof win.AudioFactoryNative?.startGoogleSignIn === 'function' ||
      typeof win.AudioFactoryNative?.requestGoogleSignIn === 'function' ||
      typeof win.AudioFactoryBridge?.startGoogleSignIn === 'function' ||
      typeof win.AudioFactoryBridge?.requestGoogleSignIn === 'function'
  );

  const isAndroidMobile = /Android/i.test(ua);
  const isIOSMobile = /iPhone|iPad|iPod/i.test(ua);
  const isAndroidWebView =
    isCapacitorNative ||
    /; wv\b/i.test(ua) ||
    (isAndroidMobile && /Version\/\d+\.\d+/i.test(ua));

  const isMobileBrowser = (isAndroidMobile || isIOSMobile) && !isAndroidWebView;

  let isCrossOriginIframe = false;
  try {
    if (win.self && win.top && win.self !== win.top) {
      // Accessing win.top.location.hostname throws SecurityError if cross-origin
      const topHost = win.top.location?.hostname;
      isCrossOriginIframe = !topHost || topHost !== win.location?.hostname;
    }
  } catch {
    isCrossOriginIframe = true;
  }

  const currentHostname = (win.location?.hostname || '').toLowerCase();
  const isSameOriginAuthProxy =
    Boolean(currentHostname) &&
    effectiveFirebaseConfig.authDomain.toLowerCase() === currentHostname;

  return {
    isServer: false,
    isCapacitorNative,
    hasNativeAuthBridge,
    isAndroidWebView,
    isAndroidMobile,
    isIOSMobile,
    isMobileBrowser,
    isCrossOriginIframe,
    isSameOriginAuthProxy,
  };
}

/**
 * Safely writes/clears redirect markers in sessionStorage and clears stale Firebase pending redirect entries
 * when recovering from a `missing initial state` or partitioned storage error.
 */
export function markRedirectPending(mode: 'signin' | 'link'): void {
  if (typeof window === 'undefined') return;
  try {
    window.sessionStorage.setItem(
      REDIRECT_PENDING_STORAGE_KEY,
      JSON.stringify({ mode, ts: Date.now() })
    );
  } catch {
    // Ignore if sessionStorage is unavailable
  }
}

export function clearRedirectPendingState(): void {
  if (typeof window === 'undefined') return;
  try {
    window.sessionStorage.removeItem(REDIRECT_PENDING_STORAGE_KEY);
    const keysToRemove: string[] = [];
    for (let i = 0; i < window.sessionStorage.length; i++) {
      const k = window.sessionStorage.key(i);
      if (k && (k.startsWith('firebase:pendingRedirect:') || k.startsWith('firebase:redirectUser:'))) {
        keysToRemove.push(k);
      }
    }
    for (const k of keysToRemove) {
      window.sessionStorage.removeItem(k);
    }
  } catch {
    // Ignore storage access errors
  }
}

/**
 * Converts raw Firebase Auth error codes into clear, user-friendly recovery messages
 * without exposing sensitive tokens or internal credentials.
 */
export function formatAuthErrorMessage(err: any): string {
  const code = String(err?.code || '');
  const message = String(err?.message || '');

  if (
    code === 'auth/missing-initial-state' ||
    message.toLowerCase().includes('missing initial state') ||
    message.toLowerCase().includes('sessionstorage is inaccessible')
  ) {
    return 'Browser session state expired or was partitioned during redirect. Please tap "Sign In with Google" again.';
  }

  if (code === 'auth/popup-closed-by-user' || code === 'auth/cancelled-popup-request') {
    return 'Google sign-in window was closed before completing authentication.';
  }

  if (code === 'auth/popup-blocked') {
    return 'Sign-in popup was blocked by your browser. Please allow popups or try again.';
  }

  if (code === 'auth/network-request-failed') {
    return 'Network error while connecting to Google Authentication. Please check your internet connection.';
  }

  if (code === 'auth/unauthorized-domain') {
    return 'This domain is not yet authorized in Firebase Authentication settings.';
  }

  return message || 'Authentication failed. Please try again.';
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
      providerInfo:
        auth.currentUser?.providerData?.map((provider) => ({
          providerId: provider.providerId,
          email: provider.email,
        })) || [],
    },
    operationType,
    path,
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

/**
 * Validate connection to Firestore on boot (distinguishing reachable server vs offline vs invalid config)
 */
export async function testFirestoreConnection(): Promise<boolean> {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
    console.log('[Firestore] Health check: Document test/connection retrieved successfully.');
    return true;
  } catch (error: any) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    const errorCode = error?.code || '';

    if (errorCode === 'not-found' || errorCode === 'permission-denied' || errorCode === 'unauthenticated') {
      console.log(`[Firestore] Health check: Backend reachable (Server status: ${errorCode}).`);
      return true;
    }

    if (
      errorCode === 'unavailable' ||
      errorCode === 'failed-precondition' ||
      errorMsg.includes('the client is offline') ||
      errorMsg.includes('unavailable') ||
      errorMsg.includes('Could not reach Cloud Firestore backend')
    ) {
      console.warn('[Firestore] Health check: Operating in offline / local cache mode.');
      return false;
    }

    if (errorCode === 'invalid-argument' || errorMsg.includes('Database') || errorMsg.includes('projectId')) {
      console.error('[Firestore] Health check failed: Invalid database selection or project config.');
      return false;
    }

    console.warn('[Firestore] Health check notice:', errorCode);
    return false;
  }
}

/**
 * Native Android Authentication Bridge Handoff:
 * Invoked when Android layer passes a Google ID token via `window.AudioFactoryNative.onGoogleIdToken(idToken)`
 */
let isAuthenticatingNative = false;

export async function handleNativeGoogleIdToken(idToken: string): Promise<User> {
  if (!idToken || typeof idToken !== 'string' || idToken.trim().length === 0) {
    const errMsg = 'Invalid or empty Google ID token received from native bridge.';
    console.error('[Auth Bridge]', errMsg);
    notifyAndroidAuthResult(false, errMsg);
    throw new Error(errMsg);
  }

  if (isAuthenticatingNative) {
    console.warn('[Auth Bridge] Authentication attempt already in progress. Suppressing duplicate call.');
    throw new Error('Authentication in progress');
  }

  isAuthenticatingNative = true;

  try {
    await ensureAuthPersistence();
    const credential = GoogleAuthProvider.credential(idToken);
    const currentUser = auth.currentUser;

    let userCredential: any;

    if (currentUser && currentUser.isAnonymous) {
      try {
        console.log('[Auth Bridge] Linking existing anonymous account with native Google credential...');
        userCredential = await linkWithCredential(currentUser, credential);
        console.log('[Auth Bridge] Successfully linked guest account to Google.');
      } catch (linkError: any) {
        if (
          linkError.code === 'auth/credential-already-in-use' ||
          linkError.code === 'auth/email-already-in-use' ||
          linkError.code === 'auth/provider-already-linked'
        ) {
          console.log('[Auth Bridge] Credential already associated with existing user. Signing in directly...');
          userCredential = await signInWithCredential(auth, credential);
        } else {
          throw linkError;
        }
      }
    } else {
      console.log('[Auth Bridge] Signing in with native Google credential...');
      userCredential = await signInWithCredential(auth, credential);
    }

    const user = userCredential.user;
    console.log('[Auth Bridge] Native authentication succeeded for UID:', user.uid);

    notifyAndroidAuthResult(true);
    return user;
  } catch (error: any) {
    const errorCode = error?.code || 'auth/unknown-error';
    const errorMessage = error?.message || 'Native authentication failed';
    console.error('[Auth Bridge] Error during native token sign-in:', errorCode);

    notifyAndroidAuthResult(false, `${errorCode}: ${errorMessage}`);
    throw error;
  } finally {
    isAuthenticatingNative = false;
  }
}

function notifyAndroidAuthResult(success: boolean, error?: string) {
  try {
    if ((window as any).AudioFactoryNative?.onAuthResult) {
      (window as any).AudioFactoryNative.onAuthResult(success, error);
    }
    if ((window as any).AudioFactoryBridge?.onAuthResult) {
      (window as any).AudioFactoryBridge.onAuthResult(success, error);
    }
  } catch (e) {
    console.warn('[Auth Bridge] Could not notify native layer:', e);
  }
}

/**
 * Register global window.AudioFactoryNative contract for Android WebView
 */
export function registerNativeAuthBridge() {
  if (typeof window === 'undefined') return;

  if (!(window as any).AudioFactoryNative) {
    (window as any).AudioFactoryNative = {};
  }

  (window as any).AudioFactoryNative.onGoogleIdToken = async (idToken: string) => {
    try {
      await handleNativeGoogleIdToken(idToken);
    } catch {
      // Error notifications sent inside handleNativeGoogleIdToken
    }
  };

  console.log('[Auth Bridge] Registered window.AudioFactoryNative.onGoogleIdToken contract.');
}

/**
 * Singleton redirect recovery state so `getRedirectResult` is processed once per boot
 * and never overwritten by anonymous guest sign-in.
 */
let initialRedirectCheckPromise: Promise<User | null> | null = null;
let lastRedirectError: string | null = null;

export function getLastRedirectError(): string | null {
  return lastRedirectError;
}

export function clearLastRedirectError(): void {
  lastRedirectError = null;
}

export function resetRedirectCheckForTesting(): void {
  initialRedirectCheckPromise = null;
  lastRedirectError = null;
}

/**
 * Processes `getRedirectResult(auth)` exactly once during application startup.
 * Handles account-linking collisions (`auth/credential-already-in-use`) via `credentialFromError`
 * and cleans up partitioned/corrupted `sessionStorage` if `auth/missing-initial-state` occurs.
 */
export function checkRedirectResult(): Promise<User | null> {
  if (typeof window === 'undefined') {
    return Promise.resolve(null);
  }

  if (initialRedirectCheckPromise) {
    return initialRedirectCheckPromise;
  }

  initialRedirectCheckPromise = (async () => {
    try {
      await ensureAuthPersistence();
      const result = await getRedirectResult(auth);
      clearRedirectPendingState();

      if (result && result.user) {
        console.log('[Auth] Successfully authenticated from redirect for UID:', result.user.uid);
        return result.user;
      }
    } catch (err: any) {
      clearRedirectPendingState();
      const code = String(err?.code || '');

      // If `linkWithRedirect` was used with a Google account that already exists in Firebase,
      // recover immediately by signing in with the returned OAuth credential!
      if (
        code === 'auth/credential-already-in-use' ||
        code === 'auth/email-already-in-use' ||
        code === 'auth/provider-already-linked'
      ) {
        try {
          const existingCredential = GoogleAuthProvider.credentialFromError(err);
          if (existingCredential) {
            const signedIn = await signInWithCredential(auth, existingCredential);
            console.log('[Auth] Recovered existing Google account from redirect for UID:', signedIn.user.uid);
            return signedIn.user;
          }
        } catch (credErr: any) {
          lastRedirectError = formatAuthErrorMessage(credErr);
          console.warn('[Auth] Redirect credential recovery error:', credErr?.code || 'unknown');
          return null;
        }
      }

      lastRedirectError = formatAuthErrorMessage(err);
      console.warn('[Auth] Redirect result error code:', code || 'auth/redirect-error');
    }
    return null;
  })();

  return initialRedirectCheckPromise;
}

/**
 * Core Account-Linking + Popup/Redirect Sign-In Execution with Concurrent Request Lock.
 *
 * Why this fixes the Android Chrome & Vercel `missing initial state` failure:
 * 1. Previously, when an anonymous guest signed in with an existing Google account, `linkWithPopup`
 *    threw `auth/credential-already-in-use`. The catch block then called a SECOND `signInWithPopup`
 *    after the async `await`, which lost user-gesture activation and triggered Android Chrome's popup
 *    blocker (`auth/popup-blocked`), forcing a cross-origin `signInWithRedirect` to `firebaseapp.com`
 *    where partitioned `sessionStorage` failed with `missing initial state`.
 * 2. Now, when `linkWithPopup` throws `auth/credential-already-in-use`, we extract the OAuth credential
 *    directly via `GoogleAuthProvider.credentialFromError(err)` and call `signInWithCredential(auth, cred)`
 *    immediately—completing sign-in in 1 step with zero second popup and zero unnecessary redirect.
 * 3. When a redirect IS required (e.g., Android WebView or popup-blocked mobile browser), `/__/auth/**`
 *    is reverse-proxied on the same origin (`audiofactory.vercel.app`), preserving first-party `sessionStorage`.
 */
let activeGoogleSignInPromise: Promise<{ user: User; linked: boolean }> | null = null;

export interface GoogleAuthDependencies {
  authInstance?: any;
  provider?: any;
  linkWithPopupFn?: typeof linkWithPopup;
  signInWithPopupFn?: typeof signInWithPopup;
  signInWithCredentialFn?: typeof signInWithCredential;
  signInWithRedirectFn?: typeof signInWithRedirect;
  linkWithRedirectFn?: typeof linkWithRedirect;
  credentialFromErrorFn?: typeof GoogleAuthProvider.credentialFromError;
  envInfo?: AuthEnvironmentInfo;
}

export async function executeGoogleSignInFlow(
  preferAccountLinking: boolean,
  deps: GoogleAuthDependencies = {}
): Promise<{ user: User; linked: boolean }> {
  if (activeGoogleSignInPromise) {
    return activeGoogleSignInPromise;
  }

  const authInst = deps.authInstance || auth;
  const provider = deps.provider || googleAuthProvider;
  const doLinkWithPopup = deps.linkWithPopupFn || linkWithPopup;
  const doSignInWithPopup = deps.signInWithPopupFn || signInWithPopup;
  const doSignInWithCredential = deps.signInWithCredentialFn || signInWithCredential;
  const doSignInWithRedirect = deps.signInWithRedirectFn || signInWithRedirect;
  const doLinkWithRedirect = deps.linkWithRedirectFn || linkWithRedirect;
  const extractCredential =
    deps.credentialFromErrorFn || ((e: any) => GoogleAuthProvider.credentialFromError(e));
  const env = deps.envInfo || detectAuthEnvironment();

  activeGoogleSignInPromise = (async () => {
    try {
      clearLastRedirectError();

      // Only await persistence if not already synchronously initialized so user gesture is preserved for popups
      if (!isAuthPersistenceReady()) {
        await ensureAuthPersistence();
      }

      // 1. If Native Android JS Bridge provides an explicit trigger, invoke it
      if (env.hasNativeAuthBridge && typeof window !== 'undefined') {
        const nativeTrigger =
          (window as any).AudioFactoryNative?.startGoogleSignIn ||
          (window as any).AudioFactoryNative?.requestGoogleSignIn ||
          (window as any).AudioFactoryBridge?.startGoogleSignIn ||
          (window as any).AudioFactoryBridge?.requestGoogleSignIn;

        if (typeof nativeTrigger === 'function') {
          nativeTrigger();
          return await new Promise<{ user: User; linked: boolean }>((resolve, reject) => {
            const timeout = setTimeout(() => {
              unsub();
              reject(new Error('Native Google Sign-In timed out.'));
            }, 60000);
            const unsub = onAuthStateChanged(authInst, (u) => {
              if (u && !u.isAnonymous) {
                clearTimeout(timeout);
                unsub();
                resolve({ user: u, linked: false });
              }
            });
          });
        }
      }

      // 2. If inside an embedded Android WebView (non-iframe) where `window.open` popups are unsupported,
      //    initiate redirect directly if not in a cross-origin sandboxed iframe.
      if (env.isAndroidWebView && !env.isCrossOriginIframe && !env.isCapacitorNative) {
        markRedirectPending('signin');
        await doSignInWithRedirect(authInst, provider);
        return await new Promise<{ user: User; linked: boolean }>(() => {});
      }

      const currentUser = authInst.currentUser;

      // 3. Anonymous guest account linking path
      if (preferAccountLinking && currentUser && currentUser.isAnonymous) {
        try {
          const result = await doLinkWithPopup(currentUser, provider);
          return { user: result.user, linked: true };
        } catch (err: any) {
          const code = String(err?.code || '');

          // CRITICAL FIX: Extract OAuth credential from error instead of opening a second blocked popup!
          if (
            code === 'auth/credential-already-in-use' ||
            code === 'auth/email-already-in-use' ||
            code === 'auth/provider-already-linked'
          ) {
            const existingCred = extractCredential(err);
            if (existingCred) {
              const credentialResult = await doSignInWithCredential(authInst, existingCred);
              return { user: credentialResult.user, linked: false };
            }

            // Fallback if credential was not attached to the error object
            if (!env.isCrossOriginIframe) {
              markRedirectPending('signin');
              await doSignInWithRedirect(authInst, provider);
              return await new Promise<{ user: User; linked: boolean }>(() => {});
            }
          }

          if (
            (code === 'auth/popup-blocked' ||
              code === 'auth/operation-not-supported-in-this-environment') &&
            !env.isCrossOriginIframe
          ) {
            console.log('[Auth] Popup unavailable on device; falling back to same-origin redirect...');
            markRedirectPending('link');
            // Use signInWithRedirect so both new and existing Google accounts succeed on redirect return
            await doSignInWithRedirect(authInst, provider);
            return await new Promise<{ user: User; linked: boolean }>(() => {});
          }

          throw new Error(formatAuthErrorMessage(err));
        }
      }

      // 4. Direct Google Sign-In path
      try {
        const credential = await doSignInWithPopup(authInst, provider);
        return { user: credential.user, linked: false };
      } catch (err: any) {
        const code = String(err?.code || '');
        if (
          (code === 'auth/popup-blocked' ||
            code === 'auth/operation-not-supported-in-this-environment') &&
          !env.isCrossOriginIframe
        ) {
          console.log('[Auth] Popup unavailable on device; falling back to same-origin redirect...');
          markRedirectPending('signin');
          await doSignInWithRedirect(authInst, provider);
          return await new Promise<{ user: User; linked: boolean }>(() => {});
        }
        throw new Error(formatAuthErrorMessage(err));
      }
    } finally {
      activeGoogleSignInPromise = null;
    }
  })();

  return activeGoogleSignInPromise;
}

/**
 * Google Sign In / Sign Up handler using GoogleAuthProvider with popup and same-origin redirect fallback
 */
export async function signInWithGoogle(): Promise<{ user: User; isNewUser?: boolean }> {
  const result = await executeGoogleSignInFlow(false);
  return { user: result.user };
}

/**
 * Google Sign In with Account Linking:
 * Links anonymous guest account to Google without losing existing UID and work,
 * recovering seamlessly via `credentialFromError` when the Google account already exists.
 */
export async function linkOrSignInWithGoogle(): Promise<{ user: User; linked: boolean }> {
  return executeGoogleSignInFlow(true);
}

/**
 * Explicit Anonymous Sign In for Guest Mode
 */
export async function signInAnonymously(): Promise<User> {
  await ensureAuthPersistence();
  const credential = await firebaseSignInAnonymously(auth);
  return credential.user;
}

/**
 * Sign out
 */
export async function signOutUser(): Promise<void> {
  clearRedirectPendingState();
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
export async function saveAudioProject(projectData: ProjectInput): Promise<string> {
  const user = auth.currentUser;
  if (!user) throw new Error('Authentication session required to save projects.');

  const projectId = projectData.id && projectData.id.trim() ? projectData.id : `proj_${Date.now()}`;
  const now = new Date().toISOString();
  const path = `users/${user.uid}/projects/${projectId}`;

  const cleanLines = (projectData.lines || []).map((line) => ({
    id: line.id,
    speaker: line.speaker,
    text: line.text,
    scene: line.scene || 'Scene 1',
    emotion: line.emotion || 'Natural',
  }));

  const cleanSpeakers = (projectData.speakers || []).map((s) => ({
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
  if (!user) throw new Error('Authentication required.');

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
export async function saveMonologue(monologueData: MonologueInput): Promise<string> {
  const user = auth.currentUser;
  if (!user) throw new Error('Authentication session required.');

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
  if (!user) throw new Error('Authentication required.');

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
      console.warn('Usage snapshot warning:', error);
    }
  );
}
