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

    setLoading(true)

    try {
      // 1️⃣ Upload to Cloudinary
      const formData = new FormData()
      formData.append("file", file)
      formData.append("upload_preset", "eventmanagement")

      const cloudinaryRes = await fetch(
  "https://api.cloudinary.com/v1_1/dtnsos9cm/raw/upload",
        {
          method: "POST",
          body: formData,
        }
      )

      const cloudinaryData = await cloudinaryRes.json()

      if (!cloudinaryData.secure_url) {
        console.error(cloudinaryData)
        alert("Cloudinary upload failed")
        setLoading(false)
        return
      }

      // 2️⃣ Save Cloudinary URL in Firestore
      await addDoc(collection(db, "reports"), {
        bookingId: booking.id,
        eventName: booking.eventName,
        clubName: booking.clubName,
        fileUrl: cloudinaryData.secure_url,
        uploadedBy: user.uid,
        createdAt: serverTimestamp(),
      })

      alert("Report uploaded successfully 🎉")
      setFile(null)
    } catch (err) {
      console.error(err)
      alert("Upload failed")
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
