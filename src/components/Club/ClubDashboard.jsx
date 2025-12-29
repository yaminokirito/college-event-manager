import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'

import BookingForm from '../Booking/BookingForm'
import EventCalendar from '../Calendar/EventCalendar'
import ClubSummary from './ClubSummary'
import UploadReport from '../Reports/UploadReport'

import {
  collection,
  query,
  where,
  getDocs,
  doc,
  updateDoc,
} from 'firebase/firestore'
import { db } from '../../firebase'

export default function ClubDashboard({ user }) {
  const [tab, setTab] = useState('approved')
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(false)

  /* ---------------- LOAD BOOKINGS ---------------- */
  useEffect(() => {
    fetchBookings()
    // eslint-disable-next-line
  }, [tab, user])

  async function fetchBookings() {
    if (!user) {
      setBookings([])
      return
    }

    try {
      setLoading(true)

      const q = query(
        collection(db, 'bookings'),
        where('clubId', '==', user.uid),
        where('status', '==', tab)
      )

      const snap = await getDocs(q)
      setBookings(snap.docs.map(d => ({ id: d.id, ...d.data() })))
    } catch (err) {
      console.error('Error fetching bookings:', err)
    } finally {
      setLoading(false)
    }
  }

  /* ---------------- REGISTRATION LINK ---------------- */
  async function setRegistrationLink(bookingId, currentLink) {
    const val = window.prompt(
      'Enter registration URL (leave blank to remove):',
      currentLink || ''
    )
    if (val === null) return

    try {
      await updateDoc(doc(db, 'bookings', bookingId), {
        registrationLink: val || null,
      })
      fetchBookings()
      alert('Registration link saved')
    } catch (err) {
      console.error(err)
      alert('Failed to save link')
    }
  }

  return (
    <motion.div
      className="grid grid-cols-1 lg:grid-cols-3 gap-6"
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* LEFT — ROOM REQUEST */}
      <motion.div className="p-6 rounded-2xl bg-gradient-to-b from-gray-800 to-gray-900 shadow-lg">
        <h3 className="text-2xl font-semibold mb-4 text-blue-400">
          Request a Room
        </h3>
        <BookingForm user={user} />
      </motion.div>

      {/* CENTER — CALENDAR */}
      <motion.div className="p-6 rounded-2xl bg-gradient-to-b from-gray-800 to-gray-900 shadow-lg">
        <h3 className="text-2xl font-semibold mb-4 text-blue-400">
          Event Calendar
        </h3>
        <EventCalendar />
      </motion.div>

      {/* RIGHT — CLUB SUMMARY */}
      <motion.div className="p-6 rounded-2xl bg-gradient-to-b from-gray-800 to-gray-900 shadow-lg">
        <h3 className="text-2xl font-semibold mb-4 text-blue-400">
          Club Summary
        </h3>
        <ClubSummary clubId={user?.uid} />
      </motion.div>

      {/* BOTTOM — BOOKINGS LIST */}
      <motion.div className="lg:col-span-3 p-6 rounded-2xl bg-gradient-to-b from-gray-800 to-gray-900 shadow-lg">
        <div className="flex flex-wrap items-center justify-between mb-4 gap-3">
          <h3 className="text-2xl font-semibold text-blue-400">
            Your Bookings
          </h3>

          {/* Tabs */}
          <div className="flex gap-2">
            {['pending', 'approved', 'rejected'].map(t => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`px-3 py-1 rounded-lg font-semibold transition ${
                  tab === t
                    ? 'bg-green-500 text-black'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                {t.charAt(0).toUpperCase() + t.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* List */}
        {loading ? (
          <div className="text-gray-400">Loading...</div>
        ) : bookings.length === 0 ? (
          <div className="text-gray-400 italic">
            No {tab} bookings.
          </div>
        ) : (
          <ul className="space-y-3">
            {bookings.map(b => (
              <li
                key={b.id}
                className="p-4 rounded-lg bg-gray-700 flex justify-between gap-4"
              >
                {/* INFO */}
                <div>
                  <div className="font-semibold text-white">
                    {b.title || 'Untitled Event'}
                  </div>
                  <div className="text-sm text-gray-300">
                    {b.room} •{' '}
                    {b.date
                      ? new Date(b.date).toLocaleDateString()
                      : 'No date'}
                  </div>
                  <div className="text-sm text-gray-400">
                    {b.start} – {b.end}
                  </div>
                </div>

                {/* ACTIONS */}
                <div className="flex flex-col items-end gap-2">
                  {/* Registration Link */}
                  {b.registrationLink ? (
                    <>
                      <a
                        href={b.registrationLink}
                        target="_blank"
                        rel="noreferrer"
                        className="px-3 py-1 rounded bg-green-500 text-black font-semibold"
                      >
                        Open link
                      </a>
                      <button
                        onClick={() =>
                          navigator.clipboard?.writeText(
                            b.registrationLink
                          )
                        }
                        className="text-xs underline text-gray-300"
                      >
                        Copy link
                      </button>
                    </>
                  ) : (
                    <span className="text-xs text-gray-400 italic">
                      No registration link
                    </span>
                  )}

                  {/* Edit Registration Link */}
                  {tab === 'approved' && (
                    <button
                      onClick={() =>
                        setRegistrationLink(b.id, b.registrationLink)
                      }
                      className="px-3 py-1 rounded bg-blue-500 text-white text-sm"
                    >
                      {b.registrationLink ? 'Edit link' : 'Add link'}
                    </button>
                  )}

                  {/* ✅ REPORT UPLOAD — APPROVED ONLY */}
                  {b.status === 'approved' && (
                    <UploadReport booking={b} user={user} />
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </motion.div>
    </motion.div>
  )
}
