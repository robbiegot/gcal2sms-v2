import React from "react"
import Layout from "../components/Layout"
import { useRouter } from "next/router"
import { useSession } from "next-auth/react"

const CalendarApp: React.FC = (props) => {
  const { data: session, status } = useSession();

  const router = useRouter()

  if (status === "unauthenticated") {
    router.replace('/auth/signin')
    return null;
  }

  return (
    <Layout>
    </Layout>
  )
}

export default CalendarApp
