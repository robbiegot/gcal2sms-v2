import { getSession } from 'next-auth/react';
import prisma from '../../lib/prisma';
import { Prisma } from '@prisma/client'
import { NextApiRequest, NextApiResponse } from 'next'
import { OAuth2Client } from 'google-auth-library';
import { calendar_v3, google } from "googleapis";
import { Session } from 'next-auth';
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

    const events = await calendar.events.list({
        calendarId: calendarId,
        timeMin: (new Date('January 1, 2023')).toISOString(),
        singleEvents: true,
        orderBy: 'startTime',
    }, async (error, result) => {
        if (error) {
            res.status(400).json(error);
            throw error;
        } else {
            const eventsFromGoogle: calendar_v3.Schema$Event[] = result.data.items;
            if (eventsFromGoogle.length > 0) {
                const deleteManyOrCondition: Prisma.EventWhereInput[] = []
                const createManyOrCondition: Prisma.EventCreateWithoutCalendarInput[] = [];
                for (const event of eventsFromGoogle) {
                    const { id, status, htmlLink, created, updated,
                        summary, description, location, organizer,
                        start, end, attendees } = event;
                    deleteManyOrCondition.push({ googleId: id })
                    createManyOrCondition.push({
                        googleId: id,
                        status: status,
                        summary: summary,
                        htmlLink: htmlLink,
                        created: new Date(created),
                        updated: new Date(updated),
                        description: description,
                        location: location,
                        organizerEmail: organizer.email,
                        start: new Date(start.dateTime),
                        end: new Date(end.dateTime),
                    })
                }
                const MAX_RETRIES = 5
                let retries = 0
                let result
                while (retries < MAX_RETRIES && !result) {
                    try {
                        result = await prisma.$transaction([
                            prisma.event.deleteMany({ where: { OR: deleteManyOrCondition } }),
                            prisma.calendar.update({
                                where: { googleId: calendarId },
                                data: {
                                    events: {
                                        createMany: {
                                            data: createManyOrCondition
                                        }
                                    }
                                }
                            })
                        ],
                            { isolationLevel: Prisma.TransactionIsolationLevel.Serializable, }
                        )
                    } catch (error) {
                        if (error.code === 'P2034') {
                            retries++
                            continue
                        }
                        throw error
                    }
                }
            }
        }
    })

    res.json(events)
}