/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * AudioFACTORY Early Birds — Canonical Firebase & App Check Configuration
 */
import { app, db, auth } from '../config/firebaseConfig';
import { initializeAppCheck, ReCaptchaV3Provider, getToken, AppCheck } from 'firebase/app-check';
import firebaseConfig from '../../firebase-applet-config.json';

let appCheckInstance: AppCheck | null = null;

/**
 * Initializes Firebase App Check where supported if a site key is configured.
 * Gracefully degrades when no site key is configured so WebView and dev environments remain unbroken.
 */
export function initEarlyBirdsAppCheck(): AppCheck | null {
  if (typeof window === 'undefined') return null;
  if (appCheckInstance) return appCheckInstance;

  const siteKey =
    (import.meta as any).env?.VITE_FIREBASE_APPCHECK_SITE_KEY ||
    (firebaseConfig as any).recaptchaSiteKey ||
    '';

  if (!siteKey || typeof siteKey !== 'string' || siteKey.trim().length === 0) {
    return null;
  }

  try {
    appCheckInstance = initializeAppCheck(app, {
      provider: new ReCaptchaV3Provider(siteKey.trim()),
      isTokenAutoRefreshEnabled: true,
    });
    return appCheckInstance;
  } catch (err) {
    console.warn('[AppCheck] Initialization skipped:', err instanceof Error ? err.message : String(err));
    return null;
  }
}

export async function getOptionalAppCheckToken(): Promise<string | null> {
  try {
    const instance = initEarlyBirdsAppCheck();
    if (!instance) return null;
    const result = await getToken(instance, false);
    return result?.token || null;
  } catch {
    return null;
  }
}

export { app, db, auth, firebaseConfig };
