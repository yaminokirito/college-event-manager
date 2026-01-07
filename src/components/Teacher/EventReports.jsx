import React, { useEffect, useState } from "react"
import { db } from "../../firebase"
import { collection, getDocs } from "firebase/firestore"

export default function EventReports() {
  const [reports, setReports] = useState([])

  useEffect(() => {
    loadReports()
  }, [])

  async function loadReports() {
    const snap = await getDocs(collection(db, "reports"))
    setReports(
      snap.docs.map(d => ({
        id: d.id,
        ...d.data(),
      }))
    )
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
                {r.eventName || "Untitled Event"}
              </div>

              <div className="text-sm text-gray-300">
                Club: {r.clubName}
              </div>

              <div className="text-xs text-gray-400">
                Uploaded on:{" "}
                {r.createdAt?.toDate
                  ? r.createdAt.toDate().toLocaleString()
                  : "—"}
              </div>
            </div>

            <a
  href={r.pdfUrl}
  target="_blank"
  rel="noreferrer"
  className="px-3 py-1 bg-blue-500 text-black rounded"
>
  View PDF
</a>
          </div>
        ))
      )}
    </div>
  )
}
