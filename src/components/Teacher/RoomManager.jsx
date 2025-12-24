import React, { useEffect, useState } from 'react'
import {
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc,
  serverTimestamp
} from 'firebase/firestore'
import { db } from '../../firebase'
import { motion } from 'framer-motion'

export default function RoomManager() {
  const [rooms, setRooms] = useState([])
  const [name, setName] = useState('')
  const [capacity, setCapacity] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetchRooms()
  }, [])

  async function fetchRooms() {
    const snap = await getDocs(collection(db, 'rooms'))
    setRooms(snap.docs.map(d => ({ id: d.id, ...d.data() })))
  }

  async function addRoom(e) {
    e.preventDefault()
    if (!name || !capacity) return

    setLoading(true)
    try {
      await addDoc(collection(db, 'rooms'), {
        name,
        capacity: Number(capacity),
        createdAt: serverTimestamp()
      })
      setName('')
      setCapacity('')
      fetchRooms()
    } catch (err) {
      alert(err.message)
    } finally {
      setLoading(false)
    }
  }

  async function removeRoom(id) {
    if (!window.confirm('Delete this room?')) return
    await deleteDoc(doc(db, 'rooms', id))
    fetchRooms()
  }

  return (
    <motion.div
      className="p-6 rounded-2xl bg-gradient-to-b from-gray-800 to-gray-900 shadow-lg"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <h3 className="text-2xl font-semibold mb-4 text-green-400">
        Manage Rooms (Teacher Only)
      </h3>

      {/* Add Room */}
      <form onSubmit={addRoom} className="flex gap-3 mb-6">
        <input
          className="p-2 rounded bg-gray-700 text-white w-full"
          placeholder="Room name"
          value={name}
          onChange={e => setName(e.target.value)}
        />
        <input
          type="number"
          className="p-2 rounded bg-gray-700 text-white w-32"
          placeholder="Capacity"
          value={capacity}
          onChange={e => setCapacity(e.target.value)}
        />
        <button
          type="submit"
          className="px-4 py-2 bg-green-500 text-black font-semibold rounded-lg"
          disabled={loading}
        >
          Add
        </button>
      </form>

      {/* Room List */}
      {rooms.length === 0 ? (
        <p className="text-gray-400 italic">No rooms added yet.</p>
      ) : (
        <div className="flex flex-col gap-2">
          {rooms.map(r => (
            <div
              key={r.id}
              className="flex justify-between items-center bg-gray-700 p-3 rounded-lg"
            >
              <div>
                <div className="font-semibold">{r.name}</div>
                <div className="text-sm text-gray-300">
                  Capacity: {r.capacity}
                </div>
              </div>
              <button
                onClick={() => removeRoom(r.id)}
                className="text-red-400 hover:text-red-300 font-semibold"
              >
                Delete
              </button>
            </div>
          ))}
        </div>
      )}
    </motion.div>
  )
}
