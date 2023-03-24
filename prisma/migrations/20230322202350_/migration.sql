/*
  Warnings:

  - A unique constraint covering the columns `[X_Goog_Channel_Id]` on the table `Calendar` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[X_Goog_Resource_Id]` on the table `Calendar` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `name` to the `Contact` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Contact" ADD COLUMN     "name" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Calendar_X_Goog_Channel_Id_key" ON "Calendar"("X_Goog_Channel_Id");

-- CreateIndex
CREATE UNIQUE INDEX "Calendar_X_Goog_Resource_Id_key" ON "Calendar"("X_Goog_Resource_Id");
