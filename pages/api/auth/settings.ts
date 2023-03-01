import { getSession } from 'next-auth/react';
import prisma from '../../../lib/prisma';

// POST /api/post
// Required fields in body: title
// Optional fields in body: content
export default async function handle(req, res) {

    const session = await getSession({ req });
    const result = await prisma.user.findUnique({
        where: { id: "clemdtwfz0005tlil7hx2fb36" }

    });
    res.json(result);
}
