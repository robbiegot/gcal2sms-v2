
import { getSession } from 'next-auth/react';
import prisma from '../../../lib/prisma';
import { NextApiRequest, NextApiResponse } from 'next'
import { google } from "googleapis";
import { getToken } from 'next-auth/jwt';

const secret = process.env.NEXTAUTH_SECRET;
let accessToken;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {

    const session = await getSession({ req });
    console.log('heres the session', session);

    const { calendarID } = req.body;

    // const auth = new google.auth.OAuth2({
    //     clientId: process.env.GOOGLE_CLIENT_ID,
    //     clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    //     redirectUri: process.env.GOOGLE_AUTHORIZATION_URL,
    // });

    // auth.setCredentials({
    //     refresh_token: refresh_token,
    //     access_token: access_token,
    // });


    // try {

    //     const result = await prisma.user.update({
    //         data: { [fieldToUpdate]: valueToChange },
    //         where: {
    //             email: session.user.email,
    //         },
    //         select: {
    //             [fieldToUpdate]: true
    //         }
    //     });
    //     res.json(result);
    // } catch (error) {
    //     res.json("there was an issue" + error);
    // };
    // res.json(calendarID)
}

const getCalendarData = async (refresh_token, access_token) => {





    const calendar = await google.calendar({
        version: 'v3',
        auth: auth
    });

    calendar.events.list({
        calendarId: process.env.GOOGLE_CALENDAR_ID,
        timeMin: (new Date()).toISOString(),
        singleEvents: true,
        orderBy: 'startTime',
    }, (error, result) => {
        if (error) {
            throw error;
        } else {
            if (result.data.items.length) {
                return JSON.stringify({ events: result.data.items });
            } else {
                return JSON.stringify({ message: 'No upcoming events found.' });
            }
        }
    });
}