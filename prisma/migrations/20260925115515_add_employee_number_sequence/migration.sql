/*
  Warnings:

  - A unique constraint covering the columns `[employeeNumber]` on the table `User` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "User" ADD COLUMN     "employeeNumber" TEXT;

-- CreateTable
CREATE TABLE "EmployeeNumberSequence" (
    "id" INTEGER NOT NULL DEFAULT 1,
    "nextValue" INTEGER NOT NULL DEFAULT 1,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EmployeeNumberSequence_pkey" PRIMARY KEY ("id")
);

INSERT INTO "EmployeeNumberSequence" ("id", "nextValue", "updatedAt")
VALUES (1, 1, NOW())
ON CONFLICT ("id") DO NOTHING;

-- CreateIndex
CREATE UNIQUE INDEX "User_employeeNumber_key" ON "User"("employeeNumber");
