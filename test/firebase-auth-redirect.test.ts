import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {
  resolveFirebaseAuthDomain,
  CANONICAL_FIREBASE_AUTH_DOMAIN,
  ensureAuthPersistence,
  isAuthPersistenceReady,
} from '../src/config/firebaseConfig';
import {
  detectAuthEnvironment,
  executeGoogleSignInFlow,
  formatAuthErrorMessage,
} from '../src/services/firebaseService';
import {
  redactAuthUrl,
  serializeProxyRequestBody,
  FIREBASE_HOSTING_ORIGIN,
} from '../backend/firebaseAuthProxy';

describe('AudioFACTORY Firebase Google Authentication Redirect & Proxy Verification Suite', () => {
  it('1. Vercel Reverse Proxy Configuration: /__/auth/:path* and /__/firebase/:path* precede SPA catch-all rewrite', () => {
    const vercelConfigPath = path.resolve(process.cwd(), 'vercel.json');
    const vercelConfig = JSON.parse(fs.readFileSync(vercelConfigPath, 'utf-8'));

    assert.ok(Array.isArray(vercelConfig.rewrites), 'vercel.json must define rewrites array');

    const authIdx = vercelConfig.rewrites.findIndex(
      (r: any) =>
        r.source === '/__/auth/:path*' &&
        r.destination === 'https://audiofactory-eia.firebaseapp.com/__/auth/:path*'
    );
    const firebaseIdx = vercelConfig.rewrites.findIndex(
      (r: any) =>
        r.source === '/__/firebase/:path*' &&
        r.destination === 'https://audiofactory-eia.firebaseapp.com/__/firebase/:path*'
    );
    const spaIdx = vercelConfig.rewrites.findIndex((r: any) => r.source === '/(.*)');

    assert.notEqual(authIdx, -1, 'vercel.json must proxy /__/auth/:path* to audiofactory-eia.firebaseapp.com');
    assert.notEqual(firebaseIdx, -1, 'vercel.json must proxy /__/firebase/:path* to audiofactory-eia.firebaseapp.com');
    assert.ok(authIdx < spaIdx, '/__/auth/:path* rewrite must appear BEFORE /(.*) SPA catch-all');
    assert.ok(firebaseIdx < spaIdx, '/__/firebase/:path* rewrite must appear BEFORE /(.*) SPA catch-all');
  });

  it('2. Express Auth Proxy Security: Redacts OAuth code, state, id_token, and access_token from URLs', () => {
    assert.equal(FIREBASE_HOSTING_ORIGIN, 'https://audiofactory-eia.firebaseapp.com');

    const sensitiveUrl =
      '/__/auth/handler?code=4/0AeaYSHB_secret_oauth_code&state=AMbd123_state&id_token=eyJhbGciOi&providerId=google.com';
    const redacted = redactAuthUrl(sensitiveUrl);

    assert.equal(redacted.includes('4/0AeaYSHB_secret_oauth_code'), false, 'OAuth code must be redacted');
    assert.equal(redacted.includes('AMbd123_state'), false, 'OAuth state must be redacted');
    assert.equal(redacted.includes('eyJhbGciOi'), false, 'ID token must be redacted');
    assert.equal(redacted.includes('providerId=google.com'), true, 'Non-sensitive params remain intact');
  });

  it('3. Express Auth Proxy POST Support: Serializes form_post and JSON bodies while skipping GET/HEAD', () => {
    const getBody = serializeProxyRequestBody({ method: 'GET', headers: {}, body: { a: 1 } } as any);
    assert.equal(getBody, undefined);

    const formBody = serializeProxyRequestBody({
      method: 'POST',
      headers: { 'content-type': 'application/x-www-form-urlencoded' },
      body: { state: 'xyz', code: 'abc' },
    } as any);
    assert.equal(formBody, 'state=xyz&code=abc');

    const jsonBody = serializeProxyRequestBody({
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: { eventId: '123' },
    } as any);
    assert.equal(jsonBody, JSON.stringify({ eventId: '123' }));
  });

  it('4. Same-Origin AuthDomain Resolution: Resolves audiofactory.vercel.app on production Vercel deployment', () => {
    // Production Vercel domain -> uses same-origin authDomain
    assert.equal(
      resolveFirebaseAuthDomain({
        hostname: 'audiofactory.vercel.app',
        isNativePlatform: false,
      }),
      'audiofactory.vercel.app'
    );

    // Custom domain -> uses same-origin authDomain
    assert.equal(
      resolveFirebaseAuthDomain({
        hostname: 'audiofactory.app',
        isNativePlatform: false,
      }),
      'audiofactory.app'
    );

    // Capacitor Android Native container (https://localhost) -> preserves canonical firebaseapp.com domain
    assert.equal(
      resolveFirebaseAuthDomain({
        hostname: 'localhost',
        isNativePlatform: true,
      }),
      CANONICAL_FIREBASE_AUTH_DOMAIN
    );

    // Local development -> preserves canonical firebaseapp.com domain
    assert.equal(
      resolveFirebaseAuthDomain({
        hostname: 'localhost',
        isNativePlatform: false,
      }),
      CANONICAL_FIREBASE_AUTH_DOMAIN
    );

    // Explicit env override -> takes precedence
    assert.equal(
      resolveFirebaseAuthDomain({
        hostname: 'staging.audiofactory.vercel.app',
        envAuthDomain: 'custom.auth.audiofactory.app',
      }),
      'custom.auth.audiofactory.app'
    );
  });

  it('5. Environment Detection: Distinguishes Android Chrome, Desktop Chrome, Android WebView, and Native Bridge', () => {
    const mockWin = (hostname: string, extra: Record<string, any> = {}) => ({
      location: { hostname },
      self: {},
      top: {},
      ...extra,
    });
    const sameWin = mockWin('audiofactory.vercel.app');
    sameWin.top = sameWin.self;

    // Android Chrome mobile browser
    const androidChromeEnv = detectAuthEnvironment(
      'Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Mobile Safari/537.36',
      sameWin
    );
    assert.equal(androidChromeEnv.isAndroidMobile, true);
    assert.equal(androidChromeEnv.isAndroidWebView, false);
    assert.equal(androidChromeEnv.isMobileBrowser, true);

    // Android WebView (; wv)
    const androidWebViewEnv = detectAuthEnvironment(
      'Mozilla/5.0 (Linux; Android 14; Pixel 8 Build/UQ1A; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/124.0.0.0 Mobile Safari/537.36',
      sameWin
    );
    assert.equal(androidWebViewEnv.isAndroidWebView, true);
    assert.equal(androidWebViewEnv.isMobileBrowser, false);

    // Desktop Chrome
    const desktopChromeEnv = detectAuthEnvironment(
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
      sameWin
    );
    assert.equal(desktopChromeEnv.isMobileBrowser, false);
    assert.equal(desktopChromeEnv.isAndroidWebView, false);

    // Native Android JS Bridge
    const bridgeWin = mockWin('localhost', {
      AudioFactoryNative: { startGoogleSignIn: () => {} },
    });
    bridgeWin.top = bridgeWin.self;
    const nativeBridgeEnv = detectAuthEnvironment('Mozilla/5.0 (Linux; Android 14)', bridgeWin);
    assert.equal(nativeBridgeEnv.hasNativeAuthBridge, true);
  });

  it('6. Account Linking Recovery: Recovers from auth/credential-already-in-use via credentialFromError without a second popup', async () => {
    await ensureAuthPersistence();
    assert.equal(isAuthPersistenceReady(), true);

    let linkPopupCalls = 0;
    let secondSignInPopupCalls = 0;
    let signInWithCredentialCalls = 0;
    let redirectCalls = 0;

    const mockAuth = {
      currentUser: { uid: 'anon_guest_999', isAnonymous: true },
    };

    const result = await executeGoogleSignInFlow(true, {
      authInstance: mockAuth,
      provider: {},
      envInfo: {
        isServer: false,
        isCapacitorNative: false,
        hasNativeAuthBridge: false,
        isAndroidWebView: false,
        isAndroidMobile: true,
        isIOSMobile: false,
        isMobileBrowser: true,
        isCrossOriginIframe: false,
        isSameOriginAuthProxy: true,
      },
      linkWithPopupFn: async () => {
        linkPopupCalls++;
        const err: any = new Error('This credential is already associated with a different user account.');
        err.code = 'auth/credential-already-in-use';
        throw err;
      },
      signInWithPopupFn: async () => {
        secondSignInPopupCalls++;
        throw new Error('Should not open a second popup that gets blocked by Android Chrome!');
      },
      credentialFromErrorFn: () => ({ providerId: 'google.com', signInMethod: 'google.com' } as any),
      signInWithCredentialFn: async () => {
        signInWithCredentialCalls++;
        return {
          user: { uid: 'existing_google_user_123', email: 'creator@audiofactory.app', isAnonymous: false },
        } as any;
      },
      signInWithRedirectFn: (async () => {
        redirectCalls++;
      }) as any,
    });

    assert.equal(linkPopupCalls, 1, 'linkWithPopup should be called once');
    assert.equal(secondSignInPopupCalls, 0, 'Must NOT call a second signInWithPopup after async error');
    assert.equal(redirectCalls, 0, 'Must NOT trigger an unnecessary redirect when credentialFromError is present');
    assert.equal(signInWithCredentialCalls, 1, 'Must sign in directly using credentialFromError');
    assert.equal(result.user.uid, 'existing_google_user_123');
    assert.equal(result.linked, false);
  });

  it('7. Concurrent Sign-In Lock: Prevents duplicate overlapping Google Sign-In operations', async () => {
    let popupCount = 0;
    const mockAuth = { currentUser: null };

    const slowPopup = () =>
      new Promise<any>((resolve) => {
        popupCount++;
        setTimeout(() => {
          resolve({ user: { uid: 'user_single_flight', isAnonymous: false } });
        }, 40);
      });

    const deps = {
      authInstance: mockAuth,
      provider: {},
      signInWithPopupFn: slowPopup as any,
      envInfo: {
        isServer: false,
        isCapacitorNative: false,
        hasNativeAuthBridge: false,
        isAndroidWebView: false,
        isAndroidMobile: false,
        isIOSMobile: false,
        isMobileBrowser: false,
        isCrossOriginIframe: false,
        isSameOriginAuthProxy: true,
      },
    };

    const [res1, res2] = await Promise.all([
      executeGoogleSignInFlow(false, deps),
      executeGoogleSignInFlow(false, deps),
    ]);

    assert.equal(popupCount, 1, 'Concurrent sign-in invocations must share a single in-flight operation');
    assert.equal(res1.user.uid, 'user_single_flight');
    assert.equal(res2.user.uid, 'user_single_flight');
  });

  it('8. Missing Initial State Error Formatting: Provides actionable recovery message for storage-partitioned errors', () => {
    const partitionedErr = {
      code: 'auth/missing-initial-state',
      message:
        'Unable to process request due to missing initial state. This may happen if browser sessionStorage is inaccessible or accidentally cleared.',
    };

    const formatted = formatAuthErrorMessage(partitionedErr);
    assert.match(formatted, /Browser session state expired or was partitioned/);
    assert.match(formatted, /Sign In with Google/);
  });
});
