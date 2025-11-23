// src/components/Auth/Login.jsx
import React, { useState } from 'react'
import { signInWithEmailAndPassword } from 'firebase/auth'
import { auth } from '../../firebase'
import { useNavigate } from 'react-router-dom'

export default function Login() {
  const [email, setEmail] = useState('')
  const [pass, setPass] = useState('')
  const [err, setErr] = useState(null)
  const nav = useNavigate()

  const submit = async (e) => {
    e.preventDefault()
    try {
      await signInWithEmailAndPassword(auth, email, pass)
      // Redirect handled in App.jsx
    } catch (error) {
      setErr(error.message)
    }
  }

  return (
    <div className="max-w-md mx-auto card mt-20">
      <h2 className="text-2xl font-bold mb-4 text-green-400">Sign in</h2>

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

        {err && <div className="text-red-400 text-sm">{err}</div>}

        <div className="flex gap-3 mt-3">
          <button type="submit" className="btn-primary w-full">
            Sign in
          </button>

          <button
            type="button"
            className="px-4 py-2 w-full rounded border border-gray-500 hover:bg-gray-700 transition"
            onClick={() => nav('/register')}
          >
            Register
          </button>
        </div>
      </form>
    </div>
  )
}

console.log("Login loaded");
