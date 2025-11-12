import React, { useState } from 'react'
import { createUserWithEmailAndPassword } from 'firebase/auth'
import { auth, db } from '../../firebase'
import { doc, setDoc } from 'firebase/firestore'
import { useNavigate } from 'react-router-dom'

export default function Register(){
  const [email,setEmail]=useState('')
  const [pass,setPass]=useState('')
  const [role,setRole]=useState('student')
  const [loading, setLoading] = useState(false)
  const nav = useNavigate()

  const submit = async (e)=>{
    e.preventDefault() // ✅ stops refresh
    setLoading(true)
    try {
      const cred = await createUserWithEmailAndPassword(auth,email,pass)
      await setDoc(doc(db,'users',cred.user.uid), { email, role, createdAt: new Date() })
      alert('Registration successful!')
      nav('/') // redirect to login
    } catch(err) {
      console.error(err)
      alert(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-md mx-auto card">
      <h2 className="text-2xl font-bold mb-4">Register</h2>
      <form onSubmit={submit} className="flex flex-col gap-3">
        <input
          required
          className="p-2 rounded"
          placeholder="Email"
          value={email}
          onChange={e=>setEmail(e.target.value)}
        />
        <input
          required
          className="p-2 rounded"
          placeholder="Password"
          type="password"
          value={pass}
          onChange={e=>setPass(e.target.value)}
        />
        <select
          value={role}
          onChange={e=>setRole(e.target.value)}
          className="p-2 rounded"
        >
          <option value="student">Student</option>
          <option value="club">Club Lead</option>
          <option value="teacher">Teacher</option>
        </select>
        <button
          className="btn-primary"
          type="submit"
          disabled={loading}
        >
          {loading ? 'Creating account...' : 'Create account'}
        </button>
      </form>
    </div>
  )
}

console.log("Register loaded");
