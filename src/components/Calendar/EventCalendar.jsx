import React, { useEffect, useState } from 'react'
import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid'
import timeGridPlugin from '@fullcalendar/timegrid'
import interactionPlugin from '@fullcalendar/interaction'
import { collection, query, where, getDocs } from 'firebase/firestore'
import { db } from '../../firebase'

export default function EventCalendar({showRegister=false}){
  const [events,setEvents] = useState([])

  useEffect(()=>{ loadEvents() },[])

  async function loadEvents(){
    const q = query(collection(db,'bookings'), where('status','==','approved'))
    const s = await getDocs(q)
    const ev = s.docs.map(d=>{
      const data = d.data()
      return {
        id: d.id,
        title: data.title + ' — ' + data.room,
        start: data.date + 'T' + data.start,
        end: data.date + 'T' + data.end
      }
    })
    setEvents(ev)
  }

  return (
    <FullCalendar plugins={[dayGridPlugin,timeGridPlugin,interactionPlugin]}
      initialView="dayGridMonth"
      events={events}
      height={600}
    />
  )
}
