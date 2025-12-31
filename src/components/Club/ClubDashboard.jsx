import React, { useEffect, useState } from "react"
import { motion } from "framer-motion"
import BookingForm from "../Booking/BookingForm"
import EventCalendar from "../Calendar/EventCalendar"
import UploadReport from "../Reports/UploadReport"

import {
  collection,
  query,
  where,
  getDocs,
  doc,
  updateDoc,
} from "firebase/firestore"
import { db } from "../../firebase"

export default function ClubDashboard({ user }) {
  const [tab, setTab] = useState("approved")
  const [bookings, setBookings] = useState([])
  const [reports, setReports] = useState([])
  const [loading, setLoading] = useState(false)

  /* ---------------- LOAD DATA ---------------- */
  useEffect(() => {
    if (!user) return
    fetchBookings()
    fetchReports()
  }, [tab, user])

  const fetchBookings = async () => {
    try {
      setLoading(true)

      const q = query(
        collection(db, "bookings"),
        where("clubId", "==", user.uid),
        where("status", "==", tab)
      )

      const snap = await getDocs(q)
      setBookings(
        snap.docs.map(d => ({
          id: d.id,
          ...d.data(),
        }))
      )
    } catch (err) {
      console.error("Bookings fetch error:", err)
    } finally {
      setLoading(false)
    }
  }

  const fetchReports = async () => {
    try {
      const q = query(
        collection(db, "reports"),
        where("uploadedBy", "==", user.uid)
      )
      const snap = await getDocs(q)
      setReports(
        snap.docs.map(d => ({
          id: d.id,
          ...d.data(),
        }))
      )
    } catch (err) {
      console.error("Reports fetch error:", err)
    }
  }

  /* ---------------- REGISTRATION LINK ---------------- */
  const setRegistrationLink = async (bookingId, currentLink) => {
    const val = window.prompt(
      "Enter registration URL (leave blank to remove)",
      currentLink || ""
    )
    if (val === null) return

    await updateDoc(doc(db, "bookings", bookingId), {
      registrationLink: val || null,
    })

    fetchBookings()
  }

  /* ---------------- FIND REPORT ---------------- */
  const getReportForBooking = bookingId =>
    reports.find(r => r.bookingId === bookingId)

  return (
    <motion.div
      className="grid grid-cols-1 lg:grid-cols-2 gap-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      {/* ================= ROOM REQUEST ================= */}
      <div className="card">
        <h3 className="text-xl font-semibold text-blue-400 mb-3">
          Request a Room
        </h3>
        <BookingForm user={user} />
      </div>

      {/* ================= CALENDAR ================= */}
      <div className="card">
        <h3 className="text-xl font-semibold text-blue-400 mb-3">
          Event Calendar
        </h3>
        <EventCalendar />
      </div>

      {/* ================= BOOKINGS ================= */}
      <div className="lg:col-span-2 card">
        <div className="flex justify-between mb-4">
          <h3 className="text-xl font-semibold text-blue-400">
            Your Bookings
          </h3>

          <div className="flex gap-2">
            {["pending", "approved", "rejected"].map(t => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`px-3 py-1 rounded ${
                  tab === t
                    ? "bg-green-500 text-black"
                    : "bg-gray-700 text-gray-300"
                }`}
              >
                {t.toUpperCase()}
              </button>
            ))}
          </div>
        </div>

        {loading && <p className="text-gray-400">Loading...</p>}

        {!loading && bookings.length === 0 && (
          <p className="text-gray-400 italic">
            No {tab} bookings
          </p>
        )}

        <ul className="space-y-4">
          {bookings.map(b => {
            const report = getReportForBooking(b.id)

            return (
              <li key={b.id} className="bg-gray-700 p-4 rounded-lg space-y-3">
                {/* EVENT INFO */}
                <div className="flex justify-between">
                  <div>
                    <p className="font-semibold text-white">
                      {b.title}
                    </p>
                    <p className="text-sm text-gray-300">
                      {b.room} •{" "}
                      {new Date(b.date).toLocaleDateString()}
                    </p>
                    <p className="text-sm text-gray-400">
                      {b.start} – {b.end}
                    </p>
                  </div>

                  {/* REGISTRATION */}
                  {tab === "approved" && (
                    <div className="text-right">
                      {b.registrationLink ? (
                        <a
                          href={b.registrationLink}
                          target="_blank"
                          rel="noreferrer"
                          className="btn-primary block mb-1"
                        >
                          Open Link
                        </a>
                      ) : (
                        <p className="text-xs text-gray-400">
                          No registration link
                        </p>
                      )}

                      <button
                        onClick={() =>
                          setRegistrationLink(
                            b.id,
                            b.registrationLink
                          )
                        }
                        className="text-sm text-blue-400 underline"
                      >
                        {b.registrationLink
                          ? "Edit Link"
                          : "Add Link"}
                      </button>
                    </div>
                  )}
                </div>

                {/* ================= REPORT ================= */}
                {b.status === "approved" && (
                  <>
                    {report ? (
                      <div className="bg-slate-900 p-3 rounded flex justify-between items-center">
                        <span className="text-green-400 text-sm">
                          ✔ Report Uploaded
                        </span>
                        <a
                          href={report.fileUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="text-blue-400 underline text-sm"
                        >
                          View PDF
                        </a>
                      </div>
                    ) : (
                      <UploadReport booking={b} user={user} />
                    )}
                  </>
                )}
              </li>
            )
          })}
        </ul>
      </div>
    </motion.div>
  )
}
