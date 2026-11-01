/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * AudioFACTORY Early Birds — Concise Privacy & Data Protection Notice Modal
 * Synchronized with AudioFACTORY 7-Day Light Architectural Studio Theme & Skins
 */
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ShieldCheck } from 'lucide-react';

interface EarlyBirdsPrivacyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const EarlyBirdsPrivacyModal: React.FC<EarlyBirdsPrivacyModalProps> = ({
  isOpen,
  onClose,
}) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-labelledby="eb-privacy-title"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 10 }}
            transition={{ duration: 0.2 }}
            className="relative w-full max-w-lg rounded-2xl border p-6 shadow-2xl max-h-[85vh] overflow-y-auto"
            style={{
              backgroundColor: 'var(--skin-bg-card, #FFFFFF)',
              borderColor: 'var(--skin-border-strong, #94A3B8)',
              color: 'var(--skin-text-primary, #0F172A)',
              boxShadow: 'var(--skin-shadow)',
            }}
          >
            <div
              className="flex items-center justify-between gap-4 pb-3 border-b"
              style={{ borderColor: 'var(--skin-border, #CBD5E1)' }}
            >
              <div className="flex items-center gap-2">
                <ShieldCheck
                  className="w-5 h-5 shrink-0"
                  style={{ color: 'var(--skin-accent, #0284C7)' }}
                />
                <h2
                  id="eb-privacy-title"
                  className="font-['Outfit',sans-serif] text-lg font-extrabold"
                  style={{ color: 'var(--skin-text-primary, #0F172A)' }}
                >
                  Early Birds 🕊️ Privacy &amp; Data Protection Notice
                </h2>
              </div>
              <button
                type="button"
                onClick={onClose}
                aria-label="Close privacy notice"
                className="p-1.5 rounded-lg border transition-opacity hover:opacity-80 cursor-pointer"
                style={{
                  backgroundColor: 'var(--skin-bg-subtle, #F1F5F9)',
                  borderColor: 'var(--skin-border, #CBD5E1)',
                  color: 'var(--skin-text-secondary, #475569)',
                }}
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div
              className="mt-4 space-y-3.5 text-xs leading-relaxed"
              style={{ color: 'var(--skin-text-secondary, #475569)' }}
            >
              <div>
                <h3
                  className="font-bold mb-1"
                  style={{ color: 'var(--skin-text-primary, #0F172A)' }}
                >
                  1. Why We Collect Your Google Play Email
                </h3>
                <p>
                  AudioFACTORY collects your name, Google Play account email address, optional
                  Android OS version, and interest areas solely to evaluate applications, manage
                  cohorts for the AudioFACTORY Early Birds (v2.0.0) programme, and issue official
                  Google Play testing invitations for{' '}
                  <span
                    className="font-mono font-bold"
                    style={{ color: 'var(--skin-accent, #0284C7)' }}
                  >
                    com.audiofactory.app
                  </span>
                  .
                </p>
              </div>

              <div>
                <h3
                  className="font-bold mb-1"
                  style={{ color: 'var(--skin-text-primary, #0F172A)' }}
                >
                  2. Explicit &amp; Separated Consent
                </h3>
                <p>
                  Testing programme communications are strictly separated from optional product
                  marketing updates. If you do not check the optional product announcements box,
                  your email will only ever be used for Early Birds testing coordination.
                </p>
              </div>

              <div>
                <h3
                  className="font-bold mb-1"
                  style={{ color: 'var(--skin-text-primary, #0F172A)' }}
                >
                  3. Security &amp; Zero-PII Analytics
                </h3>
                <p>
                  Your application is transmitted over HTTPS and stored in Google Cloud Firestore
                  within project{' '}
                  <span
                    className="font-mono font-semibold"
                    style={{ color: 'var(--skin-text-primary, #0F172A)' }}
                  >
                    audiofactory-eia
                  </span>{' '}
                  with public read access disabled. Duplicate checks use a server-salted
                  cryptographic HMAC-SHA256 digest. We never include names or email addresses in
                  analytics events or production logs.
                </p>
              </div>

              <div>
                <h3
                  className="font-bold mb-1"
                  style={{ color: 'var(--skin-text-primary, #0F172A)' }}
                >
                  4. Data Retention &amp; Deletion Requests
                </h3>
                <p>
                  Early Birds application records are retained only for the duration of the v2.0.0
                  testing lifecycle (up to 12 months) unless you opt into ongoing product
                  announcements. You may withdraw your consent or request immediate deletion of your
                  application record at any time by contacting{' '}
                  <a
                    href="mailto:privacy@audiofactory.app"
                    className="font-semibold underline underline-offset-2"
                    style={{ color: 'var(--skin-accent, #0284C7)' }}
                  >
                    privacy@audiofactory.app
                  </a>{' '}
                  or visiting our Account &amp; Data Deletion page.
                </p>
              </div>
            </div>

            <div
              className="mt-5 pt-3 border-t flex items-center justify-between text-[11px]"
              style={{
                borderColor: 'var(--skin-border, #CBD5E1)',
                color: 'var(--skin-text-muted, #64748B)',
              }}
            >
              <span>Policy Version 1.0 · AudioFACTORY v2.0.0</span>
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-1.5 rounded-lg font-bold transition-opacity hover:opacity-90 cursor-pointer"
                style={{
                  backgroundColor: 'var(--skin-accent, #0284C7)',
                  color: 'var(--skin-accent-text, #FFFFFF)',
                }}
              >
                Close
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
