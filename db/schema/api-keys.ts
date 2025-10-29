import { pgTable, text, timestamp, boolean, jsonb, index } from "drizzle-orm/pg-core";
import { user } from "./auth";

export const apiKeys = pgTable("api_keys", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  hashedKey: text("hashed_key").notNull(),
  keyPrefix: text("key_prefix").notNull(), // First 8 characters for identification
  name: text("name").notNull(), // User-defined name
  status: text("status").notNull().default("active"), // active, inactive, revoked
  scopes: jsonb("scopes").notNull().$default(() => []), // Array of allowed scopes
  expiresAt: timestamp("expires_at"), // Optional expiration
  lastUsedAt: timestamp("last_used_at"), // Track usage
  usageCount: text("usage_count").default("0").notNull(), // Usage counter
  createdAt: timestamp("created_at")
    .$defaultFn(() => new Date())
    .notNull(),
  updatedAt: timestamp("updated_at")
    .$defaultFn(() => new Date())
    .notNull(),
}, (table) => ({
  userIdIdx: index("api_keys_user_id_idx").on(table.userId),
  keyPrefixIdx: index("api_keys_key_prefix_idx").on(table.keyPrefix),
  statusIdx: index("api_keys_status_idx").on(table.status),
}));

export const apiKeyAuditLogs = pgTable("api_key_audit_logs", {
  id: text("id").primaryKey(),
  keyId: text("key_id")
    .notNull()
    .references(() => apiKeys.id, { onDelete: "cascade" }),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  action: text("action").notNull(), // created, used, deleted, updated, revoked
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  endpoint: text("endpoint"), // Which API endpoint was accessed
  metadata: jsonb("metadata"), // Additional context
  createdAt: timestamp("created_at")
    .$defaultFn(() => new Date())
    .notNull(),
}, (table) => ({
  keyIdIdx: index("api_key_audit_logs_key_id_idx").on(table.keyId),
  userIdIdx: index("api_key_audit_logs_user_id_idx").on(table.userId),
  actionIdx: index("api_key_audit_logs_action_idx").on(table.action),
  createdAtIdx: index("api_key_audit_logs_created_at_idx").on(table.createdAt),
}));

// Define scopes as TypeScript constants for type safety
export const API_KEY_SCOPES = {
  CHAT_READ: 'chat:read',
  CHAT_WRITE: 'chat:write',
  SEARCH_READ: 'search:read',
  SEARCH_WRITE: 'search:write',
  IMAGE_READ: 'image:read',
  IMAGE_WRITE: 'image:write',
  ADMIN: 'admin',
} as const;

export type ApiKeyScope = typeof API_KEY_SCOPES[keyof typeof API_KEY_SCOPES];