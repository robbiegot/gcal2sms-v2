/*
  Warnings:

  - The `defRmndrTime` column on the `Contact` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "Contact" ALTER COLUMN "email" DROP NOT NULL,
DROP COLUMN "defRmndrTime",
ADD COLUMN     "defRmndrTime" INTEGER;
