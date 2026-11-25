/**
 * ╔══════════════════════════════════════════════════════════════════╗
 * ║  PROJECT-SPECIFIC AUTHENTICATION ADAPTER                        ║
 * ║  THIS is the only file to adapt to YOUR project's auth flow.     ║
 * ║  It ships once with the scaffold and is never overwritten by     ║
 * ║  `bun sync` - the CLI around it (scripts/lib/api-login-core.ts) ║
 * ║  keeps syncing, so upstream improvements arrive without          ║
 * ║  clobbering this adaptation.                                     ║
 * ╚══════════════════════════════════════════════════════════════════╝
 *
 * The boilerplate default is POST /auth/login with `{ email, password }`
 * returning `{ access_token, token_type, expires_in, refresh_token? }`.
 * Your project may use OAuth2 form data, an API key, a PAT exchange, or a
 * different response shape: change the two functions below.
 *
 * Contract (see `ApiLoginAdapter` in scripts/lib/api-login-core.ts):
 *   buildAuthPayload            (required) request body for the auth endpoint
 *   extractTokenFromResponse    (required) token fields out of the response
 *   loginEndpoint               (optional) overrides config.auth.loginEndpoint
 *   headers                     (optional) extra request headers
 *   environments                (optional) positional environments this project
 *                               accepts; keep in sync with the `Environment`
 *                               union in config/variables.ts
 *   extraFlags                  (optional) project flags that take a value
 *                               (e.g. ['--method']); their values arrive in
 *                               `context.flags` and never get mistaken for the
 *                               positional environment
 *   authenticate                (optional) LAST RESORT - see below
 *
 * ── `authenticate` is the LAST RESORT ─────────────────────────────────────
 * Export it only when the flow cannot be expressed as ONE request: reusing a
 * token you already hold (zero requests), branching on a 401, chaining several
 * requests across different paths, or reading the credential from somewhere
 * other than that one response body. It replaces the core's POST entirely, so
 * this project stops receiving upstream improvements to the request phase -
 * retry, backoff, timeouts, error rendering - and owns them itself. That is
 * expressiveness bought with divergence: take it only when there is no
 * alternative, and keep `buildAuthPayload` for every flow that is one request.
 *
 *   export async function authenticate(
 *     { email, password }: { email: string, password: string },
 *     context: ApiLoginContext,
 *     io: ApiLoginIo,
 *   ): Promise<ExtractedToken | null> {
 *     const response = await io.fetch(`${io.apiUrl}/auth/token`, { ... });
 *     if (!response.ok) {
 *       io.log(`Auth failed with ${response.status}`, 'error');
 *       return null;   // the core exits 1; log the reason yourself
 *     }
 *     return { accessToken: '...', tokenType: 'Bearer', expiresIn: 3600, refreshToken: null };
 *   }
 *
 * Everything around it is unchanged: argument parsing, `--role`, `--profile`,
 * `--help`, the empty-token check and the three output files stay the core's.
 */

import type { ApiLoginContext, ExtractedToken } from './lib/api-login-core';

/**
 * Environments accepted as the positional argument. MUST match the
 * `Environment` union in config/variables.ts (add 'qa' / 'production' in both
 * places when the project grows them).
 */
export const environments = ['local', 'staging'] as const;

/**
 * Bunkai headless sign-in: POST /api/v1/auth/signin returns `{ user, session, pat }`.
 * The API's bearerAuth scheme is the personal access token (`pat.token`), so that
 * is the token stored; each call mints a 1-day PAT.
 */
export const loginEndpoint = '/auth/signin';

const PAT_LIFETIME_DAYS = 1;

export function buildAuthPayload(
  email: string,
  password: string,
  _context: ApiLoginContext,
): Record<string, unknown> {
  return { email, password, pat_name: 'qa-api-login', pat_expires_in_days: PAT_LIFETIME_DAYS };
}

export function extractTokenFromResponse(
  body: Record<string, unknown>,
  _context: ApiLoginContext,
): ExtractedToken {
  const pat = (body.pat ?? {}) as Record<string, unknown>;
  const session = (body.session ?? {}) as Record<string, unknown>;
  return {
    accessToken: String(pat.token ?? ''),
    tokenType: 'Bearer',
    expiresIn: PAT_LIFETIME_DAYS * 86400,
    refreshToken: session.refresh_token ? String(session.refresh_token) : null,
  };
}
