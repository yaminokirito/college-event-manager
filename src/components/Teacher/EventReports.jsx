import React, { useEffect, useState } from "react"
import { db } from "../../firebase"
import { collection, getDocs, orderBy, query } from "firebase/firestore"

export default function EventReports() {
  const [reports, setReports] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadReports()
  }, [])

  async function loadReports() {
    try {
      const q = query(
        collection(db, "reports"),
        orderBy("createdAt", "desc")
      )

      const snap = await getDocs(q)

      const data = snap.docs.map(doc => {
        const report = {
          id: doc.id,
          ...doc.data(),
        }

        // 🔍 DEBUG: log pdfUrl from Firestore
        console.log("Fetched report:", report)
        console.log("PDF URL:", report.pdfUrl)

        return report
      })

      setReports(data)
    } catch (err) {
      console.error("Failed to load reports:", err)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <p className="text-gray-400 italic">Loading reports…</p>
  }

  return (
    <div className="space-y-4">
      {reports.length === 0 ? (
        <p className="text-gray-400 italic">No reports submitted</p>
      ) : (
        reports.map(r => {
          // 🔍 DEBUG during render
          console.log("Rendering report:", r.id, r.pdfUrl)

          return (
            <div
              key={r.id}
              className="p-4 bg-gray-700 rounded-lg flex justify-between items-center"
            >
              {/* LEFT INFO */}
              <div>
                <div className="font-semibold text-white">
                  {r.eventName || "Untitled Event"}
                </div>

                <div className="text-sm text-gray-300">
                  Club: {r.clubName || "Unknown"}
                </div>

                <div className="text-xs text-gray-400">
                  Uploaded on:{" "}
                  {r.createdAt?.toDate
                    ? r.createdAt.toDate().toLocaleString()
                    : "—"}
                </div>
              </div>

              {/* RIGHT ACTION */}
              {r.pdfUrl ? (
                <a
                  href={r.pdfUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1 bg-blue-500 hover:bg-blue-600 text-black rounded"
                >
                  View PDF
                </a>
              ) : (
                <span className="text-xs text-red-400 italic">
                  PDF missing
                </span>
              )}
            </div>
          )
        })
      )}
    </div>
  )
}
