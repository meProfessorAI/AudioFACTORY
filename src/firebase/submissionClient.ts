/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * AudioFACTORY Early Birds — Secure Submission Client
 */
import { getOptionalAppCheckToken } from './config';

export interface EarlyBirdFormPayload {
  name: string;
  email: string;
  confirmEmail: string;
  interests: string[];
  androidVersion: string;
  consent: {
    programmeCommunication: boolean;
    marketingUpdates: boolean;
  };
  website?: string; // Honeypot field
}

export interface EarlyBirdSubmissionResult {
  ok: boolean;
  status: 'applied' | 'duplicate' | 'error' | 'rate_limited';
  firstName?: string;
  programme?: string;
  appVersion?: string;
  message: string;
  fieldErrors?: Record<string, string>;
  retryAfterSeconds?: number;
}

let lastClientSubmitTimestamp = 0;
const CLIENT_COOLDOWN_MS = 2000;

export async function submitEarlyBirdApplication(
  payload: EarlyBirdFormPayload
): Promise<EarlyBirdSubmissionResult> {
  const now = Date.now();
  if (now - lastClientSubmitTimestamp < CLIENT_COOLDOWN_MS) {
    return {
      ok: false,
      status: 'rate_limited',
      message: 'Please wait a moment before submitting again.',
    };
  }
  lastClientSubmitTimestamp = now;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  const appCheckToken = await getOptionalAppCheckToken();
  if (appCheckToken) {
    headers['X-Firebase-AppCheck'] = appCheckToken;
  }

  try {
    const response = await fetch('/api/early-birds/submit', {
      method: 'POST',
      headers,
      body: JSON.stringify(payload),
    });

    const data = (await response.json()) as EarlyBirdSubmissionResult;
    return data;
  } catch {
    return {
      ok: false,
      status: 'error',
      message: 'Network error while connecting to AudioFACTORY. Please check your connection and try again.',
    };
  }
}
