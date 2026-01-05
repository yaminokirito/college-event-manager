import { useState } from "react"
import { db } from "../../firebase"
import { addDoc, collection, serverTimestamp } from "firebase/firestore"

export default function UploadReport({ booking, user }) {
  const [file, setFile] = useState(null)
  const [loading, setLoading] = useState(false)

  const uploadReport = async () => {
    if (!file) {
      alert("Select a PDF file")
      return
    }

    if (file.type !== "application/pdf") {
      alert("Only PDF files are allowed")
      return
    }

    setLoading(true)

    try {
      const formData = new FormData()
      formData.append("file", file)
      formData.append("upload_preset", "eventmanagement")
      formData.append("resource_type", "raw")
      formData.append("content_type", "application/pdf")

      const res = await fetch(
        "https://api.cloudinary.com/v1_1/dtnsos9cm/auto/upload",
        {
          method: "POST",
          body: formData,
        }
      )

      const data = await res.json()
      console.log("Cloudinary response:", data)

      if (!res.ok || !data.secure_url) {
        throw new Error(data.error?.message || "Cloudinary upload failed")
      }

      await addDoc(collection(db, "reports"), {
        bookingId: booking.id,
        eventName: booking.eventName || booking.title || "Unknown Event",
        clubName: booking.clubName || user.email || "Unknown Club",
        pdfUrl: data.secure_url,
        uploadedBy: user.uid,
        createdAt: serverTimestamp(),
        status: "submitted",
      })

      alert("Report uploaded successfully")
      setFile(null)
    } catch (err) {
      console.error("UPLOAD ERROR:", err)
      alert(err.message)
    }

    setLoading(false)
  }

  return (
    <div className="bg-slate-900 p-4 rounded-lg mt-3">
      <p className="text-sm text-green-400 mb-2">
        Upload Event Report (PDF only)
      </p>

      <input
        type="file"
        accept="application/pdf"
        onChange={(e) => setFile(e.target.files[0])}
        className="text-sm text-white"
      />

      <button
        onClick={uploadReport}
        disabled={loading}
        className="ml-3 bg-green-500 px-3 py-1 rounded text-black text-sm"
      >
        {loading ? "Uploading..." : "Upload"}
      </button>
    </div>
  )
}
