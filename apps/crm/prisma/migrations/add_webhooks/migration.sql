-- Add Webhook tables for external integrations

CREATE TABLE IF NOT EXISTS "webhooks" (
  "id" TEXT PRIMARY KEY,
  "name" TEXT NOT NULL,
  "url" TEXT NOT NULL,
  "secret" TEXT,
  "events" TEXT NOT NULL, -- JSON array of event names
  "is_active" BOOLEAN NOT NULL DEFAULT true,
  "created_at" TIMESTAMP NOT NULL DEFAULT NOW(),
  "updated_at" TIMESTAMP NOT NULL DEFAULT NOW(),
  "last_triggered_at" TIMESTAMP,
  "created_by" TEXT NOT NULL,
  FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS "webhook_deliveries" (
  "id" TEXT PRIMARY KEY,
  "webhook_id" TEXT NOT NULL,
  "event" TEXT NOT NULL,
  "payload" TEXT NOT NULL, -- JSON payload
  "response_status" INTEGER,
  "response_body" TEXT,
  "error" TEXT,
  "attempts" INTEGER NOT NULL DEFAULT 1,
  "success" BOOLEAN NOT NULL DEFAULT false,
  "created_at" TIMESTAMP NOT NULL DEFAULT NOW(),
  "delivered_at" TIMESTAMP,
  FOREIGN KEY ("webhook_id") REFERENCES "webhooks"("id") ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS "webhooks_is_active_idx" ON "webhooks"("is_active");
CREATE INDEX IF NOT EXISTS "webhooks_created_by_idx" ON "webhooks"("created_by");
CREATE INDEX IF NOT EXISTS "webhook_deliveries_webhook_id_idx" ON "webhook_deliveries"("webhook_id");
CREATE INDEX IF NOT EXISTS "webhook_deliveries_event_idx" ON "webhook_deliveries"("event");
CREATE INDEX IF NOT EXISTS "webhook_deliveries_created_at_idx" ON "webhook_deliveries"("created_at");
CREATE INDEX IF NOT EXISTS "webhook_deliveries_success_idx" ON "webhook_deliveries"("success");
