/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * AudioFACTORY Early Birds — Compact Embedded Application Form
 */
import React, { useState, useEffect, RefObject } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, AlertCircle, Loader2, ShieldCheck } from 'lucide-react';
import {
  INTEREST_OPTIONS,
  ANDROID_VERSION_OPTIONS,
  isValidEmailFormat,
  doEmailsMatch,
  validateEarlyBirdClientForm,
} from '../../utils/validation';
import { submitEarlyBirdApplication, EarlyBirdSubmissionResult } from '../../firebase/submissionClient';
import { trackEarlyBirdsEvent } from '../../utils/earlyBirdsAnalytics';

interface EarlyBirdsFormProps {
  nameInputRef: RefObject<HTMLInputElement>;
  onFocusChange: (focused: boolean) => void;
  onEmailValidityChange: (valid: boolean) => void;
  onSuccess: (result: EarlyBirdSubmissionResult, submittedName: string) => void;
  onOpenPrivacy: () => void;
}

export const EarlyBirdsForm: React.FC<EarlyBirdsFormProps> = ({
  nameInputRef,
  onFocusChange,
  onEmailValidityChange,
  onSuccess,
  onOpenPrivacy,
}) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [confirmEmail, setConfirmEmail] = useState('');
  const [interests, setInterests] = useState<string[]>(['Audio creation']);
  const [androidVersion, setAndroidVersion] = useState<string>('Android 15');
  const [programmeCommunication, setProgrammeCommunication] = useState(false);
  const [marketingUpdates, setMarketingUpdates] = useState(false);
  const [honeypot, setHoneypot] = useState('');

  const [isEmailFocused, setIsEmailFocused] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasStartedForm, setHasStartedForm] = useState(false);
  const [submitAttempted, setSubmitAttempted] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const emailFormatValid = isValidEmailFormat(email);
  const emailsMatchValid = doEmailsMatch(email, confirmEmail);

  useEffect(() => {
    onEmailValidityChange(emailFormatValid && emailsMatchValid);
    if (emailFormatValid && emailsMatchValid) {
      trackEarlyBirdsEvent('early_birds_email_validated', undefined, true);
    }
  }, [emailFormatValid, emailsMatchValid, onEmailValidityChange]);

  const markFormStarted = () => {
    if (!hasStartedForm) {
      setHasStartedForm(true);
      trackEarlyBirdsEvent('early_birds_form_started', undefined, true);
    }
  };

  const toggleInterest = (val: string) => {
    markFormStarted();
    setInterests((prev) =>
      prev.includes(val) ? prev.filter((item) => item !== val) : [...prev, val]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    setSubmitAttempted(true);
    setServerError(null);

    const validation = validateEarlyBirdClientForm({
      name,
      email,
      confirmEmail,
      programmeCommunication,
    });

    if (!validation.isValid) {
      setFieldErrors(validation.errors);
      trackEarlyBirdsEvent('early_birds_submission_failed', { reasonCode: 'client_validation' });
      return;
    }

    setFieldErrors({});
    setIsSubmitting(true);

    try {
      const result = await submitEarlyBirdApplication({
        name: name.trim(),
        email: email.trim(),
        confirmEmail: confirmEmail.trim(),
        interests,
        androidVersion,
        consent: {
          programmeCommunication,
          marketingUpdates,
        },
        website: honeypot,
      });

      if (result.ok && (result.status === 'applied' || result.status === 'duplicate')) {
        if (result.status === 'duplicate') {
          trackEarlyBirdsEvent('early_birds_duplicate_detected', {
            interestCount: interests.length,
          });
        } else {
          trackEarlyBirdsEvent('early_birds_application_submitted', {
            interestCount: interests.length,
            hasAndroidVersion: androidVersion !== 'Not sure',
            marketingOptIn: marketingUpdates,
          });
        }
        onSuccess(result, name.trim());
      } else {
        setServerError(result.message || 'Unable to submit application. Please check your details.');
        if (result.fieldErrors) {
          setFieldErrors(result.fieldErrors);
        }
        trackEarlyBirdsEvent('early_birds_submission_failed', {
          reasonCode: result.status || 'server_error',
        });
      }
    } catch {
      setServerError('Network error. Please verify your internet connection and try again.');
      trackEarlyBirdsEvent('early_birds_submission_failed', { reasonCode: 'network_exception' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.1 }}
      className={`relative rounded-2xl p-4 sm:p-5 lg:p-6 transition-all duration-300 backdrop-blur-xl ${
        isEmailFocused
          ? 'bg-[#0B0F22]/90 border border-cyan-400/50 shadow-[0_0_40px_-10px_rgba(34,211,238,0.28)]'
          : 'bg-[#090C1A]/85 border border-white/[0.1] shadow-[0_20px_50px_rgba(0,0,0,0.6)]'
      }`}
    >
      {/* Form Header */}
      <div className="flex items-center justify-between gap-2 mb-3.5">
        <div>
          <h2 className="font-['Outfit',sans-serif] text-lg sm:text-xl font-bold text-white tracking-tight">
            Your invitation starts here.
          </h2>
          <p className="text-xs text-slate-400">
            Don&apos;t wait for the launch. Be part of it.
          </p>
        </div>
        <span className="text-[11px] font-mono text-cyan-300/90 tabular-nums shrink-0">
          v2.0.0 WAVE 1
        </span>
      </div>

      {/* Server Error Alert */}
      <AnimatePresence>
        {serverError && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            role="alert"
            className="mb-3 p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-start gap-2 text-xs text-rose-200"
          >
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            <span>{serverError}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <form onSubmit={handleSubmit} noValidate className="space-y-3">
        {/* Honeypot anti-spam trap (hidden from screen readers and human users) */}
        <div className="sr-only" aria-hidden="true">
          <label htmlFor="eb-website-url">Website</label>
          <input
            id="eb-website-url"
            name="website"
            type="text"
            tabIndex={-1}
            autoComplete="off"
            value={honeypot}
            onChange={(e) => setHoneypot(e.target.value)}
          />
        </div>

        {/* Field 1: Name & Field 5: Android Version side-by-side on tablet/desktop for single-screen compactness */}
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5">
          <div className="sm:col-span-7">
            <label
              htmlFor="eb-name"
              className="block text-[11px] font-medium text-slate-300 mb-1"
            >
              Your Name <span className="text-cyan-400">*</span>
            </label>
            <input
              ref={nameInputRef}
              id="eb-name"
              name="name"
              type="text"
              required
              maxLength={120}
              autoComplete="name"
              placeholder="What should we call you?"
              value={name}
              onFocus={() => {
                markFormStarted();
                onFocusChange(true);
              }}
              onBlur={() => onFocusChange(false)}
              onChange={(e) => {
                markFormStarted();
                setName(e.target.value);
                if (fieldErrors.name) {
                  setFieldErrors((prev) => ({ ...prev, name: '' }));
                }
              }}
              className={`w-full rounded-xl bg-[#050711]/90 px-3.5 py-2 text-xs sm:text-sm text-white placeholder-slate-500 border transition-all focus:outline-none ${
                fieldErrors.name
                  ? 'border-rose-500/70 focus:border-rose-400'
                  : 'border-white/[0.1] focus:border-cyan-400/80'
              }`}
            />
            {fieldErrors.name && (
              <p className="mt-1 text-[11px] text-rose-400">{fieldErrors.name}</p>
            )}
          </div>

          {/* Field 5: Android Version Dropdown */}
          <div className="sm:col-span-5">
            <label
              htmlFor="eb-android-version"
              className="block text-[11px] font-medium text-slate-300 mb-1"
            >
              Android Version <span className="text-slate-500 font-normal">(Optional)</span>
            </label>
            <select
              id="eb-android-version"
              name="androidVersion"
              value={androidVersion}
              onChange={(e) => {
                markFormStarted();
                setAndroidVersion(e.target.value);
              }}
              className="w-full rounded-xl bg-[#050711]/90 px-3 py-2 text-xs sm:text-sm text-white border border-white/[0.1] focus:border-cyan-400/80 focus:outline-none transition-colors cursor-pointer"
            >
              {ANDROID_VERSION_OPTIONS.map((ver) => (
                <option key={ver} value={ver} className="bg-[#090C1A] text-white">
                  {ver}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Field 2 & Field 3: Google Play Account Email & Confirm Email */}
        <div className="space-y-2">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {/* Field 2: Google Play Email */}
            <div>
              <label
                htmlFor="eb-email"
                className="block text-[11px] font-medium text-slate-300 mb-1"
              >
                Google Play Account Email <span className="text-cyan-400">*</span>
              </label>
              <div className="relative">
                <input
                  id="eb-email"
                  name="email"
                  type="email"
                  inputMode="email"
                  required
                  maxLength={254}
                  autoComplete="email"
                  placeholder="Your Google Play email address"
                  value={email}
                  onFocus={() => {
                    markFormStarted();
                    setIsEmailFocused(true);
                    onFocusChange(true);
                  }}
                  onBlur={() => {
                    setIsEmailFocused(false);
                    onFocusChange(false);
                  }}
                  onChange={(e) => {
                    markFormStarted();
                    setEmail(e.target.value);
                    if (fieldErrors.email) {
                      setFieldErrors((prev) => ({ ...prev, email: '' }));
                    }
                  }}
                  className={`w-full rounded-xl bg-[#050711]/90 pl-3.5 pr-8 py-2 text-xs sm:text-sm text-white placeholder-slate-500 border transition-all focus:outline-none ${
                    fieldErrors.email
                      ? 'border-rose-500/70 focus:border-rose-400'
                      : emailFormatValid
                      ? 'border-cyan-400/60 focus:border-cyan-300 shadow-[0_0_15px_rgba(34,211,238,0.15)]'
                      : 'border-white/[0.1] focus:border-cyan-400/80'
                  }`}
                />
                {emailFormatValid && (
                  <CheckCircle2
                    aria-label="Valid email format"
                    className="w-4 h-4 text-cyan-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none"
                  />
                )}
              </div>
              {fieldErrors.email && (
                <p className="mt-1 text-[11px] text-rose-400">{fieldErrors.email}</p>
              )}
            </div>

            {/* Field 3: Confirm Email */}
            <div>
              <label
                htmlFor="eb-confirm-email"
                className="block text-[11px] font-medium text-slate-300 mb-1"
              >
                Confirm Email <span className="text-cyan-400">*</span>
              </label>
              <div className="relative">
                <input
                  id="eb-confirm-email"
                  name="confirmEmail"
                  type="email"
                  inputMode="email"
                  required
                  maxLength={254}
                  autoComplete="email"
                  placeholder="Confirm your email"
                  value={confirmEmail}
                  onFocus={() => {
                    markFormStarted();
                    setIsEmailFocused(true);
                    onFocusChange(true);
                  }}
                  onBlur={() => {
                    setIsEmailFocused(false);
                    onFocusChange(false);
                  }}
                  onChange={(e) => {
                    markFormStarted();
                    setConfirmEmail(e.target.value);
                    if (fieldErrors.confirmEmail) {
                      setFieldErrors((prev) => ({ ...prev, confirmEmail: '' }));
                    }
                  }}
                  className={`w-full rounded-xl bg-[#050711]/90 pl-3.5 pr-8 py-2 text-xs sm:text-sm text-white placeholder-slate-500 border transition-all focus:outline-none ${
                    fieldErrors.confirmEmail || (confirmEmail.length > 3 && !emailsMatchValid)
                      ? 'border-rose-500/70 focus:border-rose-400'
                      : emailsMatchValid
                      ? 'border-cyan-400/60 focus:border-cyan-300 shadow-[0_0_15px_rgba(34,211,238,0.15)]'
                      : 'border-white/[0.1] focus:border-cyan-400/80'
                  }`}
                />
                {emailsMatchValid && (
                  <CheckCircle2
                    aria-label="Emails match"
                    className="w-4 h-4 text-emerald-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none"
                  />
                )}
              </div>
              {(fieldErrors.confirmEmail ||
                (submitAttempted && confirmEmail && !emailsMatchValid)) && (
                <p className="mt-1 text-[11px] text-rose-400">
                  {fieldErrors.confirmEmail || 'Email addresses do not match.'}
                </p>
              )}
            </div>
          </div>

          {/* Mandatory Google Play Helper Copy */}
          <p className="text-[11px] text-slate-400 leading-snug">
            Use the Google account you use on Google Play. We&apos;ll use it to coordinate your testing
            invitation.
          </p>
        </div>

        {/* Field 4: What interests you? (Interactive multi-select filter buttons) */}
        <div>
          <label className="block text-[11px] font-medium text-slate-300 mb-1.5">
            What interests you? <span className="text-slate-500 font-normal">(Select any)</span>
          </label>
          <div className="flex flex-wrap gap-1.5" role="group" aria-label="Interests selection">
            {INTEREST_OPTIONS.map((option) => {
              const selected = interests.includes(option.value);
              return (
                <button
                  key={option.id}
                  type="button"
                  aria-pressed={selected}
                  onClick={() => toggleInterest(option.value)}
                  className={`px-2.5 py-1.5 rounded-lg text-[11px] font-medium transition-all cursor-pointer whitespace-nowrap shrink-0 border ${
                    selected
                      ? 'bg-violet-600/30 border-cyan-400/70 text-white shadow-[0_0_12px_rgba(139,92,246,0.28)]'
                      : 'bg-[#050711]/70 border-white/[0.08] text-slate-300 hover:border-white/20 hover:text-white'
                  }`}
                >
                  {option.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Consent Checkboxes (Separated Programme Communication vs Optional Marketing) */}
        <div className="space-y-2 pt-1 border-t border-white/[0.08]">
          <label className="flex items-start gap-2.5 cursor-pointer group">
            <input
              type="checkbox"
              required
              checked={programmeCommunication}
              onChange={(e) => {
                markFormStarted();
                setProgrammeCommunication(e.target.checked);
                if (fieldErrors.consent) {
                  setFieldErrors((prev) => ({ ...prev, consent: '' }));
                }
              }}
              className="mt-0.5 w-4 h-4 rounded border-white/20 bg-[#050711] text-cyan-500 focus:ring-cyan-400 focus:ring-offset-0 cursor-pointer shrink-0"
            />
            <span className="text-[11px] text-slate-300 leading-snug group-hover:text-white transition-colors">
              I agree that AudioFACTORY may use my application details to manage early access and
              communicate about the testing programme. <span className="text-cyan-400">*</span>
            </span>
          </label>
          {fieldErrors.consent && (
            <p className="text-[11px] text-rose-400 pl-6">{fieldErrors.consent}</p>
          )}

          <label className="flex items-start gap-2.5 cursor-pointer group">
            <input
              type="checkbox"
              checked={marketingUpdates}
              onChange={(e) => {
                markFormStarted();
                setMarketingUpdates(e.target.checked);
              }}
              className="mt-0.5 w-4 h-4 rounded border-white/20 bg-[#050711] text-violet-500 focus:ring-violet-400 focus:ring-offset-0 cursor-pointer shrink-0"
            />
            <span className="text-[11px] text-slate-400 leading-snug group-hover:text-slate-200 transition-colors">
              I&apos;d also like to receive future AudioFACTORY product announcements.
            </span>
          </label>
        </div>

        {/* Primary CTA Button */}
        <div className="pt-1">
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full relative overflow-hidden rounded-xl py-3 px-5 font-['Outfit',sans-serif] text-xs sm:text-sm font-bold tracking-wide text-white shadow-[0_0_28px_rgba(124,58,237,0.45)] hover:shadow-[0_0_36px_rgba(34,211,238,0.55)] transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer whitespace-nowrap"
            style={{
              background: 'linear-gradient(135deg, #7C3AED 0%, #6D28D9 45%, #0891B2 100%)',
            }}
          >
            <span className="relative z-10 flex items-center justify-center gap-2">
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-cyan-200" />
                  <span>SECURING YOUR APPLICATION...</span>
                </>
              ) : (
                <span>COUNT ME IN — JOIN EARLY BIRDS 🕊️</span>
              )}
            </span>
          </button>

          {/* Mandatory Sub-Button Caption & Privacy Notice Trigger */}
          <div className="mt-2 flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-400">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
              <span>Free to apply. Selected testers receive an official Google Play invitation.</span>
            </span>
            <button
              type="button"
              onClick={onOpenPrivacy}
              className="text-slate-300 hover:text-cyan-300 underline decoration-white/20 underline-offset-2 transition-colors cursor-pointer whitespace-nowrap"
            >
              Privacy Notice
            </button>
          </div>
        </div>
      </form>
    </motion.div>
  );
};
