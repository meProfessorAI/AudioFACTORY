/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * AudioFACTORY Firebase Authentication & Data Context
 */
import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import {
  User,
  auth,
  ensureAuthPersistence,
  signInWithGoogle,
  linkOrSignInWithGoogle,
  signInAnonymously,
  signOutUser,
  subscribeToAuth,
  subscribeToUserProjects,
  subscribeToUserMonologues,
  subscribeToDailyUsage,
  saveAudioProject,
  deleteAudioProject,
  saveMonologue,
  deleteMonologue,
  testFirestoreConnection,
  checkRedirectResult,
  getLastRedirectError,
  clearLastRedirectError,
  registerNativeAuthBridge,
} from './firebaseService';
import { SavedAudioProject, SavedMonologue, ProjectInput, MonologueInput, UsageRecord } from '../../types';

export interface FirebaseContextType {
  user: User | null;
  isGuest: boolean;
  authLoading: boolean;
  isOnline: boolean;
  loginGoogle: () => Promise<void>;
  signInWithGoogleProvider: () => Promise<User>;
  loginGuest: () => Promise<void>;
  logout: () => Promise<void>;
  savedProjects: SavedAudioProject[];
  savedMonologues: SavedMonologue[];
  liveUsage: UsageRecord | null;
  saveProjectToCloud: (project: ProjectInput) => Promise<string>;
  removeProjectFromCloud: (id: string) => Promise<void>;
  saveMonologueToCloud: (monologue: MonologueInput) => Promise<string>;
  removeMonologueFromCloud: (id: string) => Promise<void>;
  isSaving: boolean;
  statusMessage: { text: string; type: 'success' | 'error' | 'info' } | null;
  clearStatusMessage: () => void;
  deleteAccountData: () => Promise<void>;
  getIdToken: () => Promise<string | null>;
}

const FirebaseContext = createContext<FirebaseContextType | null>(null);

