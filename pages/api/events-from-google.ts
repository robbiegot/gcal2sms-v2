import { getSession } from 'next-auth/react';
import { NextApiRequest, NextApiResponse } from 'next'
import { Session } from 'next-auth';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const session: Session = await getSession({ req });
    const { calendarId }: { calendarId: string } = req.body;

    try {
        const response = await fetch(process.env.NGROK_URL + '/api/google', {
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