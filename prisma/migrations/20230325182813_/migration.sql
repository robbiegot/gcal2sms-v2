/*
  Warnings:

  - Made the column `email` on table `Contact` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Contact" ALTER COLUMN "email" SET NOT NULL,
ALTER COLUMN "name" DROP NOT NULL,
ALTER COLUMN "phoneNumber" DROP NOT NULL;
