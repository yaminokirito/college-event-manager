// src/components/Club/ClubDashboard.jsx
import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import BookingForm from '../Booking/BookingForm';
import EventCalendar from '../Calendar/EventCalendar';
import { collection, query, where, getDocs, doc, updateDoc } from 'firebase/firestore';
import { db } from '../../firebase';

export default function ClubDashboard({ user }) {
  const [rooms] = useState(['Auditorium', 'Room A', 'Room B', 'Lab 1']);
  const [tab, setTab] = useState('approved'); // default show approved
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchBookings();
  }, [tab, user]);

  async function fetchBookings() {
    if (!user) {
      setBookings([]);
      return;
    }
    try {
      setLoading(true);
      const q = query(
        collection(db, 'bookings'),
        where('clubId', '==', user.uid),
        where('status', '==', tab)
      );
      const s = await getDocs(q);
      const data = s.docs.map(d => ({ id: d.id, ...d.data() }));
      setBookings(data);
    } catch (err) {
      console.error('Error fetching bookings:', err);
    } finally {
      setLoading(false);
    }
  }

  async function setRegistrationLink(bookingId, currentLink) {
    const val = window.prompt('Enter registration URL (leave blank to remove):', currentLink || '');
    if (val === null) return;
    try {
      const ref = doc(db, 'bookings', bookingId);
      await updateDoc(ref, { registrationLink: val || null });
      fetchBookings();
      alert('Saved.');
    } catch (err) {
      console.error(err);
      alert('Save failed: ' + err.message);
    }
  }

  return (
    <motion.div
      className="grid grid-cols-1 lg:grid-cols-2 gap-6"
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Left: Request form */}
      <motion.div className="p-6 rounded-2xl bg-gradient-to-b from-gray-800 to-gray-900 shadow-lg">
        <h3 className="text-2xl font-semibold mb-4 text-blue-400">Request a Room</h3>
        <BookingForm rooms={rooms} user={user} />
      </motion.div>

      {/* Right: Calendar (attach popover) */}
      <motion.div className="p-6 rounded-2xl bg-gradient-to-b from-gray-800 to-gray-900 shadow-lg">
        <h3 className="text-2xl font-semibold mb-4 text-blue-400">Event Calendar</h3>
        <EventCalendar user={user} />
      </motion.div>

      {/* Bottom full width: Tabs + bookings list */}
      <motion.div className="lg:col-span-2 p-6 rounded-2xl bg-gradient-to-b from-gray-800 to-gray-900 shadow-lg">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-2xl font-semibold text-blue-400">Your Bookings</h3>
          <div className="flex gap-2">
            {['pending', 'approved', 'rejected'].map(t => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`px-3 py-1 rounded ${tab === t ? 'bg-green-600 text-black' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}
              >
                {t.charAt(0).toUpperCase() + t.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="text-gray-400">Loading...</div>
        ) : bookings.length === 0 ? (
          <div className="text-gray-400 italic">No {tab} bookings.</div>
        ) : (
          <ul className="space-y-3">
            {bookings.map(b => (
              <li key={b.id} className="p-4 rounded-lg bg-gray-700 flex flex-col gap-2">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="font-semibold text-white">{b.title || 'Untitled'}</div>
                    <div className="text-sm text-gray-300">{b.room} • {new Date(b.date).toLocaleDateString()}</div>
                    <div className="text-sm text-gray-400">{b.start} - {b.end}</div>
                  </div>

                  <div className="flex flex-col items-end gap-2">
                    {b.registrationLink ? (
                      <>
                        <a
                          href={b.registrationLink}
                          target="_blank"
                          rel="noreferrer"
                          className="px-3 py-1 rounded bg-green-500 text-black font-semibold"
                        >
                          Open link
                        </a>
                        <button
                          onClick={() => navigator.clipboard?.writeText(b.registrationLink)}
                          className="text-xs text-gray-300 underline"
                        >
                          Copy link
                        </button>
                      </>
                    ) : (
                      <div className="text-xs text-gray-400 italic">No registration link</div>
                    )}

                    {/* allow club to add/edit link only for approved bookings (and for any status if you want) */}
                    {tab === 'approved' && (
                      <button
                        onClick={() => setRegistrationLink(b.id, b.registrationLink)}
                        className="text-sm px-3 py-1 rounded bg-blue-500 text-white"
                      >
                        {b.registrationLink ? 'Edit link' : 'Add link'}
                      </button>
                    )}
                  </div>
                </div>

                {/* show purpose/notes */}
                {b.purpose && <div className="text-sm text-gray-300">{b.purpose}</div>}
              </li>
            ))}
          </ul>
        )}
      </motion.div>
    </motion.div>
  );
}
