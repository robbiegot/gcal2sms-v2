import { getSession } from 'next-auth/react';
import prisma from '../../../lib/prisma';
import { NextApiRequest, NextApiResponse } from 'next'


export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const session = await getSession({ req });
    const { text, time, id, newReminder } = req.body;

    if (req.method === 'POST') {
        const session = await getSession({ req });
        try {
            const result = await prisma.user.update({
                where: { email: session.user.email },
                data: {
                    defaultReminders: {
                        create: {
                            text: text,
                            time: time
                        }
                    }
                },
                select: { defaultReminders: true }
            });
            res.json(result);
        } catch (error) {
            res.json("there was an issue" + error);
        };
    }
    if (req.method === 'DELETE') {
        try {
            const result = await prisma.defaultRemindersUser.delete({ where: { id: id } });
            res.json(result);
        } catch (error) {
            res.json("there was an issue" + error);
        };
    }
    if (req.method === 'PATCH') {
        try {
            const result = await prisma.defaultRemindersUser.update({
                where: { id: id },
                data: {
                    text: text,
                    time: time
                }
            });
            res.json(result);
        } catch (error) {
            res.json("there was an issue" + error);
        };
    }
}



