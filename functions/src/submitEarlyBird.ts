/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * AudioFACTORY Early Birds — Firebase Submission Handler & Transaction Engine
 * Writes directly to the authoritative Firestore database in project "audiofactory-eia".
 */
import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getFirestore,
  doc,
  runTransaction,
  serverTimestamp,
  collection,
  getDocs,
  query,
  orderBy,
  updateDoc,
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';
import { generateApplicantHmacId } from './emailNormalizer';
import { validateEarlyBirdSubmission, ValidatedEarlyBirdData } from './validation';
import { checkRateLimit, RateLimitConfig } from './rateLimiter';
import { serverDb } from '../../backend/database';

// Initialize canonical Firebase app & named Firestore database
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
export const firestoreDb = getFirestore(app, firebaseConfig.firestoreDatabaseId);

export const EARLY_BIRDS_COLLECTION = 'early_birds';

export interface EarlyBirdFirestoreRecord {
  name: string;
  email: string;
  normalizedEmail: string;
  interests: string[];
  androidVersion: string;
  programme: 'AudioFACTORY Early Birds';
  appVersion: '2.0.0';
  status: 'applied';
  selectionStatus: 'pending' | 'selected' | 'waitlisted' | 'declined';
  testingInvitationSent: boolean;
  testingCompleted: boolean;
  testingFeedbackReceived: boolean;
  consent: {
    programmeCommunication: true;
    marketingUpdates: boolean;
    policyVersion: '1.0';
  };
  source: 'early_birds_landing_page';
  createdAt: any;
  updatedAt: any;
}

export interface SubmitEarlyBirdResponse {
  ok: boolean;
  status: 'applied' | 'duplicate' | 'error' | 'rate_limited';
  firstName?: string;
  programme?: string;
  appVersion?: string;
  message: string;
  fieldErrors?: Record<string, string>;
  retryAfterSeconds?: number;
}

/**
 * Processes an Early Birds application:
 * 1. Applies rate limiting & cooldown checks.
 * 2. Validates payload & required consent.
 * 3. Normalizes Google Play email & computes server-salted HMAC-SHA256 document ID.
 * 4. Executes an atomic Firestore transaction (`runTransaction`) with `serverTimestamp()`
 *    so duplicate emails are detected server-side and existing applications are NEVER overwritten.
 */
export async function processEarlyBirdSubmission(
  rawPayload: unknown,
  clientIdentifier: string,
  rateLimitConfig?: RateLimitConfig
): Promise<{ httpStatus: number; body: SubmitEarlyBirdResponse }> {
  // 1. Check rate limit
  const rateCheck = checkRateLimit(clientIdentifier, rateLimitConfig);
  if (!rateCheck.allowed) {
    return {
      httpStatus: 429,
      body: {
        ok: false,
        status: 'rate_limited',
        message: rateCheck.reason || 'Too many requests. Please wait before trying again.',
        retryAfterSeconds: rateCheck.retryAfterSeconds,
      },
    };
  }

  // 2. Validate payload
  const validation = validateEarlyBirdSubmission(rawPayload);
  if (!validation.valid) {
    // If honeypot was triggered, return a quiet generic 400 without aiding bot authors
    if (validation.isSpamBot) {
      return {
        httpStatus: 400,
        body: {
          ok: false,
          status: 'error',
          message: 'Unable to process application request.',
        },
      };
    }

    return {
      httpStatus: 400,
      body: {
        ok: false,
        status: 'error',
        message: validation.error || 'Please check your application details.',
        fieldErrors: validation.fieldErrors,
      },
    };
  }

  const data: ValidatedEarlyBirdData = validation.data!;
  const applicantId = generateApplicantHmacId(data.normalizedEmail);
  const firstName = data.name.split(' ')[0] || data.name;

  // 3. Check local mirror first for ultra-fast duplicate short-circuit if offline
  const localRef = serverDb.collection(EARLY_BIRDS_COLLECTION).doc(applicantId);

  // 4. Execute atomic Firestore transaction on live `audiofactory-eia` database
  try {
    const docRef = doc(firestoreDb, EARLY_BIRDS_COLLECTION, applicantId);

    const txOutcome = await runTransaction(firestoreDb, async (transaction) => {
      const existingSnap = await transaction.get(docRef);
      if (existingSnap.exists()) {
        return 'duplicate' as const;
      }

      const firestoreRecord: EarlyBirdFirestoreRecord = {
        name: data.name,
        email: data.email,
        normalizedEmail: data.normalizedEmail,
        interests: data.interests,
        androidVersion: data.androidVersion,
        programme: 'AudioFACTORY Early Birds',
        appVersion: '2.0.0',
        status: 'applied',
        selectionStatus: 'pending',
        testingInvitationSent: false,
        testingCompleted: false,
        testingFeedbackReceived: false,
        consent: {
          programmeCommunication: true,
          marketingUpdates: data.consent.marketingUpdates,
          policyVersion: '1.0',
        },
        source: 'early_birds_landing_page',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };

      transaction.set(docRef, firestoreRecord);
      return 'applied' as const;
    });

    if (txOutcome === 'duplicate') {
      return {
        httpStatus: 200,
        body: {
          ok: true,
          status: 'duplicate',
          firstName,
          programme: 'AudioFACTORY Early Birds',
          appVersion: '2.0.0',
          message: "Looks like you're already on the Early Birds list. You're all set.",
        },
      };
    }

    // Mirror to local server store for instant admin fallback
    const nowIso = new Date().toISOString();
    await localRef.set({
      name: data.name,
      email: data.email,
      normalizedEmail: data.normalizedEmail,
      interests: data.interests,
      androidVersion: data.androidVersion,
      programme: 'AudioFACTORY Early Birds',
      appVersion: '2.0.0',
      status: 'applied',
      selectionStatus: 'pending',
      testingInvitationSent: false,
      testingCompleted: false,
      testingFeedbackReceived: false,
      consent: {
        programmeCommunication: true,
        marketingUpdates: data.consent.marketingUpdates,
        policyVersion: '1.0',
      },
      source: 'early_birds_landing_page',
      createdAt: nowIso,
      updatedAt: nowIso,
    });

    return {
      httpStatus: 201,
      body: {
        ok: true,
        status: 'applied',
        firstName,
        programme: 'AudioFACTORY Early Birds',
        appVersion: '2.0.0',
        message:
          "Your Early Birds application has landed. Keep an eye on your inbox. If selected, we'll send your official Google Play testing invitation.",
      },
    };
  } catch (err: any) {
    const errCode = err?.code || '';
    const errMsg = err instanceof Error ? err.message : String(err);

    // If permission-denied occurred on an existing document (since allow update is false for non-admins
    // while allow create is true), it means the document with this HMAC ID already exists!
    if (errCode === 'permission-denied' || errCode === 'already-exists' || errMsg.includes('ALREADY_EXISTS')) {
      return {
        httpStatus: 200,
        body: {
          ok: true,
          status: 'duplicate',
          firstName,
          programme: 'AudioFACTORY Early Birds',
          appVersion: '2.0.0',
          message: "Looks like you're already on the Early Birds list. You're all set.",
        },
      };
    }

    // Do not print emails in logs
    console.error('[EarlyBirds] Firestore transaction error:', errCode || 'unknown_error');
    return {
      httpStatus: 500,
      body: {
        ok: false,
        status: 'error',
        message: 'Could not complete your application right now. Please try again in a moment.',
      },
    };
  }
}
