import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/db';
import { userApiKeys } from '@/db/schema/auth';
import { eq, and } from 'drizzle-orm';
import { auth } from '@/lib/auth';
import { decrypt } from '@/lib/crypto';

const testApiKeySchema = z.object({
  keyId: z.string().min(1),
});

interface TestResult {
  success: boolean;
  message: string;
  details?: any;
}

/**
 * Test API key by making a request to the provider
 */
async function testProviderKey(serviceProvider: string, apiKey: string): Promise<TestResult> {
  try {
    switch (serviceProvider.toLowerCase()) {
      case 'openai':
        return await testOpenAIKey(apiKey);
      case 'anthropic':
        return await testAnthropicKey(apiKey);
      case 'google':
        return await testGoogleKey(apiKey);
      default:
        return {
          success: false,
          message: `Unsupported service provider: ${serviceProvider}`
        };
    }
  } catch (error) {
    return {
      success: false,
      message: `Error testing ${serviceProvider} key: ${error instanceof Error ? error.message : 'Unknown error'}`
    };
  }
}

/**
 * Test OpenAI API key
 */
async function testOpenAIKey(apiKey: string): Promise<TestResult> {
  try {
    const response = await fetch('https://api.openai.com/v1/models', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      signal: AbortSignal.timeout(10000), // 10 second timeout
    });

    if (response.ok) {
      const data = await response.json();
      return {
        success: true,
        message: 'OpenAI API key is valid',
        details: {
          modelCount: data.data?.length || 0,
          models: data.data?.slice(0, 5).map((m: any) => m.id) || []
        }
      };
    } else {
      const errorData = await response.text();
      return {
        success: false,
        message: `OpenAI API key is invalid: ${response.status} ${response.statusText}`,
        details: errorData.substring(0, 200)
      };
    }
  } catch (error) {
    return {
      success: false,
      message: `Failed to connect to OpenAI API: ${error instanceof Error ? error.message : 'Unknown error'}`
    };
  }
}

/**
 * Test Anthropic (Claude) API key
 */
async function testAnthropicKey(apiKey: string): Promise<TestResult> {
  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': apiKey,
        'Content-Type': 'application/json',
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-3-haiku-20240307',
        max_tokens: 10,
        messages: [{ role: 'user', content: 'Hi' }],
      }),
      signal: AbortSignal.timeout(10000), // 10 second timeout
    });

    if (response.ok) {
      return {
        success: true,
        message: 'Anthropic API key is valid',
        details: { model: 'claude-3-haiku-20240307' }
      };
    } else {
      const errorData = await response.text();
      return {
        success: false,
        message: `Anthropic API key is invalid: ${response.status} ${response.statusText}`,
        details: errorData.substring(0, 200)
      };
    }
  } catch (error) {
    return {
      success: false,
      message: `Failed to connect to Anthropic API: ${error instanceof Error ? error.message : 'Unknown error'}`
    };
  }
}

/**
 * Test Google API key
 */
async function testGoogleKey(apiKey: string): Promise<TestResult> {
  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1/models?key=${apiKey}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      signal: AbortSignal.timeout(10000), // 10 second timeout
    });

    if (response.ok) {
      const data = await response.json();
      return {
        success: true,
        message: 'Google API key is valid',
        details: {
          modelCount: data.models?.length || 0,
          models: data.models?.slice(0, 5).map((m: any) => m.name) || []
        }
      };
    } else {
      const errorData = await response.text();
      return {
        success: false,
        message: `Google API key is invalid: ${response.status} ${response.statusText}`,
        details: errorData.substring(0, 200)
      };
    }
  } catch (error) {
    return {
      success: false,
      message: `Failed to connect to Google API: ${error instanceof Error ? error.message : 'Unknown error'}`
    };
  }
}

/**
 * POST /api/keys/test - Test an API key
 */
export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { keyId } = testApiKeySchema.parse(body);

    // Get the API key from database
    const keyRecord = await db
      .select({
        id: userApiKeys.id,
        serviceProvider: userApiKeys.serviceProvider,
        encryptedKey: userApiKeys.encryptedKey,
        isActive: userApiKeys.isActive,
      })
      .from(userApiKeys)
      .where(
        and(
          eq(userApiKeys.id, keyId),
          eq(userApiKeys.userId, session.user.id)
        )
      )
      .limit(1);

    if (keyRecord.length === 0) {
      return NextResponse.json(
        { error: 'API key not found' },
        { status: 404 }
      );
    }

    const keyData = keyRecord[0];

    if (!keyData.isActive) {
      return NextResponse.json(
        { error: 'API key is not active' },
        { status: 400 }
      );
    }

    // Decrypt the API key
    let decryptedKey: string;
    try {
      const encryptedData = JSON.parse(keyData.encryptedKey);
      decryptedKey = decrypt(encryptedData);
    } catch (error) {
      console.error('Error decrypting API key:', error);
      return NextResponse.json(
        { error: 'Failed to decrypt API key' },
        { status: 500 }
      );
    }

    // Test the API key
    const testResult = await testProviderKey(keyData.serviceProvider, decryptedKey);

    return NextResponse.json({
      success: testResult.success,
      message: testResult.message,
      details: testResult.details,
      serviceProvider: keyData.serviceProvider,
    });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Error testing API key:', error);
    return NextResponse.json(
      { error: 'Failed to test API key' },
      { status: 500 }
    );
  }
}