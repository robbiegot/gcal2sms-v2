import { google } from "googleapis";
import prisma from '../../lib/prisma';

const secret = process.env.NEXTAUTH_SECRET; 

const getCalendarData = async (refresh_token, access_token) => {
  const auth = new google.auth.OAuth2({
    clientId: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    redirectUri: process.env.GOOGLE_AUTHORIZATION_URL,
  });

  auth.setCredentials({
    refresh_token: refresh_token,
    access_token: access_token,
  });

  const calendar = await google.calendar({
        version: 'v3',
        auth:auth
  }); 

calendar.events.list({
    calendarId: process.env.GOOGLE_CALENDAR_ID,
    timeMin: (new Date()).toISOString(),
    maxResults: 10,
    singleEvents: true,
    orderBy: 'startTime',
  }, (error, result) => {
    if (error) {
      console.log("error!")
    throw error; 
    } else {
      console.log("line 34", result.data.items)
      if (result.data.items.length) {
        return JSON.stringify({ events: result.data.items });
      } else {
        return JSON.stringify({ message: 'No upcoming events found.' });
      }
    }
  });
}


export default async (req, res) => {

  const credentials = await prisma.account.findMany({
      where: {
        userId: 'clemdtwfz0005tlil7hx2fb36'
      },
      select: {
        refresh_token: true, 
        access_token: true
      }
    })

  console.log(credentials)
  let data;

  const {refresh_token, access_token} = credentials[0];

  try{
    data = await getCalendarData(refresh_token, access_token);
    console.log("line 63", data)
  } catch(error) {
    console.log(error)
  }
  

};






