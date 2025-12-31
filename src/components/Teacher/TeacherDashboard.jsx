import { useEffect, useState } from "react";
import { collection, getDocs, updateDoc, doc } from "firebase/firestore";
import { db } from "../firebase";

export default function TeacherDashboard() {
  const [bookings, setBookings] = useState([]);

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    const snapshot = await getDocs(collection(db, "bookings"));
    const data = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    setBookings(data);
  };

  const approveBooking = async (id) => {
    await updateDoc(doc(db, "bookings", id), {
      status: "approved"
    });
    fetchBookings();
  };

  const rejectBooking = async (id) => {
    await updateDoc(doc(db, "bookings", id), {
      status: "rejected"
    });
    fetchBookings();
  };

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-green-400">
        Room Booking Requests
      </h2>

      {bookings.length === 0 && (
        <p className="text-gray-400">No booking requests</p>
      )}

      {bookings.map(b => (
        <div key={b.id} className="card">
          <p><strong>Club:</strong> {b.clubName}</p>
          <p><strong>Room:</strong> {b.room}</p>
          <p><strong>Date:</strong> {b.date}</p>
          <p><strong>Status:</strong> {b.status}</p>

          {b.status === "pending" && (
            <div className="flex gap-3 mt-3">
              <button
                className="btn-primary"
                onClick={() => approveBooking(b.id)}
              >
                Approve
              </button>

              <button
                className="btn-danger"
                onClick={() => rejectBooking(b.id)}
              >
                Reject
              </button>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
