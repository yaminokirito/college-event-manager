// src/components/Calendar/EventCalendar.jsx
import React, { useEffect, useState, useRef } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { collection, query, where, getDocs, doc, updateDoc } from 'firebase/firestore';
import { db } from '../../firebase';

/**
 * Props:
 *  - showRegister (bool) : if true students see registration button in the popover
 *  - user (object) : current auth user object (optional) - needed to detect club owners for link editing
 */
export default function EventCalendar({ showRegister = false, user = null }) {
  const [events, setEvents] = useState([]); // FC event objects
  const [rawBookings, setRawBookings] = useState([]); // full booking docs
  const [popover, setPopover] = useState(null); // {x,y,dateStr,eventsForDay}
  const calendarRef = useRef(null);

  useEffect(() => {
    loadEvents();
  }, []);

  async function loadEvents() {
    try {
      const q = query(collection(db, 'bookings'), where('status', '==', 'approved'));
      const s = await getDocs(q);
      const docs = s.docs.map(d => ({ id: d.id, ...d.data() }));
      setRawBookings(docs);

      const ev = docs.map(d => {
        return {
          id: d.id,
          title: `${d.title} — ${d.room}`,
          start: `${d.date}T${d.start}`,
          end: `${d.date}T${d.end}`,
          extendedProps: { ...d }
        };
      });
      setEvents(ev);
    } catch (err) {
      console.error('Error loading events', err);
    }
  }

  // when user clicks a date cell: open popover attached to the click coordinates
  const handleDateClick = (info) => {
    // fullcalendar dateClick passes jsEvent
    const dateStr = info.dateStr;
    // find bookings on that date
    const eventsForDay = rawBookings.filter(b => b.date === dateStr);

    // find coordinates to attach the popup — prefer the clicked dom element rect
    const rect = info.dayEl ? info.dayEl.getBoundingClientRect() : { x: info.jsEvent.clientX, y: info.jsEvent.clientY, width: 0, height: 0 };
    const x = rect.x + rect.width / 2;
    const y = rect.y + rect.height / 2;

    setPopover({
      dateStr,
      eventsForDay,
      x: x + window.scrollX,
      y: y + window.scrollY
    });
  };

  // when user clicks an event within calendar itself (optional)
  const handleEventClick = (clickInfo) => {
    const ev = clickInfo.event;
    const dateStr = ev.startStr.split('T')[0];
    const eventsForDay = rawBookings.filter(b => b.date === dateStr);
    // anchor to mouse click
    setPopover({
      dateStr,
      eventsForDay,
      x: clickInfo.jsEvent.clientX + window.scrollX,
      y: clickInfo.jsEvent.clientY + window.scrollY
    });
  };

  // allow club owner to add/edit registration link from the popover
  const handleAddEditLink = async (bookingId, existingLink) => {
    const val = window.prompt('Set registration URL (leave empty to remove):', existingLink || '');
    if (val === null) return; // cancelled
    try {
      const ref = doc(db, 'bookings', bookingId);
      await updateDoc(ref, { registrationLink: val || null });
      // refresh events
      await loadEvents();
      // refresh popover data
      setPopover(prev => prev ? { ...prev, eventsForDay: rawBookings.filter(b => b.date === prev.dateStr) } : prev);
      alert('Saved registration link.');
    } catch (err) {
      console.error('Could not save link', err);
      alert('Could not save link: ' + err.message);
    }
  };

  return (
    <>
      <FullCalendar
        ref={calendarRef}
        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
        initialView="dayGridMonth"
        events={events}
        height="auto"
        dateClick={handleDateClick}
        eventClick={handleEventClick}
      />

      {/* Popover attached to clicked cell */}
      {popover && (
        <div
          style={{
            position: 'absolute',
            zIndex: 9999,
            left: popover.x,
            top: popover.y,
            transform: 'translate(-50%, 8px)',
            minWidth: 280,
          }}
        >
          <div className="bg-gray-800 text-white rounded-lg shadow-lg p-4">
            <div className="flex justify-between items-start">
              <div>
                <div className="text-sm text-gray-300">Events on</div>
                <div className="text-lg font-semibold">{new Date(popover.dateStr).toDateString()}</div>
              </div>
              <button
                className="text-gray-400 hover:text-white ml-2"
                onClick={() => setPopover(null)}
                aria-label="Close"
              >
                ✕
              </button>
            </div>

            <div className="mt-3 space-y-2 max-h-64 overflow-auto">
              {popover.eventsForDay.length === 0 ? (
                <div className="text-gray-400">No events that day.</div>
              ) : (
                popover.eventsForDay.map(ev => (
                  <div key={ev.id} className="p-2 rounded bg-gray-700">
                    <div className="flex justify-between">
                      <div>
                        <div className="font-semibold">{ev.title || ev.title}</div>
                        <div className="text-sm text-gray-300">{ev.start} — {ev.end}</div>
                        <div className="text-sm text-gray-400">{ev.room}</div>
                      </div>

                      {/* registration actions */}
                      <div className="flex flex-col items-end gap-2">
                        {ev.registrationLink ? (
                          <>
                            <a
                              className="text-sm px-2 py-1 rounded bg-green-600 text-black font-semibold"
                              href={ev.registrationLink}
                              target="_blank"
                              rel="noreferrer"
                            >
                              Register
                            </a>
                            <button
                              className="text-xs text-gray-300 underline"
                              onClick={() => navigator.clipboard?.writeText(ev.registrationLink)}
                              title="Copy registration link"
                            >
                              Copy link
                            </button>
                          </>
                        ) : (
                          <div className="text-xs text-gray-400 italic">No registration link</div>
                        )}

                        {/* Edit link only for club that created the booking */}
                        {user && user.uid === ev.clubId && (
                          <button
                            className="mt-1 text-xs px-2 py-1 rounded bg-blue-500 text-white"
                            onClick={() => handleAddEditLink(ev.id, ev.registrationLink)}
                          >
                            {ev.registrationLink ? 'Edit link' : 'Add link'}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