export const FirebaseProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState<boolean>(true);
  const [isOnline, setIsOnline] = useState<boolean>(true);
  const [savedProjects, setSavedProjects] = useState<SavedAudioProject[]>([]);
  const [savedMonologues, setSavedMonologues] = useState<SavedMonologue[]>([]);
  const [liveUsage, setLiveUsage] = useState<UsageRecord | null>(null);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<{ text: string; type: 'success' | 'error' | 'info' } | null>(null);

  // 1. Test Firestore connectivity & register native auth bridge on boot
  useEffect(() => {
    registerNativeAuthBridge();
    testFirestoreConnection().then((online) => {
      setIsOnline(online);
    });
  }, []);

  // 2. Auth Session initialization & real-time state listener
  // CRITICAL LIFECYCLE ORDER:
  // First await persistence and `checkRedirectResult()` BEFORE allowing anonymous fallback sign-in,
  // ensuring `signInAnonymously()` never races with or overwrites a returning Google OAuth redirect!
  useEffect(() => {
    let isMounted = true;
    let isSigningInGuest = false;
    let unsubscribeAuth: (() => void) | null = null;

    const initializeAuthLifecycle = async () => {
      try {
        await ensureAuthPersistence();
        const redirectUser = await checkRedirectResult();

        if (!isMounted) return;

        if (redirectUser) {
          setUser(redirectUser);
          setAuthLoading(false);
          setStatusMessage({
            text: `Signed in as ${redirectUser.displayName || redirectUser.email || 'Creator'}. Projects synced.`,
            type: 'success',
          });
        } else {
          const redirectErr = getLastRedirectError();
          if (redirectErr) {
            setStatusMessage({
              text: redirectErr,
              type: 'error',
            });
            clearLastRedirectError();
          }
        }
      } catch (err) {
        console.warn('[Auth] Redirect initialization warning:', err instanceof Error ? err.message : 'Unknown error');
      }

      if (!isMounted) return;

      unsubscribeAuth = subscribeToAuth(async (currentUser) => {
        if (!isMounted) return;

        if (currentUser) {
          setUser(currentUser);
          setAuthLoading(false);
        } else {
          if (isSigningInGuest) return;
          isSigningInGuest = true;
          setAuthLoading(true);
          // Fallback to anonymous guest session only after redirect result has been resolved
          try {
            const guest = await signInAnonymously();
            if (isMounted) {
              setUser(guest);
            }
          } catch (err) {
            console.warn('[Auth] Could not establish anonymous guest session:', err instanceof Error ? err.message : 'Unknown error');
          } finally {
            isSigningInGuest = false;
            if (isMounted) {
              setAuthLoading(false);
            }
          }
        }
      });
    };

    initializeAuthLifecycle();

    return () => {
      isMounted = false;
      if (unsubscribeAuth) {
        unsubscribeAuth();
      }
    };
  }, []);

  // 3. Real-time subscription to user projects, monologues, and usage records
  useEffect(() => {
    if (!user || !user.uid) {
      setSavedProjects([]);
      setSavedMonologues([]);
      setLiveUsage(null);
      return;
    }

    const unsubProjects = subscribeToUserProjects((projects) => {
      setSavedProjects(projects);
    }, user.uid);

    const unsubMonologues = subscribeToUserMonologues((monologues) => {
      setSavedMonologues(monologues);
    }, user.uid);

    const unsubUsage = subscribeToDailyUsage((usage) => {
      setLiveUsage(usage);
    }, user.uid);

    return () => {
      unsubProjects();
      unsubMonologues();
      unsubUsage();
    };
  }, [user]);

  /**
   * Google Sign Up / Sign In Handler using Google Provider
   */
  const signInWithGoogleProvider = useCallback(async (): Promise<User> => {
    try {
      setAuthLoading(true);
      const res = await signInWithGoogle();
      setUser(res.user);
      setStatusMessage({
        text: `Welcome, ${res.user.displayName || res.user.email || 'Creator'}! Synced with Google Account.`,
        type: 'success',
      });
      return res.user;
    } catch (err: any) {
      console.error('Google sign in failed:', err?.message || 'Error');
      setStatusMessage({
        text: `Sign-in failed: ${err.message || 'Please try again'}`,
        type: 'error',
      });
      throw err;
    } finally {
      setAuthLoading(false);
    }
  }, []);

  /**
   * Google Sign In with Account Linking (preserves existing drafts/work when logging in from guest mode)
   */
  const loginGoogle = useCallback(async () => {
    try {
      setAuthLoading(true);
      const result = await linkOrSignInWithGoogle();
      setUser(result.user);

      if (result.linked) {
        setStatusMessage({
          text: `Success! Linked Google account (${result.user.email || 'Creator'}). All projects & quota preserved!`,
          type: 'success',
        });
      } else {
        setStatusMessage({
          text: `Signed in as ${result.user.displayName || result.user.email || 'Creator'}. Projects synced.`,
          type: 'success',
        });
      }
    } catch (err: any) {
      console.error('Google sign in error:', err?.message || 'Error');
      setStatusMessage({
        text: `Google Sign In failed: ${err.message || 'Please try again'}`,
        type: 'error',
      });
      throw err;
    } finally {
      setAuthLoading(false);
    }
  }, []);

  /**
   * Guest Login explicitly
   */
  const loginGuest = useCallback(async () => {
    try {
      setAuthLoading(true);
      const guest = await signInAnonymously();
      setUser(guest);
      setStatusMessage({ text: 'Guest session active.', type: 'info' });
    } catch (err: any) {
      console.error('Guest sign in error:', err?.message || 'Error');
      setStatusMessage({ text: `Guest sign in failed: ${err.message || 'Please try again'}`, type: 'error' });
      throw err;
    } finally {
      setAuthLoading(false);
    }
  }, []);

  /**
   * Sign Out
   */
  const logout = useCallback(async () => {
    try {
      setAuthLoading(true);
      setSavedProjects([]);
      setSavedMonologues([]);
      setLiveUsage(null);
      await signOutUser();

      // Re-establish guest session
      const newGuest = await signInAnonymously();
      setUser(newGuest);
      setStatusMessage({ text: 'Signed out successfully.', type: 'info' });
    } catch (err: any) {
      console.error('Sign out error:', err?.message || 'Error');
      setStatusMessage({ text: `Sign out failed: ${err.message}`, type: 'error' });
    } finally {
      setAuthLoading(false);
    }
  }, []);

  const saveProjectToCloud = async (project: ProjectInput): Promise<string> => {
    if (!user) {
      throw new Error('Cannot save: No active authentication session.');
    }

    setIsSaving(true);
    try {
      const id = await saveAudioProject(project);
      setStatusMessage({ text: `Saved "${project.title}" to cloud!`, type: 'success' });
      return id;
    } catch (err: any) {
      console.error('Save project error:', err);
      setStatusMessage({ text: `Failed to save project: ${err.message || 'Error occurred'}`, type: 'error' });
      throw err;
    } finally {
      setIsSaving(false);
    }
  };

  const removeProjectFromCloud = async (id: string): Promise<void> => {
    try {
      await deleteAudioProject(id);
      setStatusMessage({ text: 'Project deleted from cloud.', type: 'info' });
    } catch (err: any) {
      console.error('Delete project error:', err);
      setStatusMessage({ text: `Failed to delete: ${err.message}`, type: 'error' });
      throw err;
    }
  };

  const saveMonologueToCloud = async (monologue: MonologueInput): Promise<string> => {
    if (!user) {
      throw new Error('Cannot save: No active authentication session.');
    }

    setIsSaving(true);
    try {
      const id = await saveMonologue(monologue);
      setStatusMessage({ text: `Saved monologue "${monologue.title}" to cloud!`, type: 'success' });
      return id;
    } catch (err: any) {
      console.error('Save monologue error:', err);
      setStatusMessage({ text: `Failed to save monologue: ${err.message || 'Error occurred'}`, type: 'error' });
      throw err;
    } finally {
      setIsSaving(false);
    }
  };

  const removeMonologueFromCloud = async (id: string): Promise<void> => {
    try {
      await deleteMonologue(id);
      setStatusMessage({ text: 'Monologue removed from cloud.', type: 'info' });
    } catch (err: any) {
      console.error('Delete monologue error:', err);
      setStatusMessage({ text: `Failed to delete: ${err.message}`, type: 'error' });
      throw err;
    }
  };

  const clearStatusMessage = () => setStatusMessage(null);

  const deleteAccountData = async (): Promise<void> => {
    try {
      if (user) {
        for (const p of savedProjects) {
          try {
            await deleteAudioProject(p.id);
          } catch {}
        }
        for (const m of savedMonologues) {
          try {
            await deleteMonologue(m.id);
          } catch {}
        }
        try {
          if (user.delete) {
            await user.delete();
          } else {
            await signOutUser();
          }
        } catch {
          await signOutUser();
        }
      }
      setSavedProjects([]);
      setSavedMonologues([]);
      setStatusMessage({ text: 'Account data deleted successfully.', type: 'info' });
    } catch (err: any) {
      console.error('Error deleting account:', err);
      throw err;
    }
  };

  const getIdToken = async (): Promise<string | null> => {
    if (!user) return null;
    try {
      return await user.getIdToken();
    } catch {
      return null;
    }
  };

  const isGuest = !user || user.isAnonymous;

  return (
    <FirebaseContext.Provider
      value={{
        user,
        isGuest,
        authLoading,
        isOnline,
        loginGoogle,
        signInWithGoogleProvider,
        loginGuest,
        logout,
        savedProjects,
        savedMonologues,
        liveUsage,
        saveProjectToCloud,
        removeProjectFromCloud,
        saveMonologueToCloud,
        removeMonologueFromCloud,
        isSaving,
        statusMessage,
        clearStatusMessage,
        deleteAccountData,
        getIdToken,
      }}
    >
      {children}
    </FirebaseContext.Provider>
  );
};

export const useFirebase = (): FirebaseContextType => {
  const context = useContext(FirebaseContext);
  if (!context) {
    throw new Error('useFirebase must be used within a FirebaseProvider');
  }
  return context;
};

// Aliases for compatibility
export const FirebaseAuthProvider = FirebaseProvider;
export const useAuth = useFirebase;
export default FirebaseProvider;
