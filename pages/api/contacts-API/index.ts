import { getSession } from 'next-auth/react';
import prisma from '../../../lib/prisma';
import { NextApiRequest, NextApiResponse } from 'next'


export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const session = await getSession({ req });

    try {
        const result = await prisma.user.update({
            where: { email: session.user.email },
            data: {
                contacts: {
                    delete: { email: req.body.email }, // Delete existing records first
                    create: {
                        id: req.body.id,
                        name: req.body.name,
                        phoneNumber: req.body.phoneNumber,
                        customReminderText: req.body.customReminder,
                        email: req.body.email,
                    }
                }
            },
        });
        res.json(result);
    } catch (error) {
        res.json("there was an issue" + error);
    };




}