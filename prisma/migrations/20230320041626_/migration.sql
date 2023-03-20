/*
  Warnings:

  - The `X_Goog_Channel_Expiration` column on the `Calendar` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "Calendar" DROP COLUMN "X_Goog_Channel_Expiration",
ADD COLUMN     "X_Goog_Channel_Expiration" TIMESTAMP(3);
