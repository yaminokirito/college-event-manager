// src/components/Auth/Register.jsx
import React, { useState } from 'react'
import { createUserWithEmailAndPassword } from 'firebase/auth'
import { auth, db } from '../../firebase'
import { doc, setDoc } from 'firebase/firestore'
import { useNavigate } from 'react-router-dom'

export default function Register() {
  const [email, setEmail] = useState('')
  const [pass, setPass] = useState('')
  const [role, setRole] = useState('student')
  const [clubName, setClubName] = useState('')
  const [loading, setLoading] = useState(false)

  const nav = useNavigate()

  const submit = async (e) => {
    e.preventDefault()
    setLoading(true)

    // 🔒 Validation: club must enter club name
    if (role === 'club' && clubName.trim() === '') {
      alert('Please enter club name')
      setLoading(false)
      return
    }

    try {
      const cred = await createUserWithEmailAndPassword(auth, email, pass)

      await setDoc(doc(db, 'users', cred.user.uid), {
        email,
        role,
        club_name: role === 'club' ? clubName : null,
        createdAt: new Date(),
      })

      alert('Registration successful!')
      nav('/')
    } catch (err) {
      alert(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-md mx-auto card mt-20">
      <h2 className="text-2xl font-bold mb-4 text-green-400">
        Create Account
      </h2>

      <form onSubmit={submit} className="flex flex-col gap-4">
        <input
          required
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          required
          type="password"
          placeholder="Password"
          value={pass}
          onChange={(e) => setPass(e.target.value)}
        />

        <select
          value={role}
          onChange={(e) => setRole(e.target.value)}
        >
          <option value="student">Student</option>
          <option value="club">Club Lead</option>
          <option value="teacher">Teacher</option>
        </select>

        {/* 👇 CLUB NAME FIELD (ONLY FOR CLUBS) */}
        {role === 'club' && (
          <input
            required
            placeholder="Club Name"
            value={clubName}
            onChange={(e) => setClubName(e.target.value)}
          />
        )}

        <button type="submit" className="btn-primary" disabled={loading}>
          {loading ? 'Creating account...' : 'Create account'}
        </button>
      </form>
    </div>
  )
}

console.log("Register loaded")
