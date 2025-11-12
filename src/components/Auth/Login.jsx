import React, { useState } from 'react'
import { signInWithEmailAndPassword } from 'firebase/auth'
import { auth } from '../../firebase'
import { useNavigate } from 'react-router-dom'

export default function Login(){
  const [email, setEmail] = useState('')
  const [pass, setPass] = useState('')
  const [err, setErr] = useState(null)
  const nav = useNavigate()

  const submit = async (e) => {
    e.preventDefault()
    try {
      await signInWithEmailAndPassword(auth, email, pass)
      // Auth listener in App.jsx handles redirect
    } catch (error) {
      setErr(error.message)
    }
  }

  return (
    <div className="max-w-md mx-auto card">
      <h2 className="text-2xl font-bold mb-4">Sign in</h2>
      <form onSubmit={submit} className="flex flex-col gap-3">
        <input
          required
          className="p-2 rounded"
          placeholder="Email"
          value={email}
          onChange={e => setEmail(e.target.value)}
        />
        <input
          required
          className="p-2 rounded"
          placeholder="Password"
          type="password"
          value={pass}
          onChange={e => setPass(e.target.value)}
        />
        {err && <div className="text-red-400">{err}</div>}
        <div className="flex gap-2">
          <button className="btn-primary" type="submit">Sign in</button>
          <button
            type="button"
            className="px-4 py-2 rounded border"
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

