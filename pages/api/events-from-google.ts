import { getSession } from 'next-auth/react';
import prisma from '../../lib/prisma';
import { Prisma, Event } from '@prisma/client'
import { NextApiRequest, NextApiResponse } from 'next'
import { OAuth2Client } from 'google-auth-library';
import { calendar_v3, google } from "googleapis";
import { Session } from 'next-auth';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const session: Session = await getSession({ req });
    const { calendarId }: { calendarId: string } = req.body;

    try {
        const response = await fetch(process.env.NGROK_URL + '/api/googleController', {
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ calendarId: calendarId }),
            method: "POST",
        }).then(res => res.json())
        res.status(200).json(response);
    } catch (error) {
        console.log(error)
        res.status(400).json(error);
    }




}