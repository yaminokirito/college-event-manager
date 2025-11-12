import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { signOut } from 'firebase/auth'
import { auth } from '../../firebase'

export default function Navbar({user, role}){
  const nav = useNavigate()
  return (
    <nav className="flex items-center justify-between p-4">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-black font-bold">CE</div>
        <div className="text-xl font-semibold">College Event Manager</div>
      </div>
      <div className="flex gap-4 items-center">
        <Link to="/" className="">Home</Link>
        {user ? (
          <>
            {role==='club' && <Link to="/club">Club</Link>}
            {role==='teacher' && <Link to="/teacher">Teacher</Link>}
            {role==='student' && <Link to="/student">Student</Link>}
            <button className="btn-primary" onClick={()=>{signOut(auth); nav('/')}}>Sign out</button>
          </>
        ) : (
          <Link to="/" className="btn-primary">Sign in</Link>
        )}
      </div>
    </nav>
  )
}
