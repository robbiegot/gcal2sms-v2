import { getSession } from 'next-auth/react';
import prisma from '../../../lib/prisma';
import { Prisma } from '@prisma/client'
import { NextApiRequest, NextApiResponse } from 'next'
import { OAuth2Client, Credentials } from 'google-auth-library';
import { calendar_v3, google } from "googleapis";
import { Session } from 'next-auth';
import { BodyResponseCallback } from 'googleapis/build/src/apis/abusiveexperiencereport';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const session: Session = await getSession({ req });
    const { calendarId }: { calendarId: string } = req.body;

    const auth: OAuth2Client = new google.auth.OAuth2({
        clientId: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        redirectUri: process.env.GOOGLE_AUTHORIZATION_URL,
    });

    auth.setCredentials({
        refresh_token: session.googleRefreshToken,
        access_token: session.googleAccessToken,
        expiry_date: session.expires_at
    });

    const calendar: calendar_v3.Calendar = await google.calendar({
        version: 'v3',
        auth: auth
    });

    const userCalendar: void = calendar.calendarList.get({
        calendarId: calendarId,
    }, async (error, response) => {
        if (error) {
            res.status(400).json(error);
            throw error;
        } else if (response) {
            const { id, summary, timeZone } = response.data;
            try {
                const calInDb = await prisma.user.update({
                    where: { email: session.user.email },
                    select: {
                        calendar: {
                            select: {
                                googleId: true
                            }
                        }
                    },
                    data: {
                        calendar: {
                            upsert: {
                                where: {
                                    googleId: id,
                                },
                                update: {},
                                create: {
                                    googleId: id,
                                    summary: summary,
                                    timeZone: timeZone,
                                }

                            }
                        }
                    }
                });
                res.json(calInDb.calendar[0]);
                return;
            } catch (e) {
                if (e instanceof Prisma.PrismaClientKnownRequestError) {
                    if (e.code === 'P2002') {
                        console.log(e)
                    }
                }
                throw e
            }
        }
    })


}



