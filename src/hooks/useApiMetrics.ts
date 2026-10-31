/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * AudioFACTORY API Metrics Hook
 * Tracks, logs, and aggregates total token usage, generation latency, and cost transparency for AI calls.
 */
import { useState, useEffect, useCallback } from 'react';

export interface ApiCallMetric {
  id: string;
  timestamp: number;
  operation: string;
  endpoint: string;
  latencyMs: number;
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
  model: string;
  provider: 'gemini' | 'elevenlabs' | 'groq' | 'webaudio';
  status: 'success' | 'error';
  errorMessage?: string;
  estimatedCostUsd: number;
}

export interface ApiMetricsSummary {
  totalCalls: number;
  successfulCalls: number;
  failedCalls: number;
  totalTokens: number;
  totalPromptTokens: number;
  totalCompletionTokens: number;
  totalLatencyMs: number;
  avgLatencyMs: number;
  minLatencyMs: number;
  maxLatencyMs: number;
  estimatedCostUsd: number;
  recentCalls: ApiCallMetric[];
}

const STORAGE_KEY = 'audiofactory_api_metrics_v1';
const MAX_STORED_CALLS = 50;

// Token cost estimates (per 1k tokens) based on Gemini 2.5 Flash / Audio models
const COST_PER_1K_PROMPT_TOKENS = 0.0001875;
const COST_PER_1K_COMPLETION_TOKENS = 0.00075;

// Shared in-memory event emitter for multi-component reactive synchronization
type MetricsListener = (metrics: ApiCallMetric[]) => void;
const listeners = new Set<MetricsListener>();

function loadInitialMetrics(): ApiCallMetric[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch (err) {
    console.warn('[useApiMetrics] Failed to load cached metrics:', err);
  }
  return [];
}

let metricsStore: ApiCallMetric[] = loadInitialMetrics();

function persistMetrics(items: ApiCallMetric[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items.slice(0, MAX_STORED_CALLS)));
  } catch {
    // LocalStorage quota fallback
  }
}

function notifySubscribers(): void {
  const snapshot = [...metricsStore];
  listeners.forEach((fn) => {
    try {
      fn(snapshot);
    } catch (e) {
      console.error('[useApiMetrics] Error notifying listener:', e);
    }
  });
}

/**
 * Estimate token count from text or payload size (~4 characters per token average)
 */
export function estimateTokens(textOrPayload: any): number {
  if (!textOrPayload) return 0;
  const str = typeof textOrPayload === 'string' ? textOrPayload : JSON.stringify(textOrPayload);
  return Math.max(1, Math.ceil(str.length / 4));
}

/**
 * Estimate cost in USD
 */
export function calculateEstimatedCost(promptTokens: number, completionTokens: number): number {
  const promptCost = (promptTokens / 1000) * COST_PER_1K_PROMPT_TOKENS;
  const completionCost = (completionTokens / 1000) * COST_PER_1K_COMPLETION_TOKENS;
  return Number((promptCost + completionCost).toFixed(6));
}

/**
 * Global helper to record an AI API invocation metric from anywhere in the app
 */
export function recordApiMetric(metric: Omit<ApiCallMetric, 'id' | 'timestamp' | 'estimatedCostUsd'> & {
  estimatedCostUsd?: number;
}): ApiCallMetric {
  const promptTokens = metric.promptTokens || 0;
  const completionTokens = metric.completionTokens || 0;
  const totalTokens = metric.totalTokens || (promptTokens + completionTokens);
  const cost = metric.estimatedCostUsd ?? calculateEstimatedCost(promptTokens, completionTokens);

  const newEntry: ApiCallMetric = {
    id: `metric_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    timestamp: Date.now(),
    ...metric,
    promptTokens,
    completionTokens,
    totalTokens,
    estimatedCostUsd: cost,
  };

  metricsStore = [newEntry, ...metricsStore.slice(0, MAX_STORED_CALLS - 1)];
  persistMetrics(metricsStore);
  notifySubscribers();

  return newEntry;
}

/**
 * Helper to measure asynchronous AI API call latency and record metric
 */
export async function measureApiCall<T>(
  operation: string,
  endpoint: string,
  payload: any,
  caller: () => Promise<T>,
  options: {
    model?: string;
    provider?: 'gemini' | 'elevenlabs' | 'groq' | 'webaudio';
    estimatedCompletionTokens?: (res: T) => number;
  } = {}
): Promise<T> {
  const start = performance.now();
  const promptTokens = estimateTokens(payload);
  const model = options.model || 'gemini-2.5-flash';
  const provider = options.provider || 'gemini';

  try {
    const result = await caller();
    const latencyMs = Math.round(performance.now() - start);
    const completionTokens = options.estimatedCompletionTokens
      ? options.estimatedCompletionTokens(result)
      : estimateTokens(result);

    recordApiMetric({
      operation,
      endpoint,
      latencyMs,
      promptTokens,
      completionTokens,
      totalTokens: promptTokens + completionTokens,
      model,
      provider,
      status: 'success',
    });

    return result;
  } catch (err: any) {
    const latencyMs = Math.round(performance.now() - start);
    recordApiMetric({
      operation,
      endpoint,
      latencyMs,
      promptTokens,
      completionTokens: 0,
      totalTokens: promptTokens,
      model,
      provider,
      status: 'error',
      errorMessage: err?.message || String(err),
    });
    throw err;
  }
}

/**
 * React Hook: useApiMetrics
 * Provides live aggregate statistics, recent calls, latency averages, and clearing functions
 */
export function useApiMetrics() {
  const [metrics, setMetrics] = useState<ApiCallMetric[]>(metricsStore);

  useEffect(() => {
    const handleUpdate = (updated: ApiCallMetric[]) => {
      setMetrics(updated);
    };
    listeners.add(handleUpdate);
    return () => {
      listeners.delete(handleUpdate);
    };
  }, []);

  const clearMetrics = useCallback(() => {
    metricsStore = [];
    persistMetrics([]);
    notifySubscribers();
  }, []);

  // Compute aggregated summary
  const summary: ApiMetricsSummary = {
    totalCalls: metrics.length,
    successfulCalls: metrics.filter((m) => m.status === 'success').length,
    failedCalls: metrics.filter((m) => m.status === 'error').length,
    totalTokens: metrics.reduce((acc, m) => acc + m.totalTokens, 0),
    totalPromptTokens: metrics.reduce((acc, m) => acc + m.promptTokens, 0),
    totalCompletionTokens: metrics.reduce((acc, m) => acc + m.completionTokens, 0),
    totalLatencyMs: metrics.reduce((acc, m) => acc + m.latencyMs, 0),
    avgLatencyMs: metrics.length > 0 ? Math.round(metrics.reduce((acc, m) => acc + m.latencyMs, 0) / metrics.length) : 0,
    minLatencyMs: metrics.length > 0 ? Math.min(...metrics.map((m) => m.latencyMs)) : 0,
    maxLatencyMs: metrics.length > 0 ? Math.max(...metrics.map((m) => m.latencyMs)) : 0,
    estimatedCostUsd: Number(metrics.reduce((acc, m) => acc + m.estimatedCostUsd, 0).toFixed(5)),
    recentCalls: metrics,
  };

  return {
    metrics,
    summary,
    recentCalls: metrics,
    totalTokens: summary.totalTokens,
    avgLatencyMs: summary.avgLatencyMs,
    totalCalls: summary.totalCalls,
    estimatedCostUsd: summary.estimatedCostUsd,
    clearMetrics,
    recordMetric: recordApiMetric,
    measureApiCall,
  };
}

export default useApiMetrics;
