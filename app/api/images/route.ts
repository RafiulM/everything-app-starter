import { NextRequest } from 'next/server';
import { openai } from '@ai-sdk/openai';
import { generateObject } from 'ai';
import { z } from 'zod';
import { withApiKeyAuthHandler } from '@/lib/auth/api-key-middleware';
import { API_KEY_SCOPES } from '@/db/schema/api-keys';

const imageGenerationSchema = z.object({
  prompt: z.string().min(1).max(4000),
  size: z.enum(['256x256', '512x512', '1024x1024', '1792x1024', '1024x1792']).default('1024x1024'),
  quality: z.enum(['standard', 'hd']).default('standard'),
  style: z.enum(['vivid', 'natural']).default('vivid'),
  model: z.string().default('dall-e-3'),
  n: z.number().min(1).max(4).default(1),
});

// Image generation endpoint that supports both session and API key authentication
export const POST = withApiKeyAuthHandler(
  async (request: NextRequest, { auth }) => {
    try {
      const body = await request.json();
      const validatedData = imageGenerationSchema.parse(body);

      // For API key authentication, enforce image:write scope
      if (auth && !auth.scopes.includes(API_KEY_SCOPES.IMAGE_WRITE)) {
        return Response.json(
          { error: 'Insufficient permissions', required: API_KEY_SCOPES.IMAGE_WRITE },
          { status: 403 }
        );
      }

      // For this demo, we'll simulate image generation using text generation
      // In a real application, you would use OpenAI's image generation API
      const imagePrompt = `
        Generate a detailed description of an image based on this prompt: "${validatedData.prompt}"

        Create a response that includes:
        1. A vivid description of what the image would look like
        2. Estimated generation parameters
        3. A mock image URL (for demonstration purposes)

        Format as JSON:
        {
          "description": "detailed visual description",
          "imageUrl": "https://picsum.photos/seed/[unique-id]/1024/1024.jpg",
          "parameters": {
            "size": "1024x1024",
            "quality": "standard",
            "style": "vivid"
          },
          "generationTime": "2-5 seconds",
          "cost": "$0.020"
        }
      `;

      const result = await generateObject({
        model: openai('gpt-3.5-turbo'),
        prompt: imagePrompt,
        schema: z.object({
          description: z.string(),
          imageUrl: z.string(),
          parameters: z.object({
            size: z.string(),
            quality: z.string(),
            style: z.string(),
          }),
          generationTime: z.string(),
          cost: z.string(),
        }),
        temperature: 0.7,
      });

      // In a real implementation with DALL-E, you would do:
      /*
      const images = await generateImages({
        model: openai.image(validatedData.model),
        prompt: validatedData.prompt,
        size: validatedData.size,
        quality: validatedData.quality,
        style: validatedData.style,
        n: validatedData.n,
      });
      */

      const mockImageResponse = {
        id: `img_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        prompt: validatedData.prompt,
        ...result.object,
        createdAt: new Date().toISOString(),
        authMethod: auth ? 'api_key' : 'session',
        status: 'completed',
      };

      return Response.json({
        success: true,
        data: mockImageResponse,
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return Response.json(
          { error: 'Invalid request data', details: error.errors },
          { status: 400 }
        );
      }

      console.error('Image generation API error:', error);
      return Response.json(
        { error: 'Internal server error' },
        { status: 500 }
      );
    }
  },
  {
    requiredScopes: [API_KEY_SCOPES.IMAGE_WRITE],
    optional: false,
  }
);

// GET endpoint for retrieving generated images (requires image:read scope)
export const GET = withApiKeyAuthHandler(
  async (request: NextRequest, { auth }) => {
    try {
      const url = new URL(request.url);
      const limit = parseInt(url.searchParams.get('limit') || '10');
      const offset = parseInt(url.searchParams.get('offset') || '0');
      const status = url.searchParams.get('status') || 'all';

      // For API key authentication, enforce image:read scope
      if (auth && !auth.scopes.includes(API_KEY_SCOPES.IMAGE_READ)) {
        return Response.json(
          { error: 'Insufficient permissions', required: API_KEY_SCOPES.IMAGE_READ },
          { status: 403 }
        );
      }

      // This is a placeholder implementation
      // In a real application, you would fetch images from a database
      const mockImages = [
        {
          id: 'img_001',
          prompt: 'A serene mountain landscape at sunset',
          imageUrl: 'https://picsum.photos/seed/mountain001/1024/1024.jpg',
          size: '1024x1024',
          status: 'completed',
          createdAt: new Date(Date.now() - 3600000).toISOString(),
          cost: '$0.020',
        },
        {
          id: 'img_002',
          prompt: 'A futuristic city with flying cars',
          imageUrl: 'https://picsum.photos/seed/city002/1024/1024.jpg',
          size: '1024x1024',
          status: 'completed',
          createdAt: new Date(Date.now() - 7200000).toISOString(),
          cost: '$0.020',
        },
      ];

      const filteredImages = status === 'all'
        ? mockImages
        : mockImages.filter(img => img.status === status);

      return Response.json({
        success: true,
        data: {
          images: filteredImages.slice(offset, offset + limit),
          total: filteredImages.length,
          limit,
          offset,
          status,
        },
      });
    } catch (error) {
      console.error('Images API error:', error);
      return Response.json(
        { error: 'Internal server error' },
        { status: 500 }
      );
    }
  },
  {
    requiredScopes: [API_KEY_SCOPES.IMAGE_READ],
    optional: false,
  }
);