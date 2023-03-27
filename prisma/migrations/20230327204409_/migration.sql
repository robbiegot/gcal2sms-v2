/*
  Warnings:

  - You are about to drop the `ContactsOnEvents` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ContactsOnReminders` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `contactId` to the `Reminder` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "ContactsOnEvents" DROP CONSTRAINT "ContactsOnEvents_contactId_fkey";

-- DropForeignKey
ALTER TABLE "ContactsOnEvents" DROP CONSTRAINT "ContactsOnEvents_eventId_fkey";

-- DropForeignKey
ALTER TABLE "ContactsOnReminders" DROP CONSTRAINT "ContactsOnReminders_contactId_fkey";

-- DropForeignKey
ALTER TABLE "ContactsOnReminders" DROP CONSTRAINT "ContactsOnReminders_reminderId_fkey";

-- AlterTable
ALTER TABLE "Reminder" ADD COLUMN     "contactId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "events" ADD COLUMN     "contactId" TEXT;

-- DropTable
DROP TABLE "ContactsOnEvents";

-- DropTable
DROP TABLE "ContactsOnReminders";

-- CreateTable
CREATE TABLE "_ContactToEvent" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_ContactToEvent_AB_unique" ON "_ContactToEvent"("A", "B");

-- CreateIndex
CREATE INDEX "_ContactToEvent_B_index" ON "_ContactToEvent"("B");

-- AddForeignKey
ALTER TABLE "Reminder" ADD CONSTRAINT "Reminder_contactId_fkey" FOREIGN KEY ("contactId") REFERENCES "Contact"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ContactToEvent" ADD CONSTRAINT "_ContactToEvent_A_fkey" FOREIGN KEY ("A") REFERENCES "Contact"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ContactToEvent" ADD CONSTRAINT "_ContactToEvent_B_fkey" FOREIGN KEY ("B") REFERENCES "events"("id") ON DELETE CASCADE ON UPDATE CASCADE;
