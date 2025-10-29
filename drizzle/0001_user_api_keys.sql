CREATE TABLE "user_api_keys" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"service_provider" varchar(100) NOT NULL,
	"encrypted_key" text NOT NULL,
	"key_name" varchar(255) NOT NULL,
	"is_active" boolean NOT NULL,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL
);
--> statement-breakpoint
CREATE INDEX "user_api_keys_user_id_idx" ON "user_api_keys" ("user_id");
--> statement-breakpoint
CREATE INDEX "user_api_keys_service_provider_idx" ON "user_api_keys" ("service_provider");
--> statement-breakpoint
ALTER TABLE "user_api_keys" ADD CONSTRAINT "user_api_keys_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;