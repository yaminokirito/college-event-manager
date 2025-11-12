import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import BookingForm from '../Booking/BookingForm';
import EventCalendar from '../Calendar/EventCalendar';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../firebase';

export default function ClubDashboard({ user }) {
  const [rooms, setRooms] = useState(['Auditorium', 'Room A', 'Room B', 'Lab 1']);
  const [bookings, setBookings] = useState([]);

  useEffect(() => {
    const fetchBookings = async () => {
      if (!user) return;
      try {
        const q = query(collection(db, 'bookings'), where('clubId', '==', user.uid));
        const snapshot = await getDocs(q);
        const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setBookings(data);
      } catch (err) {
        console.error('Error fetching bookings:', err);
      }
    };
    fetchBookings();
  }, [user]);

  return (
    <motion.div
      className="grid grid-cols-1 lg:grid-cols-2 gap-6"
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Room Booking Form */}
      <motion.div
        className="p-6 rounded-2xl bg-gradient-to-b from-gray-800 to-gray-900 shadow-lg"
        whileHover={{ scale: 1.02 }}
        transition={{ type: 'spring', stiffness: 200 }}
      >
        <h3 className="text-2xl font-semibold mb-4 text-blue-400">Request a Room</h3>
        <BookingForm rooms={rooms} user={user} />
      </motion.div>

      {/* Calendar */}
      <motion.div
        className="p-6 rounded-2xl bg-gradient-to-b from-gray-800 to-gray-900 shadow-lg"
        whileHover={{ scale: 1.02 }}
        transition={{ type: 'spring', stiffness: 200 }}
      >
        <h3 className="text-2xl font-semibold mb-4 text-blue-400">Event Calendar</h3>
        <EventCalendar />
      </motion.div>

      {/* Club’s Approved Bookings */}
      <motion.div
        className="lg:col-span-2 p-6 rounded-2xl bg-gradient-to-b from-gray-800 to-gray-900 shadow-lg"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        <h3 className="text-2xl font-semibold mb-4 text-blue-400">Your Approved Bookings</h3>
        {bookings.length === 0 ? (
          <p className="text-gray-400 italic">No approved bookings yet.</p>
        ) : (
          <ul className="space-y-3">
            {bookings.map((b) => (
              <motion.li
                key={b.id}
                className="p-4 rounded-lg bg-gray-700 hover:bg-gray-600 transition-colors"
                whileHover={{ scale: 1.03 }}
              >
                <h4 className="font-semibold text-lg text-white">{b.room}</h4>
                <p className="text-sm text-gray-300">
                  {new Date(b.date).toLocaleDateString()} — {b.timeSlot}
                </p>
                <p className="text-gray-400 text-sm">{b.purpose}</p>
              </motion.li>
            ))}
          </ul>
        )}
      </motion.div>
    </motion.div>
  );
}
