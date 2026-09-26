"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

function statusLabel(status) {
  if (status === "clear") return "Clear";
  if (status === "flagged") return "Flagged";
  return "Pending";
}

export default function RegistryPage() {
  const [workers, setWorkers] = useState([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/workers")
      .then((r) => r.json())
      .then((data) => {
        setWorkers(data.workers || []);
        setLoading(false);
      });
  }, []);

  const filtered = workers
    .filter((w) => {
      const q = query.trim().toLowerCase();
      if (!q) return true;
      return w.name.toLowerCase().includes(q) || w.phone.includes(q);
    })
    .sort((a, b) => a.name.localeCompare(b.name));

  return (
    <>
      <div className="search">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="11" cy="11" r="7" />
          <path d="m21 21-4.3-4.3" />
        </svg>
        <input
          placeholder="Search by name or phone…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>

      <div className="card">
        {loading && <div className="empty">Loading…</div>}
        {!loading && filtered.length === 0 && <div className="empty">No workers match yet.</div>}
        {!loading &&
          filtered.map((w) => (
            <Link key={w.id} href={`/registry/${w.id}`} className="worker" style={{ color: "inherit" }}>
              <div className="worker-row">
                <span className="worker-name">{w.name}</span>
                <span className={`pill ${w.criminal_record_status}`}>
                  {statusLabel(w.criminal_record_status)}
                </span>
              </div>
              <div className="worker-meta">
                <span className="mono">ID •••{w.id_last4}</span>
                {w.is_example ? <span className="example-flag">example record</span> : null}
              </div>
            </Link>
          ))}
      </div>
    </>
  );
}
