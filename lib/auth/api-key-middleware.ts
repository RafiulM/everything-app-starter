import { NextRequest, NextResponse } from 'next/server';
import { ApiKeyService } from '@/lib/api-keys';
import { type ApiKeyScope } from '@/db/schema/api-keys';

export interface ApiKeyAuthResult {
  keyId: string;
  userId: string;
  scopes: ApiKeyScope[];
}

export interface ApiKeyMiddlewareOptions {
  requiredScopes?: ApiKeyScope[];
  optional?: boolean; // If true, doesn't require API key auth but will use it if present
}

/**
 * Middleware to authenticate requests using API keys
 *
 * Usage:
 * ```typescript
 * // Require API key with specific scopes
 * const result = await withApiKeyAuth(request, {
 *   requiredScopes: ['chat:write', 'search:read']
 * });
 *
 * // Optional API key auth (falls back to session auth)
 * const result = await withApiKeyAuth(request, { optional: true });
 * ```
 */
export async function withApiKeyAuth(
  request: NextRequest,
  options: ApiKeyMiddlewareOptions = {}
): Promise<ApiKeyAuthResult | null> {
  try {
    // Extract Authorization header
    const authHeader = request.headers.get('authorization');

    if (!authHeader) {
      if (options.optional) {
        return null;
      }
      throw new Error('Missing Authorization header');
    }

    // Parse Bearer token
    const match = authHeader.match(/^Bearer\s+(.+)$/);
    if (!match) {
      throw new Error('Invalid Authorization header format. Expected: Bearer <api-key>');
    }

    const apiKey = match[1];

    // Validate API key format
    if (!apiKey.startsWith('ak_')) {
      throw new Error('Invalid API key format');
    }

    // Validate the API key and get user info
    const keyInfo = await ApiKeyService.validateApiKey(apiKey);

    if (!keyInfo) {
      throw new Error('Invalid or expired API key');
    }

    // Check required scopes
    if (options.requiredScopes && options.requiredScopes.length > 0) {
      const hasAllScopes = options.requiredScopes.every(scope =>
        keyInfo.scopes.includes(scope)
      );

      if (!hasAllScopes) {
        const missingScopes = options.requiredScopes.filter(
          scope => !keyInfo.scopes.includes(scope)
        );
        throw new Error(`Insufficient scopes. Missing: ${missingScopes.join(', ')}`);
      }
    }

    // Log the API usage for audit trail
    await ApiKeyService.logApiKeyUsage({
      keyId: keyInfo.id,
      userId: keyInfo.userId,
      endpoint: new URL(request.url).pathname,
      ipAddress: request.ip || request.headers.get('x-forwarded-for') || undefined,
      userAgent: request.headers.get('user-agent') || undefined,
      metadata: {
        method: request.method,
        scopes: keyInfo.scopes,
      },
    });

    return {
      keyId: keyInfo.id,
      userId: keyInfo.userId,
      scopes: keyInfo.scopes,
    };
  } catch (error) {
    if (options.optional) {
      return null;
    }
    throw error;
  }
}

/**
 * Helper function to create API key auth error responses
 */
export function createApiKeyAuthError(error: Error): NextResponse {
  const message = error.message;

  // Don't expose specific validation errors for security
  const isSecuritySensitive = [
    'Invalid or expired API key',
    'Invalid API key format',
  ].includes(message);

  return NextResponse.json(
    {
      error: isSecuritySensitive ? 'Authentication failed' : message,
      type: 'auth_error'
    },
    {
      status: 401,
      headers: {
        'WWW-Authenticate': 'Bearer realm="API", error="invalid_token"',
      }
    }
  );
}

/**
 * Helper function to create scope error responses
 */
export function createScopeError(missingScopes: string[]): NextResponse {
  return NextResponse.json(
    {
      error: 'Insufficient permissions',
      type: 'scope_error',
      details: {
        required: missingScopes,
        message: `Missing required scopes: ${missingScopes.join(', ')}`
      }
    },
    {
      status: 403,
      headers: {
        'WWW-Authenticate': `Bearer realm="API", error="insufficient_scope", scope="${missingScopes.join(' ')}"`,
      }
    }
  );
}

/**
 * Higher-order function to wrap API route handlers with API key authentication
 */
export function withApiKeyAuthHandler<T extends any[]>(
  handler: (request: NextRequest, context: { auth: ApiKeyAuthResult } & Record<string, any>) => Promise<NextResponse>,
  options: ApiKeyMiddlewareOptions = {}
) {
  return async (request: NextRequest, context?: any) => {
    try {
      const auth = await withApiKeyAuth(request, options);

      if (!auth && !options.optional) {
        return createApiKeyAuthError(new Error('Authentication required'));
      }

      return handler(request, { ...context, auth });
    } catch (error) {
      if (error instanceof Error) {
        if (error.message.includes('Insufficient scopes')) {
          const missingScopes = error.message.match(/Missing: (.+)/)?.[1]?.split(', ') || [];
          return createScopeError(missingScopes);
        }
        return createApiKeyAuthError(error);
      }

      return NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      );
    }
  };
}

/**
 * Utility to extract user ID from request, supporting both session and API key auth
 */
export async function getUserIdFromRequest(request: NextRequest): Promise<string | null> {
  try {
    // First try API key auth
    const apiKeyAuth = await withApiKeyAuth(request, { optional: true });
    if (apiKeyAuth) {
      return apiKeyAuth.userId;
    }

    // Fall back to session auth
    const { auth: betterAuth } = await import('@/lib/auth');
    const session = await betterAuth.api.getSession({
      headers: request.headers,
    });

    return session?.user?.id || null;
  } catch (error) {
    console.error('Error extracting user ID from request:', error);
    return null;
  }
}