-- DropForeignKey
ALTER TABLE "Calendar" DROP CONSTRAINT "Calendar_calOwnerId_fkey";

-- DropForeignKey
ALTER TABLE "Contact" DROP CONSTRAINT "Contact_userOwnerId_fkey";

-- DropForeignKey
ALTER TABLE "Reminder" DROP CONSTRAINT "Reminder_contactId_fkey";

-- DropForeignKey
ALTER TABLE "Reminder" DROP CONSTRAINT "Reminder_eventId_fkey";

-- DropForeignKey
ALTER TABLE "events" DROP CONSTRAINT "events_calendarId_fkey";

-- AddForeignKey
ALTER TABLE "Calendar" ADD CONSTRAINT "Calendar_calOwnerId_fkey" FOREIGN KEY ("calOwnerId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "events" ADD CONSTRAINT "events_calendarId_fkey" FOREIGN KEY ("calendarId") REFERENCES "Calendar"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Reminder" ADD CONSTRAINT "Reminder_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "events"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Reminder" ADD CONSTRAINT "Reminder_contactId_fkey" FOREIGN KEY ("contactId") REFERENCES "Contact"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Contact" ADD CONSTRAINT "Contact_userOwnerId_fkey" FOREIGN KEY ("userOwnerId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
