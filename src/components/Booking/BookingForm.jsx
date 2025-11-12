import React, { useState } from 'react'
import { addDoc, collection, serverTimestamp } from 'firebase/firestore'
import { db } from '../../firebase'

export default function BookingForm({rooms, user}){
  const [room, setRoom] = useState(rooms[0])
  const [title, setTitle] = useState('')
  const [date, setDate] = useState('')
  const [start, setStart] = useState('10:00')
  const [end, setEnd] = useState('11:00')
  const [msg,setMsg] = useState('')

  const submit = async (e)=>{
    e.preventDefault()
    if(!user) return setMsg('Login required')
    await addDoc(collection(db,'bookings'),{
      room, title, date, start, end, status: 'pending', createdAt: serverTimestamp(), clubId: user.uid
    })
    setMsg('Request submitted')
  }

  return (
    <form onSubmit={submit} className="flex flex-col gap-3">
      <input placeholder="Event title" value={title} onChange={e=>setTitle(e.target.value)} className="p-2 rounded bg-white text-black placeholder-gray-500" required />
      <select value={room} onChange={e=>setRoom(e.target.value)} className="p-2 rounded bg-white text-black">
        {rooms.map(r=> <option key={r} value={r}>{r}</option>)}
      </select>
      <input type="date" value={date} onChange={e=>setDate(e.target.value)} className="p-2 rounded bg-white text-black" required />
      <div className="flex gap-2">
        <input type="time" value={start} onChange={e=>setStart(e.target.value)} className="p-2 rounded bg-white text-black" required />
        <input type="time" value={end} onChange={e=>setEnd(e.target.value)} className="p-2 rounded bg-white text-black" required />
      </div>
      <button className="btn-primary" type="submit">Submit request</button>
      {msg && <div className="text-sm">{msg}</div>}
    </form>
  )
}