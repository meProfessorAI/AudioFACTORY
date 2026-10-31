/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * AudioFACTORY Early Birds — Client-Side Form Validation Utilities
 */

export const INTEREST_OPTIONS = [
  { id: 'Audio creation', label: '🎧 Audio creation', value: 'Audio creation' },
  { id: 'Content creation', label: '🎙 Content creation', value: 'Content creation' },
  { id: 'Music and sound', label: '🎵 Music and sound', value: 'Music and sound' },
  { id: 'Technology', label: '⚡ Technology', value: 'Technology' },
  { id: 'Testing and feedback', label: '🧪 Testing and feedback', value: 'Testing and feedback' },
  { id: 'Just curious', label: '✨ Just curious', value: 'Just curious' },
] as const;

export const ANDROID_VERSION_OPTIONS = [
  'Android 16',
  'Android 15',
  'Android 14',
  'Android 13',
  'Android 12',
  'Android 11',
  'Android 10 or earlier',
  'Not sure',
] as const;

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export function isValidEmailFormat(email: string): boolean {
  const trimmed = email.trim();
  return trimmed.length >= 5 && trimmed.length <= 254 && EMAIL_PATTERN.test(trimmed);
}

export function doEmailsMatch(email: string, confirmEmail: string): boolean {
  if (!isValidEmailFormat(email)) return false;
  return email.trim().toLowerCase() === confirmEmail.trim().toLowerCase();
}

export interface ClientValidationSummary {
  isValid: boolean;
  errors: {
    name?: string;
    email?: string;
    confirmEmail?: string;
    consent?: string;
  };
}

export function validateEarlyBirdClientForm(input: {
  name: string;
  email: string;
  confirmEmail: string;
  programmeCommunication: boolean;
}): ClientValidationSummary {
  const errors: ClientValidationSummary['errors'] = {};

  const trimmedName = input.name.trim();
  if (!trimmedName) {
    errors.name = 'Please tell us what we should call you.';
  } else if (trimmedName.length > 120) {
    errors.name = 'Name must be 120 characters or fewer.';
  } else if (/[<>]/.test(trimmedName)) {
    errors.name = 'Name contains unsupported characters.';
  }

  if (!input.email.trim()) {
    errors.email = 'Please enter your Google Play email address.';
  } else if (!isValidEmailFormat(input.email)) {
    errors.email = 'Please enter a valid Google Play email address.';
  }

  if (!input.confirmEmail.trim()) {
    errors.confirmEmail = 'Please confirm your email address.';
  } else if (!doEmailsMatch(input.email, input.confirmEmail)) {
    errors.confirmEmail = 'Email addresses do not match.';
  }

  if (!input.programmeCommunication) {
    errors.consent =
      'Please agree to programme communications so we can coordinate your Google Play testing invitation.';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}
