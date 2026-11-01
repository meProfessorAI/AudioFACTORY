/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * AudioFACTORY Same-Origin Firebase Authentication Helper Reverse Proxy
 *
 * Proxies `/__/auth/**` and `/__/firebase/**` to `https://audiofactory-eia.firebaseapp.com`
 * in accordance with official Firebase Redirect Best Practices:
 * https://firebase.google.com/docs/auth/web/redirect-best-practices
 */
import type { Request, Response, NextFunction } from 'express';

export const FIREBASE_HOSTING_ORIGIN = 'https://audiofactory-eia.firebaseapp.com';

const FORWARDED_REQUEST_HEADERS = [
  'accept',
  'accept-language',
  'content-type',
  'user-agent',
  'cookie',
  'origin',
  'referer',
  'sec-fetch-dest',
  'sec-fetch-mode',
  'sec-fetch-site',
  'sec-fetch-user',
];

const FORWARDED_RESPONSE_HEADERS = [
  'content-type',
  'cache-control',
  'etag',
  'last-modified',
  'location',
  'set-cookie',
  'x-frame-options',
  'content-security-policy',
  'cross-origin-opener-policy',
  'cross-origin-embedder-policy',
  'access-control-allow-origin',
  'access-control-allow-methods',
  'access-control-allow-headers',
];

/**
 * Redacts sensitive OAuth query parameters before any diagnostic logging.
 * Never logs authorization codes, access tokens, ID tokens, or OAuth state.
 */
export function redactAuthUrl(rawUrl: string): string {
  try {
    const parsed = new URL(rawUrl, 'https://audiofactory.vercel.app');
    const sensitiveParams = [
      'code',
      'state',
      'id_token',
      'access_token',
      'refresh_token',
      'session_state',
      'oauth_token',
      'oauth_verifier',
      'apiKey',
    ];
    for (const key of sensitiveParams) {
      if (parsed.searchParams.has(key)) {
        parsed.searchParams.set(key, '[REDACTED]');
      }
    }
    return `${parsed.pathname}${parsed.search}`;
  } catch {
    return '/__/auth/[redacted]';
  }
}

/**
 * Serializes the incoming Express request body for upstream POST requests
 * (e.g., OAuth `form_post` responses to `/__/auth/handler`).
 */
export function serializeProxyRequestBody(req: Request): string | Buffer | undefined {
  const method = (req.method || 'GET').toUpperCase();
  if (method === 'GET' || method === 'HEAD' || method === 'OPTIONS') {
    return undefined;
  }

  if (Buffer.isBuffer(req.body)) {
    return req.body;
  }

  if (typeof req.body === 'string') {
    return req.body;
  }

  if (req.body && typeof req.body === 'object' && Object.keys(req.body).length > 0) {
    const contentType = String(req.headers['content-type'] || '').toLowerCase();
    if (contentType.includes('application/x-www-form-urlencoded')) {
      const params = new URLSearchParams();
      for (const [k, v] of Object.entries(req.body)) {
        if (v !== undefined && v !== null) {
          params.append(k, String(v));
        }
      }
      return params.toString();
    }
    return JSON.stringify(req.body);
  }

  return undefined;
}

/**
 * Express middleware that transparently reverse-proxies `/__/auth/**` and `/__/firebase/**`
 * to `https://audiofactory-eia.firebaseapp.com`.
 */
export async function firebaseAuthProxyMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  const urlPath = req.originalUrl || req.url || '';
  if (!urlPath.startsWith('/__/auth') && !urlPath.startsWith('/__/firebase')) {
    next();
    return;
  }

  const method = (req.method || 'GET').toUpperCase();
  if (method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, HEAD, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
    res.status(204).end();
    return;
  }

  const targetUrl = `${FIREBASE_HOSTING_ORIGIN}${urlPath}`;

  try {
    const upstreamHeaders: Record<string, string> = {};
    for (const headerName of FORWARDED_REQUEST_HEADERS) {
      const val = req.headers[headerName];
      if (typeof val === 'string' && val.length > 0) {
        upstreamHeaders[headerName] = val;
      } else if (Array.isArray(val) && val.length > 0) {
        upstreamHeaders[headerName] = val.join(', ');
      }
    }

    const hostHeader = req.headers['x-forwarded-host'] || req.headers.host;
    if (typeof hostHeader === 'string' && hostHeader.length > 0) {
      upstreamHeaders['x-forwarded-host'] = hostHeader;
    }
    upstreamHeaders['x-forwarded-proto'] = 'https';

    const body = serializeProxyRequestBody(req);

    const upstreamRes = await fetch(targetUrl, {
      method,
      headers: upstreamHeaders,
      body: body as any,
      redirect: 'manual',
    });

    res.status(upstreamRes.status);

    for (const headerName of FORWARDED_RESPONSE_HEADERS) {
      const val = upstreamRes.headers.get(headerName);
      if (val) {
        res.setHeader(headerName, val);
      }
    }

    // Forward multiple Set-Cookie headers if present in Node fetch
    const getSetCookie = (upstreamRes.headers as any).getSetCookie;
    if (typeof getSetCookie === 'function') {
      const cookies = getSetCookie.call(upstreamRes.headers);
      if (Array.isArray(cookies) && cookies.length > 0) {
        res.setHeader('set-cookie', cookies);
      }
    }

    if (method === 'HEAD') {
      res.end();
      return;
    }

    const arrayBuffer = await upstreamRes.arrayBuffer();
    res.send(Buffer.from(arrayBuffer));
  } catch (err) {
    console.error(`[Auth Proxy] Failed to proxy ${method} ${redactAuthUrl(urlPath)}:`, err instanceof Error ? err.message : 'Upstream error');
    res.status(502).json({
      error: 'Bad Gateway',
      message: 'Unable to reach Firebase Authentication helper endpoint.',
    });
  }
}
