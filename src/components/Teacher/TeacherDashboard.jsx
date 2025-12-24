import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  updateDoc,
  runTransaction
} from 'firebase/firestore'
import { db } from '../../firebase'
import EventCalendar from '../Calendar/EventCalendar'
import RoomManager from './RoomManager'

export default function TeacherDashboard() {
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState('pending')

  useEffect(() => {
    fetchBookings()
  }, [tab])

  async function fetchBookings() {
    try {
      setLoading(true)
      const q = query(
        collection(db, 'bookings'),
        where('status', '==', tab)
      )
      const s = await getDocs(q)
      setBookings(s.docs.map(d => ({ id: d.id, ...d.data() })))
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  async function approve(b) {
    try {
      await runTransaction(db, async (tx) => {
        const bookingsRef = collection(db, 'bookings')
        const snapshot = await getDocs(
          query(
            bookingsRef,
            where('status', '==', 'approved'),
            where('room', '==', b.room),
            where('date', '==', b.date)
          )
        )

        const overlap = snapshot.docs.some(docSnap => {
          const d = docSnap.data()
          return !(b.end <= d.start || b.start >= d.end)
        })

        if (overlap) throw new Error('Slot already taken')

        tx.update(doc(db, 'bookings', b.id), {
          status: 'approved',
          approvedAt: new Date()
        })
      })

      fetchBookings()
    } catch (err) {
      alert(err.message)
    }
  }

  async function reject(b) {
    await updateDoc(doc(db, 'bookings', b.id), {
      status: 'rejected'
    })
    fetchBookings()
  }

  return (
    <motion.div
      className="grid grid-cols-1 xl:grid-cols-3 gap-6"
      initial={{ opacity: 0, y: 25 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >

      {/* ================= LEFT: REQUESTS ================= */}
      <motion.div
        className="p-6 rounded-2xl bg-gradient-to-b from-gray-800 to-gray-900 shadow-lg"
        whileHover={{ scale: 1.02 }}
      >
        <h3 className="text-2xl font-semibold mb-4 text-blue-400">
          Booking Requests
        </h3>

        {/* Tabs */}
        <div className="flex gap-3 mb-4">
          {['pending', 'approved', 'rejected'].map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-4 py-2 rounded-lg font-semibold ${
                tab === t
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-700 text-gray-300'
              }`}
            >
              {t.charAt(0).toUpperCase() + t.slice(1)}
            </button>
          ))}
        </div>

        {loading ? (
          <p className="text-gray-400 italic">Loading...</p>
        ) : bookings.length === 0 ? (
          <p className="text-gray-400 italic">No {tab} requests.</p>
        ) : (
          <div className="flex flex-col gap-3">
            {bookings.map(b => (
              <div
                key={b.id}
                className="p-4 rounded-lg bg-gray-700"
              >
                <div className="font-semibold text-white">
                  {b.title || 'Untitled'} — {b.room}
                </div>
                <div className="text-sm text-gray-300">
                  {b.date} | {b.start} - {b.end}
                </div>

                {tab === 'pending' && (
                  <div className="flex gap-3 mt-3">
                    <button
                      className="px-4 py-1.5 bg-green-500 text-black rounded-lg font-semibold"
                      onClick={() => approve(b)}
                    >
                      Approve
                    </button>
                    <button
                      className="px-4 py-1.5 border rounded-lg text-gray-200"
                      onClick={() => reject(b)}
                    >
                      Reject
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </motion.div>

      {/* ================= MIDDLE: CALENDAR ================= */}
      <motion.div
        className="p-6 rounded-2xl bg-gradient-to-b from-gray-800 to-gray-900 shadow-lg"
        whileHover={{ scale: 1.02 }}
      >
        <h3 className="text-2xl font-semibold mb-4 text-blue-400">
          Event Calendar
        </h3>
        <EventCalendar />
      </motion.div>

      {/* ================= RIGHT: ROOM MANAGER ================= */}
      <RoomManager />

    </motion.div>
  )
}
