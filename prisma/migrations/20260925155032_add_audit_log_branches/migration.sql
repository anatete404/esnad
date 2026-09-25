-- AlterTable
ALTER TABLE "AuditLog" ADD COLUMN     "actorBranchId" TEXT,
ADD COLUMN     "branchId" TEXT;

-- CreateIndex
CREATE INDEX "AuditLog_branchId_idx" ON "AuditLog"("branchId");

-- CreateIndex
CREATE INDEX "AuditLog_actorBranchId_idx" ON "AuditLog"("actorBranchId");

-- CreateIndex
CREATE INDEX "AuditLog_branchId_createdAt_idx" ON "AuditLog"("branchId", "createdAt");

-- CreateIndex
CREATE INDEX "AuditLog_actorBranchId_createdAt_idx" ON "AuditLog"("actorBranchId", "createdAt");

-- AddForeignKey
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "Branch"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_actorBranchId_fkey" FOREIGN KEY ("actorBranchId") REFERENCES "Branch"("id") ON DELETE SET NULL ON UPDATE CASCADE;
