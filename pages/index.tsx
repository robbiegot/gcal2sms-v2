import React, { Props } from "react"
import Layout from "../components/Layout"
import { useRouter } from "next/router"
import { useSession } from "next-auth/react"
import { GetServerSideProps } from "next"
import prisma from "../lib/prisma"
import { getSession } from "next-auth/react"
import Calendar from "../components/Calendar"
import { Event } from "@prisma/client"

type appPageProps = {
  events?: eventsProp
}
type eventsProp = Omit<Event, 'created' | 'updated' | 'start' | 'end'> & { created: string, updated: string, start: string, end: string }[] | undefined;

const CalendarApp: React.FC<appPageProps> = ({ events }) => {
  const { data: session, status } = useSession();
  const router = useRouter();

  if (status === "unauthenticated") {
    router.replace('/auth/signin')
    return null;
  }

  return (
    <Layout>
      <Calendar events={events} />
    </Layout>
  )
}

export const getServerSideProps = async ({ req, res }) => {
  const session = await getSession({ req });
  if (!session) {
    res.statusCode = 403;
    return {
      redirect: {
        destination: '/auth/signin',
        permanent: false,
      }
    };
  }
  try {
    const events = await prisma.user.findUnique({
      where: {
        email: session.user.email,
      },
      select: {
        calendar: {
          select: {
            events: true
          }
        }
      }
    }).then((data => {
      const eventsFromDB: Event[] | null = data?.calendar[0]?.events;
      const eventData = eventsFromDB ? data?.calendar[0]?.events?.map((event: Event) => {
        return Object.assign({ ...event }, {
          created: (event.created).toISOString(),
          updated: (event.updated).toISOString(),
          start: (event.start).toISOString(),
          end: (event.end).toISOString()
        })
      }) : [];
      return eventData;
    }))

    return {
      props: {
        events
      }
    };
  } catch (error) {
    console.log("there was an issue" + error);
    return {
      redirect: {
        destination: '/auth/signin',
        permanent: false,
      }
    };
  }
}


export default CalendarApp;
