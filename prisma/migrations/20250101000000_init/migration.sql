-- CreateTable
CREATE TABLE "ApiKey" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ApiKey_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Profile" (
    "id" SERIAL NOT NULL,
    "_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Profile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SocialAccount" (
    "id" TEXT NOT NULL,
    "_id" TEXT NOT NULL,
    "profileId" TEXT NOT NULL,
    "platform" TEXT NOT NULL,
    "username" TEXT,
    "status" TEXT DEFAULT 'active',
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SocialAccount_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Post" (
    "id" TEXT NOT NULL,
    "_id" TEXT NOT NULL,
    "socialAccountId" TEXT NOT NULL,
    "content" TEXT,
    "scheduledFor" TIMESTAMP(3),
    "timezone" TEXT,
    "status" TEXT NOT NULL DEFAULT 'scheduled',
    "contentType" TEXT,
    "mediaItems" JSONB,
    "platforms" JSONB,
    "publishNow" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Post_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ApiKey_key_key" ON "ApiKey"("key");

-- CreateIndex
CREATE INDEX "ApiKey_key_idx" ON "ApiKey"("key");

-- CreateIndex
CREATE UNIQUE INDEX "Profile__id_key" ON "Profile"("_id");

-- CreateIndex
CREATE INDEX "Profile__id_idx" ON "Profile"("_id");

-- CreateIndex
CREATE UNIQUE INDEX "SocialAccount__id_key" ON "SocialAccount"("_id");

-- CreateIndex
CREATE INDEX "SocialAccount_profileId_idx" ON "SocialAccount"("profileId");

-- CreateIndex
CREATE INDEX "SocialAccount__id_idx" ON "SocialAccount"("_id");

-- CreateIndex
CREATE UNIQUE INDEX "Post__id_key" ON "Post"("_id");

-- CreateIndex
CREATE INDEX "Post__id_idx" ON "Post"("_id");

-- CreateIndex
CREATE INDEX "Post_socialAccountId_idx" ON "Post"("socialAccountId");

-- CreateIndex
CREATE INDEX "Post_status_idx" ON "Post"("status");

-- CreateIndex
CREATE INDEX "Post_scheduledFor_idx" ON "Post"("scheduledFor");

-- AddForeignKey
ALTER TABLE "SocialAccount" ADD CONSTRAINT "SocialAccount_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "Profile"("_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Post" ADD CONSTRAINT "Post_socialAccountId_fkey" FOREIGN KEY ("socialAccountId") REFERENCES "SocialAccount"("_id") ON DELETE CASCADE ON UPDATE CASCADE;

