import React, { useState } from "react";
import { storage, db } from "../../firebase";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { addDoc, serverTimestamp } from "firebase/firestore";
import { collection } from "firebase/firestore";

export default function UploadReport({ booking, user }) {
  const [file, setFile] = useState(null);
  const [msg, setMsg] = useState("");

  const upload = async () => {
    if (!file) return setMsg("Select a file");

    try {
      const storageRef = ref(
        storage,
        `reports/${user.uid}/${booking.id}.pdf`
      );

      await uploadBytes(storageRef, file);
      const url = await getDownloadURL(storageRef);

      await addDoc(collection(db, "eventReports"), {
        bookingId: booking.id,
        clubId: user.uid,
        clubName: booking.clubName,
        title: booking.title,
        reportUrl: url,
        uploadedAt: serverTimestamp(),
      });

      setMsg("Report uploaded successfully");
    } catch (err) {
      setMsg(err.message);
    }
  };

  return (
    <div className="bg-gray-700 p-4 rounded-lg">
      <input type="file" onChange={e => setFile(e.target.files[0])} />
      <button onClick={upload} className="btn-primary mt-2">
        Upload Report
      </button>
      {msg && <div className="text-sm mt-1">{msg}</div>}
    </div>
  );
}
