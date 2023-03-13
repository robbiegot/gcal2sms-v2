import React, { useEffect } from 'react'
import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid'
import googleCalendarPlugin from '@fullcalendar/google-calendar';
import timeGridPlugin from '@fullcalendar/timegrid'
import listPlugin from '@fullcalendar/list';
import { Container } from '@mui/material';

const Calendar = () => {
  return (
    <Container
      sx={{
        ['--fc-button-bg-color']: '#2b774aed',
        ['--fc-button-active-bg-color']: '#1a252f',
        ['--fc-button-hover-border-color']: 'rgb(255 255 255)',
        ['--fc-button-hover-bg-color']: '#2b774aba',
        ['--fc-button-border-color']: 'rgb(255 255 255)',
        ['--fc-button-active-border-color']: 'rgb(255 255 255)',
        marginTop: '1vw'
      }}>
      <FullCalendar
        plugins={[dayGridPlugin, googleCalendarPlugin, timeGridPlugin, listPlugin]}
        googleCalendarApiKey={process.env.API_KEY}
        headerToolbar={{ center: 'listWeek,dayGridMonth,timeGridWeek,timeGridDay' }} // buttons for switching between views
        initialView='listWeek'
        weekends={true}
        eventDisplay={'block'}
        events={{
          googleCalendarId: '632bbd88ece6566285b61476b6f3230133c95538c84cb28d474d30c9d4bfe4a6@group.calendar.google.com',
        }}
      />
    </Container>
  )
}

export default Calendar