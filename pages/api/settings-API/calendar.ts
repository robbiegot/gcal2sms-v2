
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



// try {
//     for (const item of events)
//         const result = await prisma.user.update({
//             where: {
//                 email: session.user.email,
//             },
//             data: {
//                 calendar: {
//                     upsert: {
//                         create: {
//                             googleId: calendarId
//                             Summary: InsertEmoticon.
//                                 timeZone: L
//                         },
//                         // update: {
//                         //     email: 'bob@prisma.io',
//                         //     name: 'Bob the existing user',
//                         // },

//                     }
//                 }
//             },
//         })
//     //         where: {
//     //             email: session.user.email,
//     //         },
//     //         select: {
//     //             [fieldToUpdate]: true
//     //         }
//     //     });
//     //     res.json(result);
//     // } catch (error) {
//     //     res.json("there was an issue" + error);
//     // };
//     // res.json(calendarID)
// }

    // const events = await calendar.events.list({
    //     calendarId: calendarId,
    //     timeMin: (new Date()).toISOString(),
    //     singleEvents: true,
    //     orderBy: 'startTime',
    // }, (error, result) => {
    //     if (error) {
    //         res.status(400).json(error);
    //         throw error;
    //     } else {
    //         const eventsFromGoogle: calendar_v3.Schema$Event[] = result.data.items;
    //         if (eventsFromGoogle.length > 0) {
    //             try {
    //                 for (const event of eventsFromGoogle) {
    //                     const result = await prisma.user.update({
    //                         where: {
    //                             email: session.user.email,
    //                         }
    //                         data: {
    //                             calendar: {
    //                                 upsert: {
    //                                     create: {
    //                                         googleId: calendarId,
    //                                         Summary: InsertEmoticon.
    //                                             timeZone: L
    //                                     },
    //                                 }
    //                             }
    //                         }
    //                     })
    //                 }
    //             } catch (error) {

    //             }
    //         }
    //     }
    // })