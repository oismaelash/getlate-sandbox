-- CreateTable
CREATE TABLE "Webhook" (
    "id" TEXT NOT NULL,
    "_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "secretKey" TEXT,
    "customHeaders" JSONB DEFAULT '[]',
    "events" JSONB NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Webhook_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WebhookDeliveryLog" (
    "id" TEXT NOT NULL,
    "webhookId" TEXT NOT NULL,
    "event" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "statusCode" INTEGER,
    "responseTime" INTEGER,
    "attempts" INTEGER NOT NULL DEFAULT 1,
    "requestPayload" JSONB NOT NULL,
    "response" TEXT,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "WebhookDeliveryLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Webhook__id_key" ON "Webhook"("_id");

-- CreateIndex
CREATE INDEX "Webhook__id_idx" ON "Webhook"("_id");

-- CreateIndex
CREATE INDEX "Webhook_enabled_idx" ON "Webhook"("enabled");

-- CreateIndex
CREATE INDEX "WebhookDeliveryLog_webhookId_idx" ON "WebhookDeliveryLog"("webhookId");

-- CreateIndex
CREATE INDEX "WebhookDeliveryLog_status_idx" ON "WebhookDeliveryLog"("status");

-- CreateIndex
CREATE INDEX "WebhookDeliveryLog_timestamp_idx" ON "WebhookDeliveryLog"("timestamp");

-- CreateIndex
CREATE INDEX "WebhookDeliveryLog_event_idx" ON "WebhookDeliveryLog"("event");

-- AddForeignKey
ALTER TABLE "WebhookDeliveryLog" ADD CONSTRAINT "WebhookDeliveryLog_webhookId_fkey" FOREIGN KEY ("webhookId") REFERENCES "Webhook"("_id") ON DELETE CASCADE ON UPDATE CASCADE;
