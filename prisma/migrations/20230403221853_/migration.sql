-- CreateTable
CREATE TABLE "accounts" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "provider_account_id" TEXT NOT NULL,
    "refresh_token" TEXT,
    "access_token" TEXT,
    "expires_at" INTEGER,
    "token_type" TEXT,
    "scope" TEXT,
    "id_token" TEXT,
    "session_state" TEXT,
    "oauth_token_secret" TEXT,
    "oauth_token" TEXT,

    CONSTRAINT "accounts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "userToken" TEXT,
    "phoneNumber" TEXT,
    "lastLogin" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "emailVerified" TIMESTAMP(3),
    "image" TEXT,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Calendar" (
    "id" TEXT NOT NULL,
    "googleId" TEXT NOT NULL,
    "calOwnerId" TEXT NOT NULL,
    "summary" TEXT NOT NULL,
    "timeZone" TEXT,
    "location" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "X_Goog_Channel_Id" TEXT,
    "X_Goog_Resource_Id" TEXT,
    "X_Goog_Resource_Uri" TEXT,
    "X_Goog_Channel_Expiration" TIMESTAMP(3),
    "X_Goog_Resource_State" TEXT,
    "syncToken" TEXT,

    CONSTRAINT "Calendar_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "events" (
    "id" TEXT NOT NULL,
    "googleId" TEXT NOT NULL,
    "calendarId" TEXT NOT NULL,
    "status" TEXT,
    "htmlLink" TEXT,
    "created" TIMESTAMP(3) NOT NULL,
    "updated" TIMESTAMP(3) NOT NULL,
    "summary" TEXT NOT NULL,
    "description" TEXT,
    "location" TEXT,
    "organizerEmail" TEXT,
    "start" TIMESTAMP(3) NOT NULL,
    "end" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Reminder" (
    "id" TEXT NOT NULL,
    "timeToSend" INTEGER NOT NULL,
    "rmdrType" TEXT,
    "rmdrText" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "readyToSend" BOOLEAN NOT NULL DEFAULT false,
    "sentToServer" TIMESTAMP(3),
    "sentToTwilio" TIMESTAMP(3),
    "completed" TIMESTAMP(3),
    "canceled" BOOLEAN NOT NULL DEFAULT false,
    "contactId" TEXT NOT NULL,
    "twilioSid" TEXT,
    "twilioStatus" TEXT,

    CONSTRAINT "Reminder_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Contact" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "userOwnerId" TEXT NOT NULL,
    "name" TEXT,
    "phoneNumber" TEXT,
    "sendReminders" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "Contact_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DefaultRemindersUser" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "time" INTEGER NOT NULL,
    "text" TEXT NOT NULL,

    CONSTRAINT "DefaultRemindersUser_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DefaultRemindersContact" (
    "id" TEXT NOT NULL,
    "contactId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "time" INTEGER NOT NULL,
    "text" TEXT NOT NULL,

    CONSTRAINT "DefaultRemindersContact_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sessions" (
    "id" TEXT NOT NULL,
    "session_token" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "verificationtokens" (
    "id" SERIAL NOT NULL,
    "identifier" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "verificationtokens_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_ContactToEvent" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "accounts_provider_provider_account_id_key" ON "accounts"("provider", "provider_account_id");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Calendar_googleId_key" ON "Calendar"("googleId");

-- CreateIndex
CREATE UNIQUE INDEX "Calendar_X_Goog_Channel_Id_key" ON "Calendar"("X_Goog_Channel_Id");

-- CreateIndex
CREATE UNIQUE INDEX "Calendar_X_Goog_Resource_Id_key" ON "Calendar"("X_Goog_Resource_Id");

-- CreateIndex
CREATE UNIQUE INDEX "events_googleId_key" ON "events"("googleId");

-- CreateIndex
CREATE UNIQUE INDEX "Reminder_twilioSid_key" ON "Reminder"("twilioSid");

-- CreateIndex
CREATE UNIQUE INDEX "Contact_email_key" ON "Contact"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Contact_userOwnerId_email_key" ON "Contact"("userOwnerId", "email");

-- CreateIndex
CREATE UNIQUE INDEX "Contact_userOwnerId_phoneNumber_key" ON "Contact"("userOwnerId", "phoneNumber");

-- CreateIndex
CREATE UNIQUE INDEX "sessions_session_token_key" ON "sessions"("session_token");

-- CreateIndex
CREATE UNIQUE INDEX "verificationtokens_token_key" ON "verificationtokens"("token");

-- CreateIndex
CREATE UNIQUE INDEX "verificationtokens_identifier_token_key" ON "verificationtokens"("identifier", "token");

-- CreateIndex
CREATE UNIQUE INDEX "_ContactToEvent_AB_unique" ON "_ContactToEvent"("A", "B");

-- CreateIndex
CREATE INDEX "_ContactToEvent_B_index" ON "_ContactToEvent"("B");

-- AddForeignKey
ALTER TABLE "accounts" ADD CONSTRAINT "accounts_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Calendar" ADD CONSTRAINT "Calendar_calOwnerId_fkey" FOREIGN KEY ("calOwnerId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "events" ADD CONSTRAINT "events_calendarId_fkey" FOREIGN KEY ("calendarId") REFERENCES "Calendar"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Reminder" ADD CONSTRAINT "Reminder_contactId_fkey" FOREIGN KEY ("contactId") REFERENCES "Contact"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Reminder" ADD CONSTRAINT "Reminder_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "events"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Contact" ADD CONSTRAINT "Contact_userOwnerId_fkey" FOREIGN KEY ("userOwnerId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DefaultRemindersUser" ADD CONSTRAINT "DefaultRemindersUser_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DefaultRemindersContact" ADD CONSTRAINT "DefaultRemindersContact_contactId_fkey" FOREIGN KEY ("contactId") REFERENCES "Contact"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ContactToEvent" ADD CONSTRAINT "_ContactToEvent_A_fkey" FOREIGN KEY ("A") REFERENCES "Contact"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ContactToEvent" ADD CONSTRAINT "_ContactToEvent_B_fkey" FOREIGN KEY ("B") REFERENCES "events"("id") ON DELETE CASCADE ON UPDATE CASCADE;
