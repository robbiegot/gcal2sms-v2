import { getSession } from 'next-auth/react';
import prisma from '../../../lib/prisma';
import { NextApiRequest, NextApiResponse } from 'next'
import libphonenumber, { PhoneNumberFormat } from 'google-libphonenumber';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const session = await getSession({ req });
    const { componentName,value } = req.body;
    let valueToChange = value;

    if (componentName === "phoneNumber") {
        const phoneUtil = libphonenumber.PhoneNumberUtil.getInstance();
        const number = phoneUtil.parse(value, 'US');
        valueToChange = phoneUtil.format(number, PhoneNumberFormat.E164);
    }
    console.log('componentName', componentName)

    console.log('valueToChange', valueToChange)
    try {
        const result = await prisma.user.update({
            data: { [componentName]: valueToChange },
            where: { email: session.user.email.toLowerCase() },
            select: {
                [componentName]: true
            }
        });
        res.json(result);
        console.log("heres the result", result)
    } catch (error) {
        console.log("heres the error", error)

        res.json("there was an issue" + error);
    };
}


