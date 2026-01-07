import React, { useEffect, useState } from "react"
import { db, storage } from "../../firebase"
import { collection, getDocs } from "firebase/firestore"
import { ref as storageRef, getDownloadURL } from "firebase/storage"

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

  async function openPdf(r) {
    try {
      if (!r?.pdfUrl) {
        alert("No PDF available for this report")
        return
      }

      let url = r.pdfUrl

      if (!/^https?:\/\//i.test(url)) {
        // assume it's a Firebase Storage path; request a download URL
        const ref = storageRef(storage, url)
        url = await getDownloadURL(ref)
      }

      window.open(url, "_blank", "noopener")
    } catch (err) {
      console.error("Unable to open PDF:", err)
      alert("Unable to open PDF")
    }
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

            <button
              onClick={() => openPdf(r)}
              className="px-3 py-1 bg-blue-500 text-black rounded"
            >
              View PDF
            </button>
          </div>
        ))
      )}
    </div>
  )
}
