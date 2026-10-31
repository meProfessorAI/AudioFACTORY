/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * AudioFACTORY Early Birds v2.0.0 — End-to-End Validation, Security & Live Firestore Verification Suite
 */
import { describe, it, after } from 'node:test';
import assert from 'node:assert/strict';
import { getDoc, doc, getDocs, collection, terminate } from 'firebase/firestore';
import { normalizeEmail, generateApplicantHmacId } from '../functions/src/emailNormalizer';
import { validateEarlyBirdSubmission } from '../functions/src/validation';
import { checkRateLimit, resetRateLimiter } from '../functions/src/rateLimiter';
import {
  processEarlyBirdSubmission,
  firestoreDb,
  EARLY_BIRDS_COLLECTION,
} from '../functions/src/submitEarlyBird';

after(async () => {
  try {
    await terminate(firestoreDb);
  } catch {}
});

describe('Early Birds v2.0.0 — Form Validation & Normalization Unit Tests', () => {
  it('1. Rejects empty name', () => {
    const res = validateEarlyBirdSubmission({
      name: '   ',
      email: 'tester@gmail.com',
      confirmEmail: 'tester@gmail.com',
      consent: { programmeCommunication: true, marketingUpdates: false },
    });
    assert.equal(res.valid, false);
    assert.ok(res.fieldErrors?.name);
  });

  it('2. Rejects invalid email format', () => {
    const res = validateEarlyBirdSubmission({
      name: 'Ada Lovelace',
      email: 'not-an-email',
      confirmEmail: 'not-an-email',
      consent: { programmeCommunication: true, marketingUpdates: false },
    });
    assert.equal(res.valid, false);
    assert.ok(res.fieldErrors?.email);
  });

  it('3. Rejects mismatched email confirmation', () => {
    const res = validateEarlyBirdSubmission({
      name: 'Ada Lovelace',
      email: 'ada@gmail.com',
      confirmEmail: 'different@gmail.com',
      consent: { programmeCommunication: true, marketingUpdates: false },
    });
    assert.equal(res.valid, false);
    assert.equal(res.fieldErrors?.confirmEmail, 'Email addresses do not match.');
  });

  it('4. Rejects missing required programmeCommunication consent', () => {
    const res = validateEarlyBirdSubmission({
      name: 'Ada Lovelace',
      email: 'ada@gmail.com',
      confirmEmail: 'ada@gmail.com',
      consent: { programmeCommunication: false, marketingUpdates: true },
    });
    assert.equal(res.valid, false);
    assert.ok(res.fieldErrors?.consent);
  });

  it('5. Rejects invalid Android version selection', () => {
    const res = validateEarlyBirdSubmission({
      name: 'Ada Lovelace',
      email: 'ada@gmail.com',
      confirmEmail: 'ada@gmail.com',
      androidVersion: 'iOS 18',
      consent: { programmeCommunication: true, marketingUpdates: false },
    });
    assert.equal(res.valid, false);
    assert.ok(res.fieldErrors?.androidVersion);
  });

  it('6. Rejects malformed requests and unexpected fields', () => {
    const res = validateEarlyBirdSubmission({
      name: 'Ada Lovelace',
      email: 'ada@gmail.com',
      confirmEmail: 'ada@gmail.com',
      consent: { programmeCommunication: true },
      isAdmin: true,
    });
    assert.equal(res.valid, false);
    assert.match(res.error || '', /Unexpected field/);
  });

  it('7. Traps honeypot bot submissions', () => {
    const res = validateEarlyBirdSubmission({
      name: 'Bot User',
      email: 'bot@gmail.com',
      confirmEmail: 'bot@gmail.com',
      consent: { programmeCommunication: true },
      website: 'https://spam.example.com',
    });
    assert.equal(res.valid, false);
    assert.equal(res.isSpamBot, true);
  });

  it('8. Normalizes Gmail aliases and dots to identical HMAC-SHA256 document ID', () => {
    const norm1 = normalizeEmail('Early.Bird.Tester+wave1@googlemail.com');
    const norm2 = normalizeEmail('earlybirdtester@gmail.com');
    assert.equal(norm1, 'earlybirdtester@gmail.com');
    assert.equal(norm1, norm2);

    const hmac1 = generateApplicantHmacId(norm1);
    const hmac2 = generateApplicantHmacId(norm2);
    assert.equal(hmac1.length, 64);
    assert.match(hmac1, /^[a-f0-9]{64}$/);
    assert.equal(hmac1, hmac2);
  });

  it('9. Enforces sliding-window rate limiting and rapid submission cooldown', () => {
    resetRateLimiter();
    const cfg = { windowMs: 60000, maxRequestsPerWindow: 2, minCooldownMs: 1000 };
    const t0 = 1000000;

    const first = checkRateLimit('ip_test_1', cfg, t0);
    assert.equal(first.allowed, true);

    // Rapid retry within 500ms (< 1000ms cooldown)
    const rapid = checkRateLimit('ip_test_1', cfg, t0 + 500);
    assert.equal(rapid.allowed, false);

    // Retry after cooldown passes
    const second = checkRateLimit('ip_test_1', cfg, t0 + 1500);
    assert.equal(second.allowed, true);

    // 3rd attempt within window exceeds maxRequestsPerWindow (2)
    const third = checkRateLimit('ip_test_1', cfg, t0 + 3000);
    assert.equal(third.allowed, false);
    resetRateLimiter();
  });
});

