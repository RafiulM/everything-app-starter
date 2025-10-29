import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { auth } from '@/lib/auth';
import { ApiKeyService } from '@/lib/api-keys';

const updateKeySchema = z.object({
  status: z.enum(['active', 'inactive', 'revoked']),
});

export async function DELETE(
  request: NextRequest,
  { params }: { params: { keyId: string } }
) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { keyId } = params;

    await ApiKeyService.deleteApiKey(keyId, session.user.id);

    return NextResponse.json({
      success: true,
      message: 'API key deleted successfully',
    });
  } catch (error) {
    if (error instanceof Error && error.message === 'API key not found or access denied') {
      return NextResponse.json({ error: error.message }, { status: 404 });
    }

    console.error('Error deleting API key:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { keyId: string } }
) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = updateKeySchema.parse(body);
    const { keyId } = params;

    await ApiKeyService.updateApiKeyStatus(
      keyId,
      session.user.id,
      validatedData.status
    );

    return NextResponse.json({
      success: true,
      message: `API key ${validatedData.status} successfully`,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      );
    }

    if (error instanceof Error && error.message === 'API key not found or access denied') {
      return NextResponse.json({ error: error.message }, { status: 404 });
    }

    console.error('Error updating API key:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}