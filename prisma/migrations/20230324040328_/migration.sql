/*
  Warnings:

  - You are about to drop the column `defRmndrStr` on the `Contact` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Contact" DROP COLUMN "defRmndrStr",
ADD COLUMN     "customReminder" TEXT;
