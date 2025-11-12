import React from "react";
import { motion } from "framer-motion";
import StudentDashboard from "../Student/StudentDashboard";
import TeacherDashboard from "../Teacher/TeacherDashboard";
import ClubDashboard from "../Club/ClubDashboard";

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
          <div className="text-white text-center p-10">
            <p>No dashboard available for this role.</p>
          </div>
        );
    }
  };

  return (
    <motion.div
      className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white p-6"
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
    >
      {getDashboard()}
    </motion.div>
  );
};

export default DashboardWrapper;
