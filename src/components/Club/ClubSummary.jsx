import React, { useEffect, useState } from "react";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "../../firebase";

export default function ClubSummary({ user }) {
  const [stats, setStats] = useState({
    total: 0,
    approved: 0,
    pending: 0,
    rejected: 0,
  });

  useEffect(() => {
    if (!user) return;

    const fetchStats = async () => {
      const q = query(
        collection(db, "bookings"),
        where("clubId", "==", user.uid)
      );
      const snap = await getDocs(q);

      let total = 0, approved = 0, pending = 0, rejected = 0;

      snap.forEach(doc => {
        total++;
        const s = doc.data().status;
        if (s === "approved") approved++;
        if (s === "pending") pending++;
        if (s === "rejected") rejected++;
      });

      setStats({ total, approved, pending, rejected });
    };

    fetchStats();
  }, [user]);

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {Object.entries(stats).map(([key, val]) => (
        <div key={key} className="bg-gray-800 rounded-xl p-4 text-center">
          <div className="text-2xl font-bold text-green-400">{val}</div>
          <div className="text-sm uppercase text-gray-400">{key}</div>
        </div>
      ))}
    </div>
  );
}
