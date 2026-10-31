/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * AudioFACTORY Early Birds — Strict Server-Side Payload Validation
 */
import { normalizeEmail } from './emailNormalizer';

export const ALLOWED_INTERESTS = [
  'Audio creation',
  'Content creation',
  'Music and sound',
  'Technology',
  'Testing and feedback',
  'Just curious',
] as const;

export const ALLOWED_ANDROID_VERSIONS = [
  'Android 16',
  'Android 15',
  'Android 14',
  'Android 13',
  'Android 12',
  'Android 11',
  'Android 10 or earlier',
  'Not sure',
  'Not specified',
] as const;

const ALLOWED_PAYLOAD_KEYS = new Set([
  'name',
  'email',
  'confirmEmail',
  'interests',
  'androidVersion',
  'consent',
  'website', // Honeypot field
]);

export interface EarlyBirdSubmissionInput {
  name: string;
  email: string;
  confirmEmail: string;
  interests?: string[];
  androidVersion?: string;
  consent: {
    programmeCommunication: boolean;
    marketingUpdates?: boolean;
  };
  website?: string;
}

export interface ValidatedEarlyBirdData {
  name: string;
  email: string;
  normalizedEmail: string;
  interests: string[];
  androidVersion: string;
  consent: {
    programmeCommunication: true;
    marketingUpdates: boolean;
    policyVersion: '1.0';
  };
}

export interface ValidationResult {
  valid: boolean;
  isSpamBot?: boolean;
  error?: string;
  fieldErrors?: Record<string, string>;
  data?: ValidatedEarlyBirdData;
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export function validateEarlyBirdSubmission(payload: unknown): ValidationResult {
  if (!payload || typeof payload !== 'object' || Array.isArray(payload)) {
    return {
      valid: false,
      error: 'Malformed application request payload.',
    };
  }

  const raw = payload as Record<string, unknown>;

  // 1. Reject unexpected fields
  for (const key of Object.keys(raw)) {
    if (!ALLOWED_PAYLOAD_KEYS.has(key)) {
      return {
        valid: false,
        error: `Unexpected field "${key}" in submission payload.`,
      };
    }
  }

  // 2. Honeypot trap check
  if (typeof raw.website === 'string' && raw.website.trim().length > 0) {
    return {
      valid: false,
      isSpamBot: true,
      error: 'Spam protection triggered.',
    };
  }

  const fieldErrors: Record<string, string> = {};

  // 3. Validate Name
  const rawName = typeof raw.name === 'string' ? raw.name.trim().replace(/\s+/g, ' ') : '';
  if (!rawName) {
    fieldErrors.name = 'Please tell us what we should call you.';
  } else if (rawName.length > 120) {
    fieldErrors.name = 'Name must be 120 characters or fewer.';
  } else if (/[<>]/.test(rawName)) {
    fieldErrors.name = 'Name contains invalid characters.';
  }

  // 4. Validate Google Play Email
  const rawEmail = typeof raw.email === 'string' ? raw.email.trim() : '';
  if (!rawEmail) {
    fieldErrors.email = 'Please enter your Google Play email address.';
  } else if (rawEmail.length < 5 || rawEmail.length > 254 || !EMAIL_REGEX.test(rawEmail)) {
    fieldErrors.email = 'Please enter a valid Google Play email address.';
  }

  // 5. Validate Email Confirmation Match
  const rawConfirmEmail = typeof raw.confirmEmail === 'string' ? raw.confirmEmail.trim() : '';
  if (!rawConfirmEmail) {
    fieldErrors.confirmEmail = 'Please confirm your email address.';
  } else if (rawEmail.toLowerCase() !== rawConfirmEmail.toLowerCase()) {
    fieldErrors.confirmEmail = 'Email addresses do not match.';
  }

  // 6. Validate Interests (optional, multi-select)
  const cleanInterests: string[] = [];
  if (raw.interests !== undefined) {
    if (!Array.isArray(raw.interests) || raw.interests.length > 6) {
      fieldErrors.interests = 'Invalid interests selection.';
    } else {
      for (const item of raw.interests) {
        if (typeof item !== 'string') {
          fieldErrors.interests = 'Invalid interest item.';
          break;
        }
        // Strip leading emoji if passed from UI chip or match directly
        const normalizedItem = item.replace(/^[^\w]+/, '').trim();
        const matched = ALLOWED_INTERESTS.find(
          (allowed) => allowed.toLowerCase() === normalizedItem.toLowerCase() || allowed.toLowerCase() === item.trim().toLowerCase()
        );
        if (!matched) {
          fieldErrors.interests = `Unsupported interest selection: ${item}`;
          break;
        }
        if (!cleanInterests.includes(matched)) {
          cleanInterests.push(matched);
        }
      }
    }
  }

  // 7. Validate Android Version (optional)
  let cleanAndroidVersion = 'Not sure';
  if (raw.androidVersion !== undefined && raw.androidVersion !== '') {
    if (typeof raw.androidVersion !== 'string') {
      fieldErrors.androidVersion = 'Invalid Android version selection.';
    } else {
      const trimmedVer = raw.androidVersion.trim();
      if (!(ALLOWED_ANDROID_VERSIONS as readonly string[]).includes(trimmedVer)) {
        fieldErrors.androidVersion = 'Please select a valid Android version from the list.';
      } else {
        cleanAndroidVersion = trimmedVer;
      }
    }
  }

  // 8. Validate Consent
  const rawConsent = raw.consent;
  if (!rawConsent || typeof rawConsent !== 'object' || Array.isArray(rawConsent)) {
    fieldErrors.consent = 'Programme communication consent is required.';
  } else {
    const consentObj = rawConsent as Record<string, unknown>;
    const allowedConsentKeys = new Set(['programmeCommunication', 'marketingUpdates']);
    for (const k of Object.keys(consentObj)) {
      if (!allowedConsentKeys.has(k)) {
        return {
          valid: false,
          error: `Unexpected consent property "${k}".`,
        };
      }
    }
    if (consentObj.programmeCommunication !== true) {
      fieldErrors.consent =
        'You must agree to allow AudioFACTORY to manage your early access application and communicate about the testing programme.';
    }
  }

  if (Object.keys(fieldErrors).length > 0) {
    const firstError = Object.values(fieldErrors)[0];
    return {
      valid: false,
      error: firstError,
      fieldErrors,
    };
  }

  const consentObj = raw.consent as Record<string, unknown>;
  const normalized = normalizeEmail(rawEmail);

  return {
    valid: true,
    data: {
      name: rawName,
      email: rawEmail.toLowerCase(),
      normalizedEmail: normalized,
      interests: cleanInterests,
      androidVersion: cleanAndroidVersion,
      consent: {
        programmeCommunication: true,
        marketingUpdates: Boolean(consentObj.marketingUpdates),
        policyVersion: '1.0',
      },
    },
  };
}
