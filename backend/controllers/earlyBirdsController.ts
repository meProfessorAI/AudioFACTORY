/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * AudioFACTORY Early Birds — Express / Vercel API Controller
 */
import { Request, Response } from 'express';
import { processEarlyBirdSubmission, EARLY_BIRDS_COLLECTION } from '../../functions/src/submitEarlyBird';
import { serverDb } from '../database';

function isAuthorizedAdmin(req: Request): boolean {
  const user = req.user;
  if (!user) return false;
  if (user.uid.startsWith('admin_user_')) return true;
  if (user.email === 'connectedtorajib@gmail.com' && !user.isAnonymous) return true;
  return false;
}

export const handleSubmitEarlyBird = async (req: Request, res: Response): Promise<void> => {
  try {
    const forwarded = req.headers['x-forwarded-for'];
    const clientIp =
      (Array.isArray(forwarded) ? forwarded[0] : forwarded?.split(',')[0]?.trim()) ||
      req.socket?.remoteAddress ||
      'unknown_ip';

    // Optional App Check header verification when enforced
    const appCheckToken = req.headers['x-firebase-appcheck'];
    if (process.env.ENFORCE_FIREBASE_APPCHECK === 'true' && (!appCheckToken || typeof appCheckToken !== 'string')) {
      res.status(401).json({
        ok: false,
        status: 'error',
        message: 'App Check verification required.',
      });
      return;
    }

    const result = await processEarlyBirdSubmission(req.body, clientIp);
    res.status(result.httpStatus).json(result.body);
  } catch (err) {
    console.error('[EarlyBirds API] Unexpected error in handleSubmitEarlyBird');
    res.status(500).json({
      ok: false,
      status: 'error',
      message: 'An unexpected error occurred while submitting your application.',
    });
  }
};

export const handleGetEarlyBirdsAdmin = async (req: Request, res: Response): Promise<void> => {
  if (!isAuthorizedAdmin(req)) {
    res.status(403).json({ error: 'Unauthorized: Administrator privileges required.' });
    return;
  }

  try {
    const snap = await serverDb.collection(EARLY_BIRDS_COLLECTION).orderBy('createdAt', 'desc').get();
    const items = snap.docs.map((d) => ({
      id: d.id,
      ...d.data(),
    }));
    res.json({ ok: true, items });
  } catch (err) {
    res.status(500).json({ error: 'Failed to retrieve Early Birds records.' });
  }
};

export const handleUpdateEarlyBirdAdmin = async (req: Request, res: Response): Promise<void> => {
  if (!isAuthorizedAdmin(req)) {
    res.status(403).json({ error: 'Unauthorized: Administrator privileges required.' });
    return;
  }

  const rawId = req.params.id;
  const id = Array.isArray(rawId) ? rawId[0] : rawId;
  if (!id || !/^[a-f0-9]{64}$/.test(id)) {
    res.status(400).json({ error: 'Invalid applicant record ID.' });
    return;
  }

  const allowedUpdates: Record<string, any> = {};
  const body = req.body || {};

  if (
    typeof body.selectionStatus === 'string' &&
    ['pending', 'selected', 'waitlisted', 'declined'].includes(body.selectionStatus)
  ) {
    allowedUpdates.selectionStatus = body.selectionStatus;
  }
  if (typeof body.testingInvitationSent === 'boolean') {
    allowedUpdates.testingInvitationSent = body.testingInvitationSent;
  }
  if (typeof body.testingCompleted === 'boolean') {
    allowedUpdates.testingCompleted = body.testingCompleted;
  }
  if (typeof body.testingFeedbackReceived === 'boolean') {
    allowedUpdates.testingFeedbackReceived = body.testingFeedbackReceived;
  }

  if (Object.keys(allowedUpdates).length === 0) {
    res.status(400).json({ error: 'No valid update fields provided.' });
    return;
  }

  allowedUpdates.updatedAt = new Date().toISOString();

  try {
    const docRef = serverDb.collection(EARLY_BIRDS_COLLECTION).doc(id);
    const existing = await docRef.get();
    if (existing.exists) {
      await docRef.update(allowedUpdates);
    } else {
      await docRef.set(allowedUpdates, { merge: true });
    }
    res.json({ ok: true, updated: allowedUpdates });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update applicant record.' });
  }
};
