import React from "react"
import { motion } from "framer-motion"

import EventReports from "./EventReports"
// later you can add:
// import BookingApprovals from "./BookingApprovals"

export default function TeacherDashboard({ user }) {
  return (
    <motion.div
      className="min-h-screen grid grid-cols-1 gap-6"
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* HEADER */}
      <div className="p-6 rounded-2xl bg-gradient-to-b from-gray-800 to-gray-900 shadow-lg">
        <h1 className="text-3xl font-bold text-green-400">
          Teacher Dashboard
        </h1>
        <p className="text-gray-400 mt-1">
          Approve bookings, review club activity, and verify reports
        </p>
      </div>

      {/* QUICK OVERVIEW (PLACEHOLDER – OPTIONAL) */}
      <motion.div
        className="grid grid-cols-1 md:grid-cols-3 gap-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.15 }}
      >
        <div className="p-4 rounded-xl bg-gray-800 text-center">
          <div className="text-2xl font-bold text-blue-400">—</div>
          <div className="text-sm text-gray-400">Pending Requests</div>
        </div>

        <div className="p-4 rounded-xl bg-gray-800 text-center">
          <div className="text-2xl font-bold text-green-400">—</div>
          <div className="text-sm text-gray-400">Approved Events</div>
        </div>

        <div className="p-4 rounded-xl bg-gray-800 text-center">
          <div className="text-2xl font-bold text-purple-400">—</div>
          <div className="text-sm text-gray-400">Reports Submitted</div>
        </div>
      </motion.div>

      {/* EVENT REPORTS */}
      <motion.div
        className="p-6 rounded-2xl bg-gradient-to-b from-gray-800 to-gray-900 shadow-lg"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.25 }}
      >
        <h2 className="text-xl font-semibold mb-4 text-blue-400">
          Event Reports
        </h2>

        <EventReports />
      </motion.div>

      {/* FUTURE: BOOKING APPROVALS */}
      <motion.div
        className="p-6 rounded-2xl bg-gradient-to-b from-gray-800 to-gray-900 shadow-lg opacity-60"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.35 }}
      >
        <h2 className="text-xl font-semibold mb-2 text-yellow-400">
          Booking Approvals
        </h2>
        <p className="text-sm text-gray-400 italic">
          (Approval panel can be added here later)
        </p>

        {/* <BookingApprovals /> */}
      </motion.div>
    </motion.div>
  )
}
