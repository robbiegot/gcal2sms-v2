/*
  Warnings:

  - You are about to drop the column `customReminder` on the `Contact` table. All the data in the column will be lost.
  - You are about to drop the column `defRmndrTime` on the `Contact` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Contact" DROP COLUMN "customReminder",
DROP COLUMN "defRmndrTime",
ADD COLUMN     "customReminderText" TEXT,
ADD COLUMN     "cutomReminderTime" INTEGER;
