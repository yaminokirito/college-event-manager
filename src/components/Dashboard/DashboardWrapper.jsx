import React from "react";
import { motion } from "framer-motion";
import StudentDashboard from "../Student/StudentDashboard";
import TeacherDashboard from "../Teacher/TeacherDashboard";
import ClubDashboard from "../Club/ClubDashboard";

const roleMeta = {
  student: {
    title: "Student Dashboard",
    subtitle: "Browse events and register seamlessly",
    accent: "from-blue-500 to-cyan-400",
  },
  teacher: {
    title: "Teacher Dashboard",
    subtitle: "Manage rooms, approvals, and schedules",
    accent: "from-purple-500 to-pink-400",
  },
  club: {
    title: "Club Dashboard",
    subtitle: "Request rooms and manage your events",
    accent: "from-green-500 to-emerald-400",
  },
};

const DashboardWrapper = ({ role }) => {
  const getDashboard = () => {
    switch (role) {
      case "student":
        return <StudentDashboard />;
      case "teacher":
        return <TeacherDashboard />;
      case "club":
        return <ClubDashboard />;
      default:
        return (
          <div className="text-center text-gray-400 p-10">
            No dashboard available for this role.
          </div>
        );
    }
  };

  const meta = roleMeta[role];

  return (
    <motion.div
      className="min-h-screen bg-gradient-to-b from-gray-900 via-black to-black text-white"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
    >
      {/* Header */}
      {meta && (
        <motion.div
          className="px-6 pt-10 pb-8 max-w-7xl mx-auto"
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
        >
          <h1 className="text-3xl md:text-4xl font-bold mb-2">
            {meta.title}
          </h1>
          <p className="text-gray-400">{meta.subtitle}</p>

          {/* Accent line */}
          <div
            className={`mt-4 h-1 w-32 rounded-full bg-gradient-to-r ${meta.accent}`}
          />
        </motion.div>
      )}

      {/* Main Content */}
      <motion.div
        className="max-w-7xl mx-auto px-6 pb-16"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        <div className="rounded-3xl bg-white/5 backdrop-blur border border-white/10 shadow-xl p-6 md:p-8">
          {getDashboard()}
        </div>
      </motion.div>
    </motion.div>
  );
};

export default DashboardWrapper;
