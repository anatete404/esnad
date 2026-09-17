-- AlterTable
ALTER TABLE "Application" ADD COLUMN     "statusNote" TEXT,
ADD COLUMN     "statusNoteManual" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "statusNoteUpdatedAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "Land" ADD COLUMN     "authorityName" TEXT;

-- CreateTable
CREATE TABLE "Payment" (
    "id" TEXT NOT NULL,
    "applicationId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "receiptNumber" TEXT,
    "paidAt" TIMESTAMP(3),
    "notes" TEXT,
    "createdById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Payment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Payment_applicationId_idx" ON "Payment"("applicationId");

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "Application"("id") ON DELETE CASCADE ON UPDATE CASCADE;
