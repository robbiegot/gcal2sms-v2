import { NextApiRequest, NextApiResponse } from 'next';
import { getSession } from 'next-auth/react';
import prisma from '../../../lib/prisma';
import { v4 as randomId } from 'uuid';
const timeUnitToMinutes = (time: number, timeUnit: string) => {
    switch (timeUnit) {
        case 'minutes':
            return time;
        case 'hours':
            return time * 60;
        case 'days':
            return time * 60 * 24;
        default:
            return time;
    }
};

const minutesToTimeUnit = (time: number, timeUnit: string) => {
    switch (timeUnit) {
        case 'minutes':
            return time;
        case 'hours':
            return time / 60;
        case 'days':
            return time / 60 / 24;
        default:
            return time;
    }
};

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
    const session = await getSession({ req });
    if (!session) {
        res.status(401).json({ message: 'Unauthorized' });
        return;
    }
    if (req.method === 'PATCH') {
        const { id, time, timeUnit, text } = req.body;
        const idToUpdate = id ?? randomId();
        const timeInMinutes = timeUnitToMinutes(time, timeUnit);
        const userId = session.user.id;
        try {
            const updatedReminder = await prisma.defaultRemindersUser.upsert({
                where: { id: idToUpdate },
                create: { id: idToUpdate, time: timeInMinutes, text, user: { connect: { id: session.user.userId } } },
                update: { time: timeInMinutes, text, userId },
                select: { id: true, time: true, text: true },
            });
            const updatedWithTimeUnit = Object.assign(updatedReminder, { timeUnit: timeUnit, time: minutesToTimeUnit(updatedReminder.time, timeUnit) });
            return res.status(200).json(updatedWithTimeUnit);
        } catch (error) {
            console.log(error)
            return res.status(400).json(error);
        }
    } else if (req.method === 'DELETE') {
        const { id } = req.body;

        try {
            await prisma.defaultRemindersUser.delete({
                where: { id },
            });

            return res.status(200).json({ id: id, message: 'Reminder deleted' });
        } catch (error) {
            return res.status(400).json(error);
        }
    }
    else {
        return res.status(405).json({ message: 'Method not allowed' });
    }
};

export default handler;