/*
  Warnings:

  - You are about to drop the column `sent` on the `Reminder` table. All the data in the column will be lost.
  - Added the required column `completed` to the `Reminder` table without a default value. This is not possible if the table is not empty.
  - Added the required column `sentToServer` to the `Reminder` table without a default value. This is not possible if the table is not empty.
  - Added the required column `sentToTwilio` to the `Reminder` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Reminder" DROP COLUMN "sent",
ADD COLUMN     "completed" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "sentToServer" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "sentToTwilio" TIMESTAMP(3) NOT NULL;
