/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * AudioFACTORY Early Birds — Server-Side Rate Limiter & Cooldown Protection
 */

interface RateLimitBucket {
  timestamps: number[];
  lastSubmissionAt: number;
}

const buckets = new Map<string, RateLimitBucket>();

export interface RateLimitConfig {
  windowMs: number;
  maxRequestsPerWindow: number;
  minCooldownMs: number;
}

const DEFAULT_CONFIG: RateLimitConfig = {
  windowMs: 15 * 60 * 1000, // 15 minutes
  maxRequestsPerWindow: 8,  // Max 8 attempts per 15 minutes per IP
  minCooldownMs: 2000,      // 2-second minimum interval between submissions
};

export interface RateLimitResult {
  allowed: boolean;
  retryAfterSeconds?: number;
  reason?: string;
}

export function checkRateLimit(
  clientKey: string,
  config: RateLimitConfig = DEFAULT_CONFIG,
  now: number = Date.now()
): RateLimitResult {
  const key = clientKey || 'anonymous_ip';
  const existing = buckets.get(key) || { timestamps: [], lastSubmissionAt: 0 };

  // Prune expired timestamps outside the sliding window
  const windowStart = now - config.windowMs;
  const activeTimestamps = existing.timestamps.filter((t) => t > windowStart);

  // Check rapid-fire cooldown
  if (existing.lastSubmissionAt > 0 && now - existing.lastSubmissionAt < config.minCooldownMs) {
    const retryAfterSeconds = Math.ceil((config.minCooldownMs - (now - existing.lastSubmissionAt)) / 1000);
    return {
      allowed: false,
      retryAfterSeconds: Math.max(1, retryAfterSeconds),
      reason: 'Please wait a moment before submitting again.',
    };
  }

  // Check window quota
  if (activeTimestamps.length >= config.maxRequestsPerWindow) {
    const oldest = activeTimestamps[0];
    const retryAfterSeconds = Math.ceil((oldest + config.windowMs - now) / 1000);
    return {
      allowed: false,
      retryAfterSeconds: Math.max(1, retryAfterSeconds),
      reason: 'Too many submission attempts from this network. Please try again shortly.',
    };
  }

  activeTimestamps.push(now);
  buckets.set(key, {
    timestamps: activeTimestamps,
    lastSubmissionAt: now,
  });

  return { allowed: true };
}

export function resetRateLimiter(): void {
  buckets.clear();
}
