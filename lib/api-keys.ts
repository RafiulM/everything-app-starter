import { nanoid } from 'nanoid';
import bcrypt from 'bcryptjs';
import { db } from '@/db';
import { apiKeys, apiKeyAuditLogs, type ApiKeyScope } from '@/db/schema/api-keys';
import { eq, and } from 'drizzle-orm';

export interface CreateApiKeyData {
  name: string;
  userId: string;
  scopes: ApiKeyScope[];
  expiresAt?: Date;
}

export interface ApiKeyResponse {
  id: string;
  name: string;
  keyPrefix: string;
  status: string;
  scopes: ApiKeyScope[];
  expiresAt?: Date;
  lastUsedAt?: Date;
  usageCount: number;
  createdAt: Date;
  updatedAt: Date;
  // Full key is only returned once during creation
  fullKey?: string;
}

export class ApiKeyService {
  private static readonly KEY_LENGTH = 32;
  private static readonly PREFIX_LENGTH = 8;
  private static readonly SALT_ROUNDS = 12;

  /**
   * Generate a new API key and return the full key (only shown once)
   */
  static async createApiKey(data: CreateApiKeyData): Promise<ApiKeyResponse> {
    // Generate the actual API key
    const fullKey = `ak_${nanoid(this.KEY_LENGTH)}`;
    const keyPrefix = fullKey.substring(0, this.PREFIX_LENGTH);

    // Hash the key for storage
    const hashedKey = await bcrypt.hash(fullKey, this.SALT_ROUNDS);

    // Insert into database
    const [result] = await db.insert(apiKeys).values({
      id: nanoid(),
      userId: data.userId,
      hashedKey,
      keyPrefix,
      name: data.name,
      scopes: data.scopes,
      expiresAt: data.expiresAt,
      status: 'active',
      usageCount: '0',
    }).returning();

    // Log the creation
    await this.logAuditEvent({
      keyId: result.id,
      userId: data.userId,
      action: 'created',
      metadata: {
        name: data.name,
        scopes: data.scopes,
        expiresAt: data.expiresAt,
      },
    });

    return {
      ...result,
      fullKey, // Only returned once
      usageCount: parseInt(result.usageCount),
    };
  }

  /**
   * Get all API keys for a user (never returns the full key)
   */
  static async getUserApiKeys(userId: string): Promise<ApiKeyResponse[]> {
    const keys = await db.select()
      .from(apiKeys)
      .where(eq(apiKeys.userId, userId));

    return keys.map(key => ({
      ...key,
      usageCount: parseInt(key.usageCount),
    }));
  }

  /**
   * Delete an API key
   */
  static async deleteApiKey(keyId: string, userId: string): Promise<void> {
    // First verify ownership
    const [apiKey] = await db.select()
      .from(apiKeys)
      .where(and(
        eq(apiKeys.id, keyId),
        eq(apiKeys.userId, userId)
      ));

    if (!apiKey) {
      throw new Error('API key not found or access denied');
    }

    // Delete the key
    await db.delete(apiKeys).where(eq(apiKeys.id, keyId));

    // Log the deletion
    await this.logAuditEvent({
      keyId,
      userId,
      action: 'deleted',
      metadata: {
        name: apiKey.name,
        keyPrefix: apiKey.keyPrefix,
      },
    });
  }

  /**
   * Update API key status (active/inactive/revoked)
   */
  static async updateApiKeyStatus(
    keyId: string,
    userId: string,
    status: 'active' | 'inactive' | 'revoked'
  ): Promise<void> {
    // First verify ownership
    const [apiKey] = await db.select()
      .from(apiKeys)
      .where(and(
        eq(apiKeys.id, keyId),
        eq(apiKeys.userId, userId)
      ));

    if (!apiKey) {
      throw new Error('API key not found or access denied');
    }

    // Update status
    await db.update(apiKeys)
      .set({
        status,
        updatedAt: new Date()
      })
      .where(eq(apiKeys.id, keyId));

    // Log the update
    await this.logAuditEvent({
      keyId,
      userId,
      action: 'updated',
      metadata: {
        oldStatus: apiKey.status,
        newStatus: status,
        name: apiKey.name,
      },
    });
  }

  /**
   * Validate an API key and return the associated user info
   */
  static async validateApiKey(fullKey: string): Promise<{
    id: string;
    userId: string;
    scopes: ApiKeyScope[];
    status: string;
  } | null> {
    // Extract prefix for efficient lookup
    const keyPrefix = fullKey.substring(0, this.PREFIX_LENGTH);

    // Find potential keys with matching prefix
    const candidates = await db.select()
      .from(apiKeys)
      .where(and(
        eq(apiKeys.keyPrefix, keyPrefix),
        eq(apiKeys.status, 'active')
      ));

    if (candidates.length === 0) {
      return null;
    }

    // Check each candidate with bcrypt comparison
    for (const candidate of candidates) {
      const isValid = await bcrypt.compare(fullKey, candidate.hashedKey);

      if (isValid) {
        // Check expiration
        if (candidate.expiresAt && new Date() > candidate.expiresAt) {
          return null;
        }

        // Update usage statistics
        await db.update(apiKeys)
          .set({
            lastUsedAt: new Date(),
            usageCount: (parseInt(candidate.usageCount) + 1).toString(),
          })
          .where(eq(apiKeys.id, candidate.id));

        return {
          id: candidate.id,
          userId: candidate.userId,
          scopes: candidate.scopes as ApiKeyScope[],
          status: candidate.status,
        };
      }
    }

    return null;
  }

  /**
   * Log an audit event for API key operations
   */
  private static async logAuditEvent({
    keyId,
    userId,
    action,
    ipAddress,
    userAgent,
    endpoint,
    metadata = {},
  }: {
    keyId: string;
    userId: string;
    action: string;
    ipAddress?: string;
    userAgent?: string;
    endpoint?: string;
    metadata?: Record<string, any>;
  }): Promise<void> {
    await db.insert(apiKeyAuditLogs).values({
      id: nanoid(),
      keyId,
      userId,
      action,
      ipAddress,
      userAgent,
      endpoint,
      metadata,
    });
  }

  /**
   * Log API key usage for audit trail
   */
  static async logApiKeyUsage({
    keyId,
    userId,
    endpoint,
    ipAddress,
    userAgent,
    metadata = {},
  }: {
    keyId: string;
    userId: string;
    endpoint: string;
    ipAddress?: string;
    userAgent?: string;
    metadata?: Record<string, any>;
  }): Promise<void> {
    await this.logAuditEvent({
      keyId,
      userId,
      action: 'used',
      endpoint,
      ipAddress,
      userAgent,
      metadata,
    });
  }
}