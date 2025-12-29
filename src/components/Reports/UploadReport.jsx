import React, { useState } from "react"
import { storage, db } from "../../firebase"
import { ref, uploadBytes, getDownloadURL } from "firebase/storage"
import { addDoc, collection, serverTimestamp } from "firebase/firestore"

export default function UploadReport({ booking, user }) {
  const [file, setFile] = useState(null)
  const [uploading, setUploading] = useState(false)

  async function handleUpload() {
    if (!file) return alert("Select a PDF first")

    try {
      setUploading(true)

      const storageRef = ref(
        storage,
        `event-reports/${user.uid}/${booking.id}.pdf`
      )

      await uploadBytes(storageRef, file)
      const pdfUrl = await getDownloadURL(storageRef)

      await addDoc(collection(db, "eventReports"), {
        bookingId: booking.id,
        clubId: user.uid,
        clubName: user.displayName || "Club",
        title: booking.title,
        pdfUrl,
        uploadedAt: serverTimestamp(),
        status: "submitted",
      })

      alert("Report uploaded successfully")
      setFile(null)
    } catch (err) {
      console.error(err)
      alert("Upload failed")
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="mt-3 p-3 bg-gray-800 rounded-lg">
      <input
        type="file"
        accept="application/pdf"
        onChange={e => setFile(e.target.files[0])}
        className="text-sm text-gray-300"
      />

      <button
        onClick={handleUpload}
        disabled={uploading}
        className="mt-2 px-3 py-1 bg-purple-500 text-black rounded text-sm"
      >
        {uploading ? "Uploading..." : "Upload Report (PDF)"}
      </button>
    </div>
  )
}
