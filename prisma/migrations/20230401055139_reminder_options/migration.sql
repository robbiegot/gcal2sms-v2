-- AlterTable
ALTER TABLE "Reminder" ALTER COLUMN "readyToSend" SET DEFAULT false,
ALTER COLUMN "completed" DROP NOT NULL,
ALTER COLUMN "sentToServer" DROP NOT NULL,
ALTER COLUMN "sentToTwilio" DROP NOT NULL;