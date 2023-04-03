/*
  Warnings:

  - A unique constraint covering the columns `[twilioSid]` on the table `Reminder` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Reminder" ADD COLUMN     "twilioSid" TEXT,
ADD COLUMN     "twilioStatus" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Reminder_twilioSid_key" ON "Reminder"("twilioSid");
