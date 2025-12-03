/*
  Warnings:

  - You are about to drop the column `logoUrl` on the `Company` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Company" DROP COLUMN "logoUrl",
ADD COLUMN     "logoBucket" TEXT,
ADD COLUMN     "logoFileType" TEXT,
ADD COLUMN     "logoKey" TEXT;
