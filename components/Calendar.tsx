import React, { useEffect } from 'react'
import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid'
import timeGridPlugin from '@fullcalendar/timegrid'
import listPlugin from '@fullcalendar/list';
import { Container } from '@mui/material';
import { formatDate } from '@fullcalendar/core'
import { useState } from 'react';


const Calendar = ({ events }) => {


  let formatTheDate = (dateString) => {
    return formatDate(dateString,
      {
        month: 'long',
        year: 'numeric',
        day: 'numeric',
        timeZoneName: 'short',
        locale: 'ny'
      })


  }

  const renderEventContent = (eventInfo) => {
    return (
      <div>
        <i>{eventInfo.event.title}</i>
        <i>{eventInfo.event.extendedProps.status}</i>
      </div>
    )
  }


  const [eventsForCal, setEventsForCal] = useState(events.map(event => {
    return {
      id: event.id, title: event.summary, start: event.start, end: event.end, extendedProps: {
        status: event.status, description: events.description
      }
    }
  }))

  console.log('here are the events for cal', eventsForCal)
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
        plugins={[dayGridPlugin, timeGridPlugin, listPlugin]}
        headerToolbar={{ center: 'listWeek,dayGridMonth,timeGridWeek,timeGridDay' }} // buttons for switching between views
        initialView='listWeek'
        weekends={true}
        eventDisplay={'block'}
        events={eventsForCal}
        eventContent={renderEventContent}

      />
    </Container>
  )
}



export default Calendar