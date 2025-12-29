import React, { useState } from "react"
import { addDoc, collection, serverTimestamp } from "firebase/firestore"
import { db } from "../../firebase"

export default function UploadReport({ booking, user }) {
  const [summary, setSummary] = useState("")
  const [uploading, setUploading] = useState(false)

  async function submitReport(e) {
    e.preventDefault()
    if (!summary.trim()) {
      alert("Summary is required")
      return
    }

    try {
      setUploading(true)

      await addDoc(collection(db, "reports"), {
        bookingId: booking.id,
        clubId: user.uid,
        title: booking.title || "Untitled Event",
        room: booking.room,
        date: booking.date,
        summary,
        createdAt: serverTimestamp(),
      })

      alert("Report uploaded successfully")
      setSummary("")
    } catch (err) {
      console.error(err)
      alert("Upload failed")
    } finally {
      setUploading(false)
    }
  }

  return (
    <form onSubmit={submitReport} className="mt-3 w-full">
      <textarea
        value={summary}
        onChange={(e) => setSummary(e.target.value)}
        placeholder="Event summary / report"
        rows={3}
        className="w-full p-2 rounded bg-gray-800 text-white border border-gray-600"
      />

      <button
        type="submit"
        disabled={uploading}
        className="mt-2 px-3 py-1 rounded bg-purple-500 text-black font-semibold"
      >
        {uploading ? "Uploading..." : "Upload Report"}
      </button>
    </form>
  )
}
