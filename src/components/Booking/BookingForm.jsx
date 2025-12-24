import React, { useEffect, useState } from 'react'
import { addDoc, collection, getDocs, serverTimestamp } from 'firebase/firestore'
import { db } from '../../firebase'

export default function BookingForm({ user }) {
  const [rooms, setRooms] = useState([])
  const [room, setRoom] = useState('')
  const [title, setTitle] = useState('')
  const [date, setDate] = useState('')
  const [start, setStart] = useState('10:00')
  const [end, setEnd] = useState('11:00')
  const [msg, setMsg] = useState('')
  const [loading, setLoading] = useState(false)

  /* ---------------- LOAD ROOMS ---------------- */
  useEffect(() => {
    async function loadRooms() {
      try {
        const snap = await getDocs(collection(db, 'rooms'))
        const list = snap.docs.map(d => ({
          id: d.id,
          name: d.data().name
        }))
        setRooms(list)
        if (list.length > 0) setRoom(list[0].name)
      } catch (err) {
        console.error('Failed to load rooms', err)
      }
    }
    loadRooms()
  }, [])

  /* ---------------- SUBMIT BOOKING ---------------- */
  const submit = async (e) => {
    e.preventDefault()

    if (!user) {
      setMsg('You must be logged in')
      return
    }

    if (!room) {
      setMsg('No rooms available')
      return
    }

    if (end <= start) {
      setMsg('End time must be after start time')
      return
    }

    try {
      setLoading(true)
      await addDoc(collection(db, 'bookings'), {
        title,
        room,
        date,
        start,
        end,
        status: 'pending',
        clubId: user.uid,
        createdAt: serverTimestamp()
      })

      setMsg('✅ Request submitted for approval')
      setTitle('')
      setDate('')
    } catch (err) {
      console.error(err)
      setMsg('❌ Failed to submit request')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={submit} className="flex flex-col gap-3">

      {/* Event title */}
      <input
        placeholder="Event title"
        value={title}
        onChange={e => setTitle(e.target.value)}
        className="p-2 rounded bg-white text-black placeholder-gray-500"
        required
      />

      {/* Room selection */}
      <select
        value={room}
        onChange={e => setRoom(e.target.value)}
        className="p-2 rounded bg-white text-black"
        disabled={rooms.length === 0}
      >
        {rooms.length === 0 ? (
          <option>No rooms available</option>
        ) : (
          rooms.map(r => (
            <option key={r.id} value={r.name}>
              {r.name}
            </option>
          ))
        )}
      </select>

      {/* Date */}
      <input
        type="date"
        value={date}
        onChange={e => setDate(e.target.value)}
        className="p-2 rounded bg-white text-black"
        required
      />

      {/* Time */}
      <div className="flex gap-2">
        <input
          type="time"
          value={start}
          onChange={e => setStart(e.target.value)}
          className="p-2 rounded bg-white text-black"
          required
        />
        <input
          type="time"
          value={end}
          onChange={e => setEnd(e.target.value)}
          className="p-2 rounded bg-white text-black"
          required
        />
      </div>

      {/* Submit */}
      <button
        className="btn-primary"
        type="submit"
        disabled={loading || rooms.length === 0}
      >
        {loading ? 'Submitting...' : 'Submit request'}
      </button>

      {/* Message */}
      {msg && (
        <div className="text-sm text-gray-300">{msg}</div>
      )}
    </form>
  )
}
