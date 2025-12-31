import { useState } from "react"
import { storage, db } from "../../firebase"
import { ref, uploadBytes, getDownloadURL } from "firebase/storage"
import { addDoc, collection, serverTimestamp } from "firebase/firestore"

export default function UploadReport({ booking, user }) {
  const [file, setFile] = useState(null)
  const [loading, setLoading] = useState(false)

  const uploadReport = async () => {
    if (!file) return alert("Select a PDF file")

    setLoading(true)

    try {
      const fileRef = ref(
        storage,
        `reports/${booking.id}_${file.name}`
      )

      await uploadBytes(fileRef, file)
      const downloadURL = await getDownloadURL(fileRef)

      await addDoc(collection(db, "reports"), {
        bookingId: booking.id,
        eventName: booking.eventName,
        clubName: booking.clubName,
        fileUrl: downloadURL,
        uploadedBy: user.uid,
        createdAt: serverTimestamp(),
      })

      alert("Report uploaded successfully")
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
