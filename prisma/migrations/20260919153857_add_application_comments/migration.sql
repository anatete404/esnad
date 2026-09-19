-- CreateTable
CREATE TABLE "ApplicationComment" (
    "id" TEXT NOT NULL,
    "applicationId" TEXT NOT NULL,
    "authorId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "mentionedIds" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ApplicationComment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ApplicationComment_applicationId_idx" ON "ApplicationComment"("applicationId");

-- CreateIndex
CREATE INDEX "ApplicationComment_authorId_idx" ON "ApplicationComment"("authorId");

-- CreateIndex
CREATE INDEX "ApplicationComment_createdAt_idx" ON "ApplicationComment"("createdAt");

-- AddForeignKey
ALTER TABLE "ApplicationComment" ADD CONSTRAINT "ApplicationComment_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "Application"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ApplicationComment" ADD CONSTRAINT "ApplicationComment_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
