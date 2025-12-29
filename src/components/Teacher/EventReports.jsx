import React, { useEffect, useState } from "react"
import { db } from "../../firebase"
import {
  collection,
  getDocs,
  updateDoc,
  doc,
} from "firebase/firestore"

export default function EventReports() {
  const [reports, setReports] = useState([])

  useEffect(() => {
    loadReports()
  }, [])

  async function loadReports() {
    const snap = await getDocs(collection(db, "eventReports"))
    setReports(snap.docs.map(d => ({ id: d.id, ...d.data() })))
  }

  async function markReviewed(id) {
    await updateDoc(doc(db, "eventReports", id), {
      status: "reviewed",
    })
    loadReports()
  }

  return (
    <div className="space-y-4">
      {reports.length === 0 ? (
        <p className="text-gray-400 italic">No reports submitted</p>
      ) : (
        reports.map(r => (
          <div
            key={r.id}
            className="p-4 bg-gray-700 rounded-lg flex justify-between items-center"
          >
            <div>
              <div className="font-semibold text-white">
                {r.title}
              </div>
              <div className="text-sm text-gray-300">
                Club: {r.clubName}
              </div>
              <div className="text-xs text-gray-400">
                Status: {r.status}
              </div>
            </div>

            <div className="flex gap-2">
              <a
                href={r.pdfUrl}
                target="_blank"
                rel="noreferrer"
                className="px-3 py-1 bg-blue-500 text-black rounded"
              >
                View PDF
              </a>

              {r.status !== "reviewed" && (
                <button
                  onClick={() => markReviewed(r.id)}
                  className="px-3 py-1 bg-green-500 text-black rounded"
                >
                  Mark Reviewed
                </button>
              )}
            </div>
          </div>
        ))
      )}
    </div>
  )
}
