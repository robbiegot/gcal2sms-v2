import { getSession } from 'next-auth/react';
import prisma from '../../../lib/prisma';
import { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const session = await getSession({ req });
    const { componentName, textSubmission } = req.body;
    try {
        const result = await prisma.user.update({
            data: { [componentName]: textSubmission },
            where: {
                email: session.user.email,
            }
        });
        res.json(result)
    } catch (error) {
        res.json("there was an issue", error)
    }

}


