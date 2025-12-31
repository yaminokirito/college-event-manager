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
    fetchData()
  }, [])

  const fetchData = async () => {
    const bookingSnap = await getDocs(collection(db, "bookings"))
    setBookings(
      bookingSnap.docs.map((d) => ({
        id: d.id,
        ...d.data(),
      }))
    )

    const reportSnap = await getDocs(collection(db, "reports"))
    setReports(
      reportSnap.docs.map((d) => ({
        id: d.id,
        ...d.data(),
      }))
    )
  }

  const updateStatus = async (id, status) => {
    await updateDoc(doc(db, "bookings", id), { status })
    fetchData()
  }

  const pending = bookings.filter(b => b.status === "pending")
  const approved = bookings.filter(b => b.status === "approved")

  return (
    <div className="space-y-6">

      {/* STATS */}
      <div className="grid grid-cols-3 gap-4">
        <div className="card">Pending Requests {pending.length}</div>
        <div className="card">Approved Events {approved.length}</div>
        <div className="card">Reports Submitted {reports.length}</div>
      </div>

      {/* CALENDAR */}
      <div className="bg-slate-900 p-4 rounded-xl">
        <h2 className="mb-2 text-blue-400">Event Calendar</h2>
        <Calendar />
      </div>

      {/* APPROVALS */}
      <div className="bg-slate-900 p-4 rounded-xl">
        <h2 className="text-yellow-400 mb-2">Booking Approvals</h2>

        {pending.length === 0 && (
          <p className="text-gray-400">No pending requests</p>
        )}

        {pending.map(b => (
          <div key={b.id} className="flex justify-between mt-2">
            <span>{b.eventName}</span>
            <div>
              <button
                onClick={() => updateStatus(b.id, "approved")}
                className="bg-green-500 px-3 py-1 mr-2 rounded"
              >
                Approve
              </button>
              <button
                onClick={() => updateStatus(b.id, "rejected")}
                className="bg-red-500 px-3 py-1 rounded"
              >
                Reject
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* REPORTS */}
      <div className="bg-slate-900 p-4 rounded-xl">
        <h2 className="text-blue-400 mb-2">Event Reports</h2>

        {reports.length === 0 && (
          <p className="text-gray-400">No reports submitted</p>
        )}

        {reports.map(r => (
          <div key={r.id} className="mt-2">
            <p>{r.eventName} — {r.clubName}</p>
            <a
              href={r.fileUrl}
              target="_blank"
              className="text-green-400 underline"
            >
              View PDF
            </a>
          </div>
        ))}
      </div>
    </div>
  )
}
