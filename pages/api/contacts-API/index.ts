import { getSession } from 'next-auth/react';
import prisma from '../../../lib/prisma';
import { NextApiRequest, NextApiResponse } from 'next'


export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const session = await getSession({ req });
    if (req.method === 'POST') {
        const { id, name, phoneNumber, sendReminders, email } = req.body;
        try {
            const result = await prisma.user.update({
                where: { email: session.user.email.toLowerCase() },
                include: {
                    contacts: {
                        where: { email: email }
                    }
                },
                data: {
                    contacts: {
                        upsert: {
                            where: { id: id },
                            update: {
                                name: name,
                                phoneNumber: phoneNumber,
                                sendReminders: sendReminders,
                                email: email.toLowerCase(),
                            },
                            create: {
                                id: id,
                                name: name,
                                phoneNumber: phoneNumber,
                                sendReminders: sendReminders,
                                email: email.toLowerCase(),
                            }
                        }
                    }
                },
            });
            res.status(200).send(result.contacts[0]);
        } catch (error) {
            res.status(400).json(error);
        };
    }
    if (req.method === 'DELETE') {
        const id = req.body;
        try {
            const deleted = await prisma.contact.delete({
                where: { id: id },
            });
            res.status(200).send(deleted);
        } catch (error) {
            console.log(error)
            return res.status(400).send(new Error("there was an issue deleting the record . Please try again"));
        };
    }
}