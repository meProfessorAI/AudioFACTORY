/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * AudioFACTORY Early Birds — Server-Side Email Normalization & HMAC Document ID Generator
 */
import crypto from 'crypto';

/**
 * Normalizes an email address to prevent duplicate applications via case variations,
 * whitespace, or Gmail dot/plus aliasing on Google Play accounts.
 */
export function normalizeEmail(rawEmail: string): string {
  if (!rawEmail || typeof rawEmail !== 'string') {
    return '';
  }

  const trimmed = rawEmail.trim().toLowerCase();
  const parts = trimmed.split('@');
  if (parts.length !== 2) {
    return trimmed;
  }

  let [localPart, domain] = parts;

  // Canonicalize googlemail.com to gmail.com for Google Play accounts
  if (domain === 'googlemail.com') {
    domain = 'gmail.com';
  }

  // Strip +subaddressing and dots on gmail.com accounts
  if (domain === 'gmail.com') {
    const plusIndex = localPart.indexOf('+');
    if (plusIndex !== -1) {
      localPart = localPart.slice(0, plusIndex);
    }
    localPart = localPart.replace(/\./g, '');
  } else {
    // Strip +subaddressing on other domains
    const plusIndex = localPart.indexOf('+');
    if (plusIndex !== -1) {
      localPart = localPart.slice(0, plusIndex);
    }
  }

  return `${localPart}@${domain}`;
}

/**
 * Generates a deterministic, 64-character hex HMAC-SHA256 document identifier
 * from the normalized email using a server-only secret key.
 * Never uses an unsalted plain email hash.
 */
export function generateApplicantHmacId(normalizedEmail: string, secretOverride?: string): string {
  const secret =
    secretOverride ||
    process.env.EARLY_BIRDS_HMAC_SECRET ||
    process.env.FIREBASE_PROJECT_ID_HMAC_SALT ||
    'audiofactory-eia-early-birds-v2-hmac-server-key-2026';

  return crypto
    .createHmac('sha256', secret)
    .update(`early_birds:v2.0.0:${normalizedEmail}`)
    .digest('hex');
}
