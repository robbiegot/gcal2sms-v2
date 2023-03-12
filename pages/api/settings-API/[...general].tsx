import { getSession } from 'next-auth/react';
import prisma from '../../../lib/prisma';
import { NextApiRequest, NextApiResponse } from 'next'
import { text } from 'stream/consumers';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {

    const session = await getSession({ req });
    const { componentName, textSubmission } = req.body;
    console.log('hitting general settings ', componentName, textSubmission)

    const fieldToUpdate = componentName;
    const valueToChange = (componentName === "defRmndrTime" || componentName === "phoneNumber") ? Number(textSubmission) : String(textSubmission)
    try {
        const result = await prisma.user.update({
            data: { [fieldToUpdate]: valueToChange },
            where: {
                email: session.user.email,
            },
            select: {
                [fieldToUpdate]: true
            }
        });
        res.json(result);
    } catch (error) {
        res.json("there was an issue" + error);
    };
}