describe('Early Birds v2.0.0 — Live Firebase Firestore Integration & Security Verification', () => {
  const uniqueRunTag = Date.now();
  const testEmail = `earlybird.verify.${uniqueRunTag}@gmail.com`;
  const normalized = normalizeEmail(testEmail);
  const expectedDocId = generateApplicantHmacId(normalized);

  it('10. Writes a valid application to live Firestore with SERVER_TIMESTAMP and exact schema', async () => {
    resetRateLimiter();
    const response = await processEarlyBirdSubmission(
      {
        name: 'Elena Vance',
        email: testEmail,
        confirmEmail: testEmail,
        interests: ['🎧 Audio creation', '🧪 Testing and feedback'],
        androidVersion: 'Android 15',
        consent: {
          programmeCommunication: true,
          marketingUpdates: false,
        },
      },
      `verify_ip_${uniqueRunTag}`
    );

    assert.equal(response.httpStatus, 201, `Expected 201 Created, got: ${JSON.stringify(response.body)}`);
    assert.equal(response.body.ok, true);
    assert.equal(response.body.status, 'applied');
    assert.equal(response.body.firstName, 'Elena');

    // Verify document exists in live Firestore `early_birds` collection
    const snap = await getDoc(doc(firestoreDb, EARLY_BIRDS_COLLECTION, expectedDocId));
    assert.equal(snap.exists(), true, 'Document must exist in live Firestore early_birds collection');

    const data = snap.data()!;
    assert.equal(data.name, 'Elena Vance');
    assert.equal(data.email, testEmail);
    assert.equal(data.normalizedEmail, normalized);
    assert.deepEqual(data.interests, ['Audio creation', 'Testing and feedback']);
    assert.equal(data.androidVersion, 'Android 15');
    assert.equal(data.programme, 'AudioFACTORY Early Birds');
    assert.equal(data.appVersion, '2.0.0');
    assert.equal(data.status, 'applied');
    assert.equal(data.selectionStatus, 'pending');
    assert.equal(data.testingInvitationSent, false);
    assert.equal(data.testingCompleted, false);
    assert.equal(data.testingFeedbackReceived, false);
    assert.deepEqual(data.consent, {
      programmeCommunication: true,
      marketingUpdates: false,
      policyVersion: '1.0',
    });
    assert.equal(data.source, 'early_birds_landing_page');
    assert.equal('confirmEmail' in data, false, 'confirmEmail must never be stored');
    assert.ok(data.createdAt && typeof data.createdAt.toDate === 'function', 'createdAt must be a Firestore Timestamp');
    assert.ok(data.updatedAt && typeof data.updatedAt.toDate === 'function', 'updatedAt must be a Firestore Timestamp');
  });

  it('11. Detects duplicate application server-side and preserves original record without overwriting', async () => {
    resetRateLimiter();
    // Submit using a Gmail alias variation (+duplicate) of the exact same email
    const aliasEmail = `earlybird.verify.${uniqueRunTag}+duplicate@googlemail.com`;

    const dupResponse = await processEarlyBirdSubmission(
      {
        name: 'Attempted Overwrite Name',
        email: aliasEmail,
        confirmEmail: aliasEmail,
        interests: ['Just curious'],
        androidVersion: 'Android 12',
        consent: {
          programmeCommunication: true,
          marketingUpdates: true, // Attempting to flip marketingUpdates to true
        },
      },
      `verify_ip_dup_${uniqueRunTag}`
    );

    assert.equal(dupResponse.httpStatus, 200);
    assert.equal(dupResponse.body.ok, true);
    assert.equal(dupResponse.body.status, 'duplicate');
    assert.equal(
      dupResponse.body.message,
      "Looks like you're already on the Early Birds list. You're all set."
    );

    // Verify original record in Firestore was NOT overwritten
    const snap = await getDoc(doc(firestoreDb, EARLY_BIRDS_COLLECTION, expectedDocId));
    const data = snap.data()!;
    assert.equal(data.name, 'Elena Vance', 'Original applicant name must not be overwritten');
    assert.equal(data.consent.marketingUpdates, false, 'Original consent record must not be overwritten');
  });

  it('12. Denies public listing/querying of the early_birds collection in Firestore', async () => {
    let listRejected = false;
    try {
      await getDocs(collection(firestoreDb, EARLY_BIRDS_COLLECTION));
    } catch (err: any) {
      if (err?.code === 'permission-denied' || String(err).includes('Missing or insufficient permissions')) {
        listRejected = true;
      }
    }
    assert.equal(listRejected, true, 'Unauthenticated/public listing of early_birds must be rejected by Firestore rules');
  });
});
