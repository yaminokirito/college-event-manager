import { useEffect, useState } from "react";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "../firebase";
import UploadReport from "../Reports/UploadReport";

export default function ClubDashboard({ user }) {
  const [bookings, setBookings] = useState([]);

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    const q = query(
      collection(db, "bookings"),
      where("clubId", "==", user.uid)
    );

    const snapshot = await getDocs(q);
    setBookings(snapshot.docs.map(d => ({
      id: d.id,
      ...d.data()
    })));
  };

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-green-400">
        My Room Bookings
      </h2>

      {bookings.length === 0 && (
        <p className="text-gray-400">No bookings yet</p>
      )}

      {bookings.map(b => (
        <div key={b.id} className="card">
          <p><strong>Room:</strong> {b.room}</p>
          <p><strong>Date:</strong> {b.date}</p>
          <p><strong>Status:</strong> {b.status}</p>

          {/* ✅ Upload only when approved */}
          {b.status === "approved" && (
            <UploadReport booking={b} user={user} />
          )}
        </div>
      ))}
    </div>
  );
}
