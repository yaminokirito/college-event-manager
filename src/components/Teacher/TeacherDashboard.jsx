import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  updateDoc,
  runTransaction,
} from 'firebase/firestore';
import { db } from '../../firebase';
import EventCalendar from '../Calendar/EventCalendar';

export default function TeacherDashboard() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('pending'); // new tab state

  useEffect(() => {
    fetchBookings();
  }, [tab]);

  async function fetchBookings() {
    try {
      setLoading(true);
      const q = query(collection(db, 'bookings'), where('status', '==', tab));
      const s = await getDocs(q);
      setBookings(s.docs.map((d) => ({ id: d.id, ...d.data() })));
    } catch (err) {
      console.error('Error fetching bookings:', err);
    } finally {
      setLoading(false);
    }
  }

  async function approve(b) {
    try {
      await runTransaction(db, async (tx) => {
        const bookingsRef = collection(db, 'bookings');
        const snapshot = await getDocs(
          query(
            bookingsRef,
            where('status', '==', 'approved'),
            where('room', '==', b.room),
            where('date', '==', b.date)
          )
        );
        const overlap = snapshot.docs.some((docSnap) => {
          const data = docSnap.data();
          return !(b.end <= data.start || b.start >= data.end);
        });
        if (overlap) throw new Error('Slot already taken');
        const bookingRef = doc(db, 'bookings', b.id);
        tx.update(bookingRef, { status: 'approved', approvedAt: new Date() });
      });
      fetchBookings();
    } catch (err) {
      alert('Could not approve: ' + err.message);
    }
  }

  async function reject(b) {
    try {
      await updateDoc(doc(db, 'bookings', b.id), { status: 'rejected' });
      fetchBookings();
    } catch (err) {
      console.error('Error rejecting booking:', err);
    }
  }

  return (
    <motion.div
      className="grid grid-cols-1 lg:grid-cols-2 gap-6"
      initial={{ opacity: 0, y: 25 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Requests Section */}
      <motion.div
        className="p-6 rounded-2xl bg-gradient-to-b from-gray-800 to-gray-900 shadow-lg"
        whileHover={{ scale: 1.02 }}
        transition={{ type: 'spring', stiffness: 200 }}
      >
        <h3 className="text-2xl font-semibold mb-4 text-blue-400">Booking Requests</h3>

        {/* Tabs */}
        <div className="flex gap-3 mb-6">
          {['pending', 'approved', 'rejected'].map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                tab === t
                  ? 'bg-blue-500 text-white shadow-lg'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              {t.charAt(0).toUpperCase() + t.slice(1)}
            </button>
          ))}
        </div>

        {loading ? (
          <p className="text-gray-400 italic">Loading...</p>
        ) : bookings.length === 0 ? (
          <p className="text-gray-400 italic">No {tab} requests.</p>
        ) : (
          <div className="flex flex-col gap-3">
            {bookings.map((p) => (
              <motion.div
                key={p.id}
                className="p-4 rounded-lg bg-gray-700 hover:bg-gray-600 transition-all"
                whileHover={{ scale: 1.03 }}
              >
                <div className="font-semibold text-lg text-white">
                  {p.title || 'Untitled Event'} — {p.room}
                </div>
                <div className="text-sm text-gray-300">
                  {p.date} | {p.start} - {p.end}
                </div>

                {tab === 'pending' && (
                  <div className="flex gap-3 mt-3">
                    <button
                      className="px-4 py-1.5 rounded-lg bg-green-500 text-black font-semibold hover:bg-green-400"
                      onClick={() => approve(p)}
                    >
                      Approve
                    </button>
                    <button
                      className="px-4 py-1.5 rounded-lg border border-gray-400 text-gray-200 hover:bg-gray-600"
                      onClick={() => reject(p)}
                    >
                      Reject
                    </button>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        )}
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
    </motion.div>
  );
}
