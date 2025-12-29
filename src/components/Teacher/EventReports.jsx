import React, { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../../firebase";

export default function EventReports() {
  const [reports, setReports] = useState([]);

  useEffect(() => {
    const fetch = async () => {
      const snap = await getDocs(collection(db, "eventReports"));
      setReports(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    };
    fetch();
  }, []);

  return (
    <div className="space-y-4">
      {reports.map(r => (
        <div key={r.id} className="bg-gray-800 p-4 rounded-xl">
          <div className="font-semibold">{r.title}</div>
          <div className="text-sm text-gray-400">{r.clubName}</div>
          <a
            href={r.reportUrl}
            target="_blank"
            rel="noreferrer"
            className="text-blue-400 underline"
          >
            View Report
          </a>
        </div>
      ))}
    </div>
  );
}
