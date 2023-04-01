/*
  Warnings:

  - Changed the type of `timeToSend` on the `Reminder` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "Reminder" DROP COLUMN "timeToSend",
ADD COLUMN     "timeToSend" INTEGER NOT NULL;
