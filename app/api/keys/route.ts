import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/db';
import { userApiKeys } from '@/db/schema/auth';
import { eq, and } from 'drizzle-orm';
import { auth } from '@/lib/auth';
import { encrypt, decrypt } from '@/lib/crypto';
import { generateId } from 'better-auth';

// Validation schemas
const createApiKeySchema = z.object({
  serviceProvider: z.string().min(1).max(100),
  keyName: z.string().min(1).max(255),
  apiKey: z.string().min(1),
});

const updateApiKeySchema = z.object({
  keyName: z.string().min(1).max(255).optional(),
  isActive: z.boolean().optional(),
});

const testApiKeySchema = z.object({
  serviceProvider: z.string().min(1).max(100),
  apiKey: z.string().min(1),
});

/**
 * GET /api/keys - List user's API keys
 */
export async function GET(request: NextRequest) {
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

    const keys = await db
      .select({
        id: userApiKeys.id,
        serviceProvider: userApiKeys.serviceProvider,
        keyName: userApiKeys.keyName,
        isActive: userApiKeys.isActive,
        createdAt: userApiKeys.createdAt,
        updatedAt: userApiKeys.updatedAt,
      })
      .from(userApiKeys)
      .where(eq(userApiKeys.userId, session.user.id));

    return NextResponse.json({ keys });
  } catch (error) {
    console.error('Error fetching API keys:', error);
    return NextResponse.json(
      { error: 'Failed to fetch API keys' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/keys - Add a new API key
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
    const { serviceProvider, keyName, apiKey } = createApiKeySchema.parse(body);

    // Check if a key with the same name already exists for this user
    const existingKey = await db
      .select()
      .from(userApiKeys)
      .where(
        and(
          eq(userApiKeys.userId, session.user.id),
          eq(userApiKeys.keyName, keyName)
        )
      )
      .limit(1);

    if (existingKey.length > 0) {
      return NextResponse.json(
        { error: 'An API key with this name already exists' },
        { status: 400 }
      );
    }

    // Encrypt the API key
    const encryptedKey = encrypt(apiKey);

    // Insert the new API key
    const newKey = await db
      .insert(userApiKeys)
      .values({
        id: generateId(),
        userId: session.user.id,
        serviceProvider,
        encryptedKey: JSON.stringify(encryptedKey),
        keyName,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning({
        id: userApiKeys.id,
        serviceProvider: userApiKeys.serviceProvider,
        keyName: userApiKeys.keyName,
        isActive: userApiKeys.isActive,
        createdAt: userApiKeys.createdAt,
        updatedAt: userApiKeys.updatedAt,
      });

    return NextResponse.json(
      {
        message: 'API key added successfully',
        key: newKey[0]
      },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Error adding API key:', error);
    return NextResponse.json(
      { error: 'Failed to add API key' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/keys - Update an existing API key
 */
export async function PUT(request: NextRequest) {
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
    const { id, keyName, isActive } = updateApiKeySchema.extend({
      id: z.string().min(1),
    }).parse(body);

    // Update the API key
    const updatedKeys = await db
      .update(userApiKeys)
      .set({
        ...(keyName && { keyName }),
        ...(isActive !== undefined && { isActive }),
        updatedAt: new Date(),
      })
      .where(
        and(
          eq(userApiKeys.id, id),
          eq(userApiKeys.userId, session.user.id)
        )
      )
      .returning({
        id: userApiKeys.id,
        serviceProvider: userApiKeys.serviceProvider,
        keyName: userApiKeys.keyName,
        isActive: userApiKeys.isActive,
        createdAt: userApiKeys.createdAt,
        updatedAt: userApiKeys.updatedAt,
      });

    if (updatedKeys.length === 0) {
      return NextResponse.json(
        { error: 'API key not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        message: 'API key updated successfully',
        key: updatedKeys[0]
      }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Error updating API key:', error);
    return NextResponse.json(
      { error: 'Failed to update API key' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/keys - Delete an API key
 */
export async function DELETE(request: NextRequest) {
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

    const url = new URL(request.url);
    const keyId = url.searchParams.get('id');

    if (!keyId) {
      return NextResponse.json(
        { error: 'API key ID is required' },
        { status: 400 }
      );
    }

    // Delete the API key
    const deletedKeys = await db
      .delete(userApiKeys)
      .where(
        and(
          eq(userApiKeys.id, keyId),
          eq(userApiKeys.userId, session.user.id)
        )
      )
      .returning({ id: userApiKeys.id });

    if (deletedKeys.length === 0) {
      return NextResponse.json(
        { error: 'API key not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { message: 'API key deleted successfully' }
    );
  } catch (error) {
    console.error('Error deleting API key:', error);
    return NextResponse.json(
      { error: 'Failed to delete API key' },
      { status: 500 }
    );
  }
}