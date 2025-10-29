import { NextRequest } from 'next/server';
import { openai } from '@ai-sdk/openai';
import { streamText } from 'ai';
import { z } from 'zod';
import { withApiKeyAuthHandler } from '@/lib/auth/api-key-middleware';
import { API_KEY_SCOPES } from '@/db/schema/api-keys';

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

const chatRequestSchema = z.object({
  messages: z.array(z.object({
    role: z.enum(['user', 'assistant', 'system']),
    content: z.string(),
  })).min(1),
  model: z.string().default('gpt-3.5-turbo'),
  temperature: z.number().min(0).max(2).default(0.7),
  maxTokens: z.number().min(1).max(4000).default(1000),
});

// Chat endpoint that supports both session and API key authentication
export const POST = withApiKeyAuthHandler(
  async (request: NextRequest, { auth }) => {
    try {
      const body = await request.json();
      const validatedData = chatRequestSchema.parse(body);

      // For API key authentication, enforce chat:write scope
      if (auth && !auth.scopes.includes(API_KEY_SCOPES.CHAT_WRITE)) {
        return Response.json(
          { error: 'Insufficient permissions', required: API_KEY_SCOPES.CHAT_WRITE },
          { status: 403 }
        );
      }

      const result = await streamText({
        model: openai(validatedData.model),
        messages: validatedData.messages,
        temperature: validatedData.temperature,
        maxTokens: validatedData.maxTokens,
        system: `You are a helpful AI assistant. Provide accurate, helpful, and thoughtful responses to user queries.

        ${auth ?
          `Note: This request is being made via API key ${auth.keyId}. The user has the following scopes: ${auth.scopes.join(', ')}`
          :
          'Note: This request is being made by an authenticated user session.'
        }`,
      });

      return result.toDataStreamResponse();
    } catch (error) {
      if (error instanceof z.ZodError) {
        return Response.json(
          { error: 'Invalid request data', details: error.errors },
          { status: 400 }
        );
      }

      console.error('Chat API error:', error);
      return Response.json(
        { error: 'Internal server error' },
        { status: 500 }
      );
    }
  },
  {
    requiredScopes: [API_KEY_SCOPES.CHAT_WRITE],
    optional: false, // Require either API key or session auth
  }
);

// For backward compatibility, we also support session-only auth
// This allows the chat endpoint to work with both authentication methods
export async function POST_LEGACY(request: NextRequest) {
  // Try API key auth first
  const apiKeyAuth = await withApiKeyAuth(request, { optional: true });

  if (apiKeyAuth) {
    // If API key auth succeeded, validate scopes
    if (!apiKeyAuth.scopes.includes(API_KEY_SCOPES.CHAT_WRITE)) {
      return Response.json(
        { error: 'Insufficient permissions', required: API_KEY_SCOPES.CHAT_WRITE },
        { status: 403 }
      );
    }

    // Delegate to the authenticated handler
    return POST(request, { auth: apiKeyAuth });
  }

  // Fall back to session authentication
  const { auth } = await import('@/lib/auth');
  const session = await auth.api.getSession({
    headers: request.headers,
  });

  if (!session?.user) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // For session auth, we can create a minimal auth object
  const sessionAuth = {
    keyId: `session_${session.user.id}`,
    userId: session.user.id,
    scopes: [API_KEY_SCOPES.CHAT_WRITE, API_KEY_SCOPES.CHAT_READ], // Assume full access for session users
  };

  return POST(request, { auth: sessionAuth });
}