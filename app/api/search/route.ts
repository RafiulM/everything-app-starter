import { NextRequest } from 'next/server';
import { openai } from '@ai-sdk/openai';
import { generateText } from 'ai';
import { z } from 'zod';
import { withApiKeyAuthHandler } from '@/lib/auth/api-key-middleware';
import { API_KEY_SCOPES } from '@/db/schema/api-keys';

const searchRequestSchema = z.object({
  query: z.string().min(1).max(1000),
  context: z.string().optional(),
  model: z.string().default('gpt-3.5-turbo'),
  maxResults: z.number().min(1).max(10).default(5),
});

// Search endpoint that supports both session and API key authentication
export const POST = withApiKeyAuthHandler(
  async (request: NextRequest, { auth }) => {
    try {
      const body = await request.json();
      const validatedData = searchRequestSchema.parse(body);

      // For API key authentication, enforce search:write scope
      if (auth && !auth.scopes.includes(API_KEY_SCOPES.SEARCH_WRITE)) {
        return Response.json(
          { error: 'Insufficient permissions', required: API_KEY_SCOPES.SEARCH_WRITE },
          { status: 403 }
        );
      }

      // Simulate search functionality using AI to generate relevant search results
      const searchPrompt = `
        You are a search assistant. Based on the user's query, generate relevant search results and summaries.

        User query: "${validatedData.query}"
        ${validatedData.context ? `Additional context: "${validatedData.context}"` : ''}

        Please provide:
        1. A direct answer to the query
        2. 3-5 relevant search results with titles and descriptions
        3. Confidence score for the results

        Format your response as JSON with the following structure:
        {
          "answer": "direct answer to the query",
          "results": [
            {
              "title": "result title",
              "description": "result description",
              "url": "example.com",
              "relevance": 0.95
            }
          ],
          "confidence": 0.9
        }
      `;

      const result = await generateText({
        model: openai(validatedData.model),
        prompt: searchPrompt,
        temperature: 0.3, // Lower temperature for more consistent search results
        maxTokens: 2000,
      });

      let searchResults;
      try {
        searchResults = JSON.parse(result.text);
      } catch (parseError) {
        // If JSON parsing fails, create a fallback response
        searchResults = {
          answer: result.text,
          results: [],
          confidence: 0.5,
        };
      }

      return Response.json({
        success: true,
        data: {
          query: validatedData.query,
          ...searchResults,
          timestamp: new Date().toISOString(),
          authMethod: auth ? 'api_key' : 'session',
        },
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return Response.json(
          { error: 'Invalid request data', details: error.errors },
          { status: 400 }
        );
      }

      console.error('Search API error:', error);
      return Response.json(
        { error: 'Internal server error' },
        { status: 500 }
      );
    }
  },
  {
    requiredScopes: [API_KEY_SCOPES.SEARCH_WRITE],
    optional: false,
  }
);

// GET endpoint for retrieving search history (requires search:read scope)
export const GET = withApiKeyAuthHandler(
  async (request: NextRequest, { auth }) => {
    try {
      const url = new URL(request.url);
      const limit = parseInt(url.searchParams.get('limit') || '10');
      const offset = parseInt(url.searchParams.get('offset') || '0');

      // For API key authentication, enforce search:read scope
      if (auth && !auth.scopes.includes(API_KEY_SCOPES.SEARCH_READ)) {
        return Response.json(
          { error: 'Insufficient permissions', required: API_KEY_SCOPES.SEARCH_READ },
          { status: 403 }
        );
      }

      // This is a placeholder implementation
      // In a real application, you would fetch search history from a database
      const mockSearchHistory = [
        {
          id: '1',
          query: 'What is artificial intelligence?',
          timestamp: new Date(Date.now() - 86400000).toISOString(),
          resultsCount: 5,
        },
        {
          id: '2',
          query: 'How does machine learning work?',
          timestamp: new Date(Date.now() - 172800000).toISOString(),
          resultsCount: 3,
        },
      ];

      return Response.json({
        success: true,
        data: {
          searches: mockSearchHistory.slice(offset, offset + limit),
          total: mockSearchHistory.length,
          limit,
          offset,
        },
      });
    } catch (error) {
      console.error('Search history API error:', error);
      return Response.json(
        { error: 'Internal server error' },
        { status: 500 }
      );
    }
  },
  {
    requiredScopes: [API_KEY_SCOPES.SEARCH_READ],
    optional: false,
  }
);