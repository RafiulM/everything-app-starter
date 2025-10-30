import { pgTable, uuid, text, timestamp, index } from "drizzle-orm/pg-core";
import { user } from "./auth";

export const apiKeys = pgTable(
  "api_keys",
  {
    id: uuid("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    keyHash: text("key_hash").notNull(),
    prefix: text("prefix").notNull(),
    scopes: text("scopes"),
    createdAt: timestamp("created_at")
      .$defaultFn(() => /* @__PURE__ */ new Date())
      .notNull(),
    lastUsedAt: timestamp("last_used_at"),
  },
  (t) => ({
    userIdIdx: index("api_keys_user_id_idx").on(t.userId),
    prefixIdx: index("api_keys_prefix_idx").on(t.prefix),
  })
);
