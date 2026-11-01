/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * AudioFACTORY Official Firebase SDK Client Configuration
 *
 * Implements Firebase Redirect Best Practices for Vercel & Custom Domains:
 * https://firebase.google.com/docs/auth/web/redirect-best-practices
 */
import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getAuth,
  setPersistence,
  browserLocalPersistence,
  indexedDBLocalPersistence,
  browserSessionPersistence,
  inMemoryPersistence,
  signInWithPopup,
  linkWithPopup,
  signInWithRedirect,
  linkWithRedirect,
  getRedirectResult,
  signInWithCredential,
  linkWithCredential,
  GoogleAuthProvider,
  signInAnonymously,
  signInWithCustomToken,
  signOut,
  onAuthStateChanged,
  User,
} from 'firebase/auth';
import {
  getFirestore,
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  onSnapshot,
  getDocFromServer,
  query,
  orderBy,
} from 'firebase/firestore';
import { Capacitor } from '@capacitor/core';
import firebaseConfig from '../../firebase-applet-config.json';

export const CANONICAL_FIREBASE_AUTH_DOMAIN = 'audiofactory-eia.firebaseapp.com';

/**
 * Production domains that serve a same-origin reverse proxy for `/__/auth/**`
 * to `https://audiofactory-eia.firebaseapp.com/__/auth/**` (configured in `vercel.json` and `server.ts`).
 */
export const SAME_ORIGIN_AUTH_DOMAINS: readonly string[] = [
  'audiofactory.vercel.app',
  'www.audiofactory.vercel.app',
  'audiofactory.app',
  'www.audiofactory.app',
];

export interface AuthDomainResolutionOptions {
  hostname?: string;
  defaultAuthDomain?: string;
  envAuthDomain?: string;
  useSameOriginEnv?: string;
  isNativePlatform?: boolean;
}

/**
 * Resolves the authoritative `authDomain` for Firebase Authentication:
 * 1. Explicit `VITE_FIREBASE_AUTH_DOMAIN` override if set.
 * 2. In native Capacitor Android containers (`https://localhost`), always use `audiofactory-eia.firebaseapp.com`.
 * 3. On production custom/Vercel domains (`audiofactory.vercel.app`, `audiofactory.app`) where `/__/auth/**`
 *    is reverse-proxied, use the same-origin hostname (`window.location.hostname`) unless explicitly disabled
 *    via `VITE_FIREBASE_USE_SAME_ORIGIN_AUTH=false`. This prevents third-party `sessionStorage` partitioning
 *    ("Unable to process request due to missing initial state").
 * 4. On `localhost`, `127.0.0.1`, ephemeral preview domains (`*.run.app`), or SSR/Node tests, fall back to
 *    `audiofactory-eia.firebaseapp.com` unless `VITE_FIREBASE_USE_SAME_ORIGIN_AUTH=true`.
 */
export function resolveFirebaseAuthDomain(options: AuthDomainResolutionOptions = {}): string {
  const fallback = options.defaultAuthDomain || firebaseConfig.authDomain || CANONICAL_FIREBASE_AUTH_DOMAIN;

  const envDomain =
    options.envAuthDomain !== undefined
      ? options.envAuthDomain
      : (import.meta as any).env?.VITE_FIREBASE_AUTH_DOMAIN;

  if (typeof envDomain === 'string' && envDomain.trim().length > 0) {
    return envDomain.trim();
  }

  const isNative =
    options.isNativePlatform !== undefined
      ? options.isNativePlatform
      : typeof window !== 'undefined' && Capacitor.isNativePlatform();

  if (isNative) {
    return fallback;
  }

  const hostname =
    options.hostname !== undefined
      ? options.hostname
      : typeof window !== 'undefined' && window.location
      ? window.location.hostname
      : '';

  if (!hostname) {
    return fallback;
  }

  const sameOriginFlag =
    options.useSameOriginEnv !== undefined
      ? options.useSameOriginEnv
      : (import.meta as any).env?.VITE_FIREBASE_USE_SAME_ORIGIN_AUTH;

  if (sameOriginFlag === 'false') {
    return fallback;
  }

  const normalizedHost = hostname.toLowerCase().trim();

  if (SAME_ORIGIN_AUTH_DOMAINS.includes(normalizedHost)) {
    return normalizedHost;
  }

  if (
    sameOriginFlag === 'true' &&
    normalizedHost !== 'localhost' &&
    normalizedHost !== '127.0.0.1'
  ) {
    return normalizedHost;
  }

  return fallback;
}

export const effectiveFirebaseConfig = {
  ...firebaseConfig,
  authDomain: resolveFirebaseAuthDomain(),
};

// Initialize Firebase App instance singleton (strictly once)
export const app = getApps().length === 0 ? initializeApp(effectiveFirebaseConfig) : getApp();

// CRITICAL: Initialize Firestore using the provisioned database ID
export const db = getFirestore(app, (firebaseConfig as any).firestoreDatabaseId);

// Initialize Firebase Auth singleton
export const auth = getAuth(app);

// Configure Google Auth Provider
export const googleAuthProvider = new GoogleAuthProvider();
googleAuthProvider.setCustomParameters({
  prompt: 'select_account',
});

// Eager singleton persistence initialization so user-gesture popups do not lose transient activation
let persistenceInitPromise: Promise<void> | null = null;
let persistenceReady = false;

export function isAuthPersistenceReady(): boolean {
  return persistenceReady;
}

/**
 * Ensures Firebase Auth persistence is configured before authentication operations.
 * Cascades from browserLocalPersistence -> indexedDBLocalPersistence -> browserSessionPersistence -> inMemoryPersistence.
 */
export function ensureAuthPersistence(): Promise<void> {
  if (typeof window === 'undefined') {
    persistenceReady = true;
    return Promise.resolve();
  }

  if (persistenceInitPromise) {
    return persistenceInitPromise;
  }

  persistenceInitPromise = (async () => {
    const candidates = [
      browserLocalPersistence,
      indexedDBLocalPersistence,
      browserSessionPersistence,
      inMemoryPersistence,
    ];
    for (const persistence of candidates) {
      try {
        await setPersistence(auth, persistence);
        persistenceReady = true;
        return;
      } catch {
        // Try next persistence fallback if browser storage is restricted
      }
    }
    persistenceReady = true;
  })();

  return persistenceInitPromise;
}

// Trigger persistence initialization eagerly in browser environments
if (typeof window !== 'undefined') {
  ensureAuthPersistence().catch(() => {});
}

export {
  setPersistence,
  browserLocalPersistence,
  indexedDBLocalPersistence,
  browserSessionPersistence,
  inMemoryPersistence,
  signInWithPopup,
  linkWithPopup,
  signInWithRedirect,
  linkWithRedirect,
  getRedirectResult,
  signInWithCredential,
  linkWithCredential,
  GoogleAuthProvider,
  signInAnonymously,
  signInWithCustomToken,
  signOut,
  onAuthStateChanged,
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  onSnapshot,
  getDocFromServer,
  query,
  orderBy,
};

export type { User };
export default { app, auth, db, effectiveFirebaseConfig };
