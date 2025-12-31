import { useEffect, useState } from "react"
import { db } from "../../firebase"
import {
  collection,
  getDocs,
  updateDoc,
  doc,
} from "firebase/firestore"
import Calendar from "react-calendar"
import "react-calendar/dist/Calendar.css"

export default function TeacherDashboard() {
  const [bookings, setBookings] = useState([])
  const [reports, setReports] = useState([])

  useEffect(() => {
    fetchAll()
  }, [])

  /* ---------------- LOAD BOOKINGS + REPORTS ---------------- */
  const fetchAll = async () => {
    const bookingSnap = await getDocs(collection(db, "bookings"))
    const reportSnap = await getDocs(collection(db, "reports"))

    setBookings(
      bookingSnap.docs.map(d => ({
        id: d.id,
        ...d.data(),
      }))
    )

    setReports(
      reportSnap.docs.map(d => ({
        id: d.id,
        ...d.data(),
      }))
    )
  }

  /* ---------------- STATUS UPDATE ---------------- */
  const updateStatus = async (id, status) => {
    await updateDoc(doc(db, "bookings", id), { status })
    fetchAll()
  }

  /* ---------------- FILTERS ---------------- */
  const pending = bookings.filter(b => b.status === "pending")
  const approved = bookings.filter(b => b.status === "approved")

  const getReportForBooking = bookingId =>
    reports.find(r => r.bookingId === bookingId)

  return (
    <div className="space-y-6">

      {/* ================= STATS ================= */}
      <div className="grid grid-cols-3 gap-4">
        <div className="card">
          Pending Requests {pending.length}
        </div>
        <div className="card">
          Approved Events {approved.length}
        </div>
        <div className="card">
          Reports Submitted {reports.length}
        </div>
      </div>

      {/* ================= CALENDAR ================= */}
      <div className="bg-slate-900 p-4 rounded-xl">
        <h2 className="mb-2 text-blue-400">Event Calendar</h2>

        <Calendar
          tileContent={({ date }) => {
            const match = approved.find(
              b =>
                new Date(b.date).toDateString() ===
                date.toDateString()
            )

            return match ? (
              <div className="mt-1 text-xs text-green-400">
                {match.room}
              </div>
            ) : null
          }}
        />
      </div>

      {/* ================= APPROVALS ================= */}
      <div className="bg-slate-900 p-4 rounded-xl">
        <h2 className="text-yellow-400 mb-2">
          Booking Approvals
        </h2>

        {pending.length === 0 && (
          <p className="text-gray-400">
            No pending requests
          </p>
        )}

        {pending.map(b => (
          <div
            key={b.id}
            className="flex justify-between items-center mt-3 p-3 bg-gray-800 rounded-lg"
          >
            <div>
              <p className="font-semibold text-white">
                {b.title || "Untitled Event"}
              </p>
              <p className="text-sm text-gray-400">
                {b.clubName} • {b.room} • {b.date}
              </p>
            </div>

            <div>
              <button
                onClick={() => updateStatus(b.id, "approved")}
                className="bg-green-500 px-3 py-1 mr-2 rounded text-black"
              >
                Approve
              </button>

              <button
                onClick={() => updateStatus(b.id, "rejected")}
                className="bg-red-500 px-3 py-1 rounded text-black"
              >
                Reject
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* ================= REPORTS ================= */}
      <div className="bg-slate-900 p-4 rounded-xl">
        <h2 className="text-blue-400 mb-2">
          Event Reports
        </h2>

        {approved.length === 0 && (
          <p className="text-gray-400">
            No approved events
          </p>
        )}

        {approved.map(b => {
          const report = getReportForBooking(b.id)

          return (
            <div
              key={b.id}
              className="mt-3 p-3 bg-gray-800 rounded-lg flex justify-between items-center"
            >
              <div>
                <p className="font-semibold text-white">
                  {b.title}
                </p>
                <p className="text-sm text-gray-400">
                  {b.clubName} • {b.room}
                </p>
              </div>

              {report ? (
                <a
                  href={report.fileUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-green-400 underline text-sm"
                >
                  View PDF
                </a>
              ) : (
                <span className="text-yellow-400 text-sm">
                  Awaiting report
                </span>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
