/*
  Warnings:

  - A unique constraint covering the columns `[userOwnerId,email]` on the table `Contact` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[userOwnerId,phoneNumber]` on the table `Contact` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Contact_userOwnerId_email_key" ON "Contact"("userOwnerId", "email");

-- CreateIndex
CREATE UNIQUE INDEX "Contact_userOwnerId_phoneNumber_key" ON "Contact"("userOwnerId", "phoneNumber");
