/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * AudioFACTORY Early Birds — Privacy-Conscious Conversion Analytics
 * Strictly strips any PII (names, emails, raw inputs). Tracks anonymous conversion events only.
 */

export type EarlyBirdsAnalyticsEvent =
  | 'early_birds_page_view'
  | 'early_birds_form_started'
  | 'early_birds_email_validated'
  | 'early_birds_application_submitted'
  | 'early_birds_duplicate_detected'
  | 'early_birds_submission_failed';

interface SafeAnalyticsMeta {
  interestCount?: number;
  hasAndroidVersion?: boolean;
  marketingOptIn?: boolean;
  reasonCode?: string;
}

const firedOnceEvents = new Set<string>();

export function trackEarlyBirdsEvent(
  eventName: EarlyBirdsAnalyticsEvent,
  metadata?: SafeAnalyticsMeta,
  oncePerSession: boolean = false
): void {
  if (typeof window === 'undefined') return;

  if (oncePerSession && firedOnceEvents.has(eventName)) {
    return;
  }
  if (oncePerSession) {
    firedOnceEvents.add(eventName);
  }

  // Construct strictly sanitized payload — never include name, email, or personal identifiers
  const safePayload: Record<string, string | number | boolean> = {
    programme: 'AudioFACTORY Early Birds',
    appVersion: '2.0.0',
    timestamp: Date.now(),
  };

  if (metadata) {
    if (typeof metadata.interestCount === 'number') {
      safePayload.interestCount = metadata.interestCount;
    }
    if (typeof metadata.hasAndroidVersion === 'boolean') {
      safePayload.hasAndroidVersion = metadata.hasAndroidVersion;
    }
    if (typeof metadata.marketingOptIn === 'boolean') {
      safePayload.marketingOptIn = metadata.marketingOptIn;
    }
    if (typeof metadata.reasonCode === 'string') {
      safePayload.reasonCode = metadata.reasonCode.slice(0, 48);
    }
  }

  try {
    window.dispatchEvent(
      new CustomEvent('audiofactory:analytics', {
        detail: { event: eventName, ...safePayload },
      })
    );
  } catch {
    // Ignore CustomEvent errors in older WebViews
  }
}
