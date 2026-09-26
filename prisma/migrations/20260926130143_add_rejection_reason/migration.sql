-- AlterTable
ALTER TABLE "Application" ADD COLUMN     "rejectedAt" TIMESTAMP(3),
ADD COLUMN     "rejectedById" TEXT,
ADD COLUMN     "rejectionReason" TEXT;

-- AlterTable
ALTER TABLE "Document" ADD COLUMN     "rejectionReason" TEXT;
