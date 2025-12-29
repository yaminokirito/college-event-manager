import React, { useEffect, useState } from "react"
import { db } from "../../firebase"
import {
  collection,
  query,
  where,
  onSnapshot,
  updateDoc,
  doc,
} from "firebase/firestore"

import Calendar from "react-calendar"
import "react-calendar/dist/Calendar.css"

const TeacherDashboard = () => {
  const [bookings, setBookings] = useState([])
  const [reports, setReports] = useState([])

  // 🔹 Fetch bookings
  useEffect(() => {
    const q = query(collection(db, "bookings"))

    const unsub = onSnapshot(q, (snap) => {
      setBookings(
        snap.docs.map((d) => ({ id: d.id, ...d.data() }))
      )
    })

    return () => unsub()
  }, [])

  // 🔹 Fetch reports
  useEffect(() => {
    const q = collection(db, "reports")

    const unsub = onSnapshot(q, (snap) => {
      setReports(
        snap.docs.map((d) => ({ id: d.id, ...d.data() }))
      )
    })

    return () => unsub()
  }, [])

  // 🔹 Approve / Reject booking
  const updateStatus = async (id, status) => {
    await updateDoc(doc(db, "bookings", id), { status })
  }

  const approvedEvents = bookings.filter((b) => b.status === "approved")
  const pendingBookings = bookings.filter((b) => b.status === "pending")

  return (
    <div className="p-6 space-y-8">

      {/* HEADER */}
      <div>
        <h1 className="text-2xl font-bold text-green-400">
          Teacher Dashboard
        </h1>
        <p className="text-gray-400">
          Approve bookings, review events, and verify reports
        </p>
      </div>

      {/* STATS */}
      <div className="grid grid-cols-3 gap-4">
        <Stat title="Pending Requests" value={pendingBookings.length} />
        <Stat title="Approved Events" value={approvedEvents.length} />
        <Stat title="Reports Submitted" value={reports.length} />
      </div>

      {/* 📅 CALENDAR */}
      <div className="bg-slate-900 p-4 rounded-xl">
        <h2 className="text-lg mb-3 text-blue-400">Event Calendar</h2>
        <Calendar
          tileContent={({ date }) =>
            approvedEvents.some(
              (e) =>
                new Date(e.date).toDateString() ===
                date.toDateString()
            ) && (
              <div className="text-xs text-green-400">●</div>
            )
          }
        />
      </div>

      {/* 📌 BOOKING APPROVALS */}
      <div className="bg-slate-900 p-4 rounded-xl">
        <h2 className="text-lg mb-3 text-yellow-400">
          Booking Approvals
        </h2>

        {pendingBookings.length === 0 && (
          <p className="text-gray-500">No pending requests</p>
        )}

        {pendingBookings.map((b) => (
          <div
            key={b.id}
            className="flex justify-between items-center bg-slate-800 p-3 rounded mb-2"
          >
            <div>
              <p className="font-semibold">{b.eventName}</p>
              <p className="text-sm text-gray-400">
                {b.clubName} — {b.date}
              </p>
            </div>

            <div className="space-x-2">
              <button
                onClick={() => updateStatus(b.id, "approved")}
                className="bg-green-600 px-3 py-1 rounded"
              >
                Approve
              </button>
              <button
                onClick={() => updateStatus(b.id, "rejected")}
                className="bg-red-600 px-3 py-1 rounded"
              >
                Reject
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* 📄 EVENT REPORTS */}
      <div className="bg-slate-900 p-4 rounded-xl">
        <h2 className="text-lg mb-3 text-blue-400">Event Reports</h2>

        {reports.length === 0 && (
          <p className="text-gray-500">No reports submitted</p>
        )}

        {reports.map((r) => (
          <div
            key={r.id}
            className="flex justify-between items-center bg-slate-800 p-3 rounded mb-2"
          >
            <div>
              <p className="font-semibold">{r.eventName}</p>
              <p className="text-sm text-gray-400">
                {r.clubName}
              </p>
            </div>

            <a
              href={r.fileUrl}
              target="_blank"
              rel="noreferrer"
              className="text-blue-400 underline"
            >
              View PDF
            </a>
          </div>
        ))}
      </div>
    </div>
  )
}

const Stat = ({ title, value }) => (
  <div className="bg-slate-900 p-4 rounded-xl text-center">
    <p className="text-gray-400">{title}</p>
    <p className="text-2xl font-bold">{value}</p>
  </div>
)

export default TeacherDashboard
