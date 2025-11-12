import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import EventCalendar from '../Calendar/EventCalendar';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../../firebase';

export default function StudentDashboard() {
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [announcements, setAnnouncements] = useState([]);

  useEffect(() => {
    // ✅ Fetch upcoming events from Firestore (if your events collection exists)
    const fetchEvents = async () => {
      try {
        const today = new Date();
        const eventsRef = collection(db, 'events');
        const q = query(eventsRef, where('date', '>=', today.toISOString()));
        const snapshot = await getDocs(q);
        const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setUpcomingEvents(data);
      } catch (err) {
        console.error('Error loading events:', err);
      }
    };

    // ✅ Fetch announcements (optional)
    const fetchAnnouncements = async () => {
      try {
        const annRef = collection(db, 'announcements');
        const snapshot = await getDocs(annRef);
        const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setAnnouncements(data);
      } catch (err) {
        console.error('Error loading announcements:', err);
      }
    };

    fetchEvents();
    fetchAnnouncements();
  }, []);

  return (
    <motion.div
      className="grid grid-cols-1 lg:grid-cols-2 gap-6"
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Calendar Card */}
      <motion.div
        className="p-6 rounded-2xl bg-gradient-to-b from-gray-800 to-gray-900 shadow-lg"
        whileHover={{ scale: 1.02 }}
        transition={{ type: 'spring', stiffness: 200 }}
      >
        <h3 className="text-2xl font-semibold mb-4 text-green-400">Event Calendar</h3>
        <EventCalendar showRegister />
      </motion.div>

      {/* Upcoming Events */}
      <motion.div
        className="p-6 rounded-2xl bg-gradient-to-b from-gray-800 to-gray-900 shadow-lg overflow-y-auto"
        whileHover={{ scale: 1.02 }}
        transition={{ type: 'spring', stiffness: 200 }}
      >
        <h3 className="text-2xl font-semibold mb-4 text-green-400">Upcoming Events</h3>
        {upcomingEvents.length === 0 ? (
          <p className="text-gray-400 italic">No upcoming events found.</p>
        ) : (
          <ul className="space-y-3">
            {upcomingEvents.map((e) => (
              <motion.li
                key={e.id}
                className="p-4 rounded-lg bg-gray-700 hover:bg-gray-600 transition-colors"
                whileHover={{ scale: 1.03 }}
              >
                <h4 className="font-semibold text-lg text-white">{e.name}</h4>
                <p className="text-sm text-gray-300">{new Date(e.date).toLocaleString()}</p>
                <p className="text-gray-400 text-sm">{e.description}</p>
              </motion.li>
            ))}
          </ul>
        )}
      </motion.div>

      {/* Announcements */}
      <motion.div
        className="lg:col-span-2 p-6 rounded-2xl bg-gradient-to-b from-gray-800 to-gray-900 shadow-lg"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        <h3 className="text-2xl font-semibold mb-4 text-green-400">Announcements</h3>
        {announcements.length === 0 ? (
          <p className="text-gray-400 italic">No announcements available.</p>
        ) : (
          <ul className="space-y-3">
            {announcements.map((a) => (
              <motion.li
                key={a.id}
                className="p-4 rounded-lg bg-gray-700 hover:bg-gray-600 transition"
                whileHover={{ scale: 1.02 }}
              >
                <h4 className="font-semibold text-lg text-white">{a.title}</h4>
                <p className="text-gray-400">{a.message}</p>
              </motion.li>
            ))}
          </ul>
        )}
      </motion.div>
    </motion.div>
  );
}
