import { getSession } from 'next-auth/react';
import prisma from '../../../lib/prisma';
import { NextApiRequest, NextApiResponse } from 'next'


export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const session = await getSession({ req });
    const { componentName, textSubmission } = req.body;

    const fieldToUpdate = componentName;
    const valueToChange = (componentName === "defRmndrTime" || componentName === "phoneNumber") ? Number(textSubmission) : String(textSubmission)
    try {
        const result = await prisma.user.update({
            data: { [fieldToUpdate]: valueToChange },
            where: {
                email: session.user.email.toLowerCase(),
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


