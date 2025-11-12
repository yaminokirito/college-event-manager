import React, { useEffect, useState } from 'react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import Login from './components/Auth/Login';
import Register from './components/Auth/Register';
import Navbar from './components/Layout/Navbar';
import ClubDashboard from './components/Club/ClubDashboard';
import TeacherDashboard from './components/Teacher/TeacherDashboard';
import StudentDashboard from './components/Student/StudentDashboard';
import { onAuthStateChanged } from 'firebase/auth';
import { auth, db } from './firebase';
import { doc, getDoc } from 'firebase/firestore';

export default function App() {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      if (u) {
        setUser(u);
        const userDoc = await getDoc(doc(db, 'users', u.uid));
        if (userDoc.exists()) {
          const userRole = userDoc.data().role;
          setRole(userRole);

          // ✅ Automatically navigate to dashboard after login
          if (userRole === 'student') navigate('/student');
          else if (userRole === 'teacher') navigate('/teacher');
          else if (userRole === 'club') navigate('/club');
        }
      } else {
        setUser(null);
        setRole(null);

        // ✅ Only redirect to "/" if not already on login/register
        if (location.pathname !== '/' && location.pathname !== '/register') {
          navigate('/');
        }
      }
    });

    return () => unsub();
  }, [navigate, location.pathname]);

  // Animation wrapper for smooth page transitions
  const PageTransition = ({ children }) => (
    <motion.div
      key={location.pathname}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className="min-h-[80vh]"
    >
      {children}
    </motion.div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white">
      <Navbar user={user} role={role} />

      <main className="p-6">
        <AnimatePresence mode="wait">
          <Routes location={location} key={location.pathname}>
            {/* Public routes */}
            <Route path="/" element={<PageTransition><Login /></PageTransition>} />
            <Route path="/register" element={<PageTransition><Register /></PageTransition>} />

            {/* Protected routes */}
            <Route
              path="/club"
              element={<PageTransition><ClubDashboard user={user} role={role} /></PageTransition>}
            />
            <Route
              path="/teacher"
              element={<PageTransition><TeacherDashboard user={user} role={role} /></PageTransition>}
            />
            <Route
              path="/student"
              element={<PageTransition><StudentDashboard user={user} role={role} /></PageTransition>}
            />
          </Routes>
        </AnimatePresence>
      </main>
    </div>
  );
}
