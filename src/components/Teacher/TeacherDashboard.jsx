import { useEffect, useState } from "react"
import { db } from "../../firebase"
import {
  collection,
  getDocs,
  updateDoc,
  addDoc,
  doc,
} from "firebase/firestore"
import Calendar from "react-calendar"
import "react-calendar/dist/Calendar.css"

export default function TeacherDashboard() {
  const [bookings, setBookings] = useState([])
  const [reports, setReports] = useState([])
  const [rooms, setRooms] = useState([])

  const [roomName, setRoomName] = useState("")
  const [capacity, setCapacity] = useState("")
  const [addingRoom, setAddingRoom] = useState(false)

  const [selectedDate, setSelectedDate] = useState(null)

  useEffect(() => {
    fetchAll()
  }, [])

  /* ---------------- LOAD DATA ---------------- */
  async function fetchAll() {
    const bookingSnap = await getDocs(collection(db, "bookings"))
    const reportSnap = await getDocs(collection(db, "reports"))
    const roomSnap = await getDocs(collection(db, "rooms"))

    setBookings(
      bookingSnap.docs.map(d => ({ id: d.id, ...d.data() }))
    )
    setReports(
      reportSnap.docs.map(d => ({ id: d.id, ...d.data() }))
    )
    setRooms(
      roomSnap.docs.map(d => ({ id: d.id, ...d.data() }))
    )
  }

  /* ---------------- STATUS UPDATE ---------------- */
  async function updateStatus(id, status) {
    await updateDoc(doc(db, "bookings", id), { status })
    fetchAll()
  }

  /* ---------------- ADD ROOM ---------------- */
  async function addRoom(e) {
    e.preventDefault()

    if (!roomName || !capacity) {
      alert("Enter room name and capacity")
      return
    }

    try {
      setAddingRoom(true)
      await addDoc(collection(db, "rooms"), {
        name: roomName,
        capacity: Number(capacity),
      })
      setRoomName("")
      setCapacity("")
      fetchAll()
    } catch (err) {
      alert("Failed to add room: " + err.message)
    } finally {
      setAddingRoom(false)
    }
  }

  /* ---------------- FILTERS ---------------- */
  const pending = bookings.filter(b => b.status === "pending")
  const approved = bookings.filter(b => b.status === "approved")

  const getReportForBooking = bookingId =>
    reports.find(r => r.bookingId === bookingId)

  /* ---------------- CLUB SUMMARY ---------------- */
  const clubSummary = approved.reduce((acc, b) => {
    const club = b.clubName || "Unknown Club"
    acc[club] = (acc[club] || 0) + 1
    return acc
  }, {})

  return (
    <div className="space-y-6">

      {/* ================= STATS ================= */}
      <div className="grid grid-cols-3 gap-4">
        <div className="card">Pending Requests: {pending.length}</div>
        <div className="card">Approved Events: {approved.length}</div>
        <div className="card">Reports Submitted: {reports.length}</div>
      </div>

      {/* ================= ADD ROOM ================= */}
      <div className="bg-slate-900 p-4 rounded-xl">
        <h2 className="text-green-400 mb-2">Add Room</h2>

        <form onSubmit={addRoom} className="flex gap-2">
          <input
            placeholder="Room name"
            value={roomName}
            onChange={e => setRoomName(e.target.value)}
          />
          <input
            type="number"
            placeholder="Capacity"
            value={capacity}
            onChange={e => setCapacity(e.target.value)}
          />
          <button
            className="bg-green-500 px-4 rounded text-black"
            disabled={addingRoom}
          >
            {addingRoom ? "Adding..." : "Add"}
          </button>
        </form>
      </div>

      {/* ================= CALENDAR ================= */}
      <div className="bg-slate-900 p-4 rounded-xl">
        <h2 className="mb-2 text-blue-400">Event Calendar</h2>

        <Calendar
          onClickDay={date => setSelectedDate(date)}
          tileContent={({ date }) => {
            const match = approved.find(
              b =>
                new Date(b.date).toDateString() ===
                date.toDateString()
            )
            return match ? (
              <div className="text-xs text-green-400 mt-1">
                {match.room}
              </div>
            ) : null
          }}
        />

        {/* -------- CLICKED DATE DETAILS -------- */}
        {selectedDate && (
          <div className="mt-4 bg-gray-800 p-4 rounded-lg">
            <h3 className="text-blue-400 mb-2">
              Events on {selectedDate.toDateString()}
            </h3>

            {approved.filter(
              b =>
                new Date(b.date).toDateString() ===
                selectedDate.toDateString()
            ).length === 0 ? (
              <p className="text-gray-400">No events</p>
            ) : (
              approved
                .filter(
                  b =>
                    new Date(b.date).toDateString() ===
                    selectedDate.toDateString()
                )
                .map(b => (
                  <div
                    key={b.id}
                    className="mb-3 p-3 bg-slate-900 rounded"
                  >
                    <p className="font-semibold text-green-400">
                      {b.title}
                    </p>
                    <p className="text-sm text-gray-300">
                      ⏰ {b.start} – {b.end}
                    </p>
                    <p className="text-sm text-gray-400">
                      🏫 {b.room} • {b.clubName}
                    </p>
                  </div>
                ))
            )}
          </div>
        )}
      </div>

      {/* ================= APPROVALS ================= */}
      <div className="bg-slate-900 p-4 rounded-xl">
        <h2 className="text-yellow-400 mb-2">Booking Approvals</h2>

        {pending.length === 0 && (
          <p className="text-gray-400">No pending requests</p>
        )}

        {pending.map(b => (
          <div
            key={b.id}
            className="flex justify-between items-center mt-3 p-3 bg-gray-800 rounded-lg"
          >
            <div>
              <p className="font-semibold">{b.title}</p>
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

      {/* ================= APPROVED EVENTS ================= */}
      <div className="bg-slate-900 p-4 rounded-xl">
        <h2 className="text-blue-400 mb-2">Approved Events</h2>

        {approved.map(b => {
          const report = getReportForBooking(b.id)

          return (
            <div
              key={b.id}
              className="mt-3 p-3 bg-gray-800 rounded-lg flex justify-between items-center"
            >
              <div>
                <p className="font-semibold">{b.title}</p>
                <p className="text-sm text-gray-400">
                  {b.clubName} • {b.room}
                </p>
              </div>

              {report?.pdfUrl ? (
                <a
                  href={report.pdfUrl}
                  target="_blank"
                  rel="noopener noreferrer"
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

      {/* ================= CLUB SUMMARY ================= */}
      <div className="bg-slate-900 p-4 rounded-xl">
        <h2 className="text-purple-400 mb-3">
          Club Event Summary
        </h2>

        {Object.keys(clubSummary).length === 0 ? (
          <p className="text-gray-400">No events yet</p>
        ) : (
          <ul className="space-y-2">
            {Object.entries(clubSummary).map(([club, count]) => (
              <li
                key={club}
                className="flex justify-between bg-gray-800 p-3 rounded"
              >
                <span>{club}</span>
                <span className="font-semibold">
                  {count} events
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>

    </div>
  )
}
