"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";

function statusLabel(status) {
  if (status === "clear") return "Clear";
  if (status === "flagged") return "Flagged";
  return "Pending";
}

function fmtDate(d) {
  if (!d) return "—";
  const dt = new Date(d);
  if (isNaN(dt)) return d;
  return dt.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
}

export default function WorkerDetailPage() {
  const { id } = useParams();
  const [worker, setWorker] = useState(null);
  const [placements, setPlacements] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ household: "", startDate: "", endDate: "", endReason: "", familyNotes: "" });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  function load() {
    fetch(`/api/workers/${id}`)
      .then((r) => r.json())
      .then((data) => {
        setWorker(data.worker || null);
        setPlacements(data.placements || []);
      });
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  async function submitPlacement(e) {
    e.preventDefault();
    setError("");
    if (!form.household || !form.startDate) return;
    setSaving(true);
    const res = await fetch("/api/placements", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ workerId: id, ...form, endDate: form.endDate || null }),
    });
    setSaving(false);
    if (!res.ok) {
      const data = await res.json();
      setError(data.error || "Something went wrong.");
      return;
    }
    setForm({ household: "", startDate: "", endDate: "", endReason: "", familyNotes: "" });
    setShowForm(false);
    load();
  }

  if (!worker) return <div className="empty">Loading…</div>;

  return (
    <div className="card pad" style={{ display: "flex", flexDirection: "column", gap: 18 }}>
      <Link href="/registry" className="backlink">← All workers</Link>

      <div className="detail-head">
        <h2 style={{ fontSize: "1.3rem" }}>{worker.name}</h2>
        <span className={`pill ${worker.criminal_record_status}`}>
          {statusLabel(worker.criminal_record_status)}
        </span>
      </div>

      <div className="id-grid">
        <div>
          <div className="l">Phone</div>
          <div className="v">{worker.phone}</div>
        </div>
        <div>
          <div className="l">National ID</div>
          <div className="v">•••• {worker.id_last4}</div>
        </div>
        <div>
          <div className="l">Record checked</div>
          <div className="v">{fmtDate(worker.record_date)}</div>
        </div>
        <div>
          <div className="l">Health certificate</div>
          <div className="v">{worker.health_certificate ? "On file" : "Not on file"}</div>
        </div>
      </div>

      {worker.notes ? (
        <div>
          <div className="l" style={{ color: "var(--ink-faint)", fontSize: "0.72rem", textTransform: "uppercase", letterSpacing: ".05em", marginBottom: 4 }}>
            Verification notes
          </div>
          <div style={{ fontSize: "0.9rem", color: "var(--ink-dim)" }}>{worker.notes}</div>
        </div>
      ) : null}

      <div>
        <h3 style={{ fontSize: "1rem", marginBottom: 6 }}>Placement history</h3>
        <div className="timeline">
          {placements.length === 0 && <div className="empty">No placements recorded yet.</div>}
          {placements.map((p) => (
            <div key={p.id} className={`tl-item${!p.end_date ? " open" : ""}`}>
              <div className="tl-dot" />
              <div className="tl-body">
                <div className="tl-top">
                  <span className="tl-house">{p.household}</span>
                  <span className="tl-dates">
                    {fmtDate(p.start_date)} → {p.end_date ? fmtDate(p.end_date) : "present"}
                  </span>
                </div>
                {p.end_reason ? (
                  <div className="tl-reason">Ended: {p.end_reason}</div>
                ) : !p.end_date ? (
                  <div className="tl-reason">Current placement</div>
                ) : null}
                {p.family_notes ? <div className="tl-notes">&ldquo;{p.family_notes}&rdquo;</div> : null}
              </div>
            </div>
          ))}
        </div>
      </div>

      <button className="ghost" onClick={() => setShowForm((s) => !s)} type="button">
        {showForm ? "– Cancel" : "+ Add a placement"}
      </button>

      {showForm && (
        <form onSubmit={submitPlacement}>
          <div className="row2">
            <div className="field">
              <label>Household</label>
              <input
                required
                placeholder="Family / household name"
                value={form.household}
                onChange={(e) => setForm({ ...form, household: e.target.value })}
              />
            </div>
            <div className="field">
              <label>Start date</label>
              <input
                type="date"
                required
                value={form.startDate}
                onChange={(e) => setForm({ ...form, startDate: e.target.value })}
              />
            </div>
          </div>
          <div className="row2">
            <div className="field">
              <label>End date (leave blank if current)</label>
              <input
                type="date"
                value={form.endDate}
                onChange={(e) => setForm({ ...form, endDate: e.target.value })}
              />
            </div>
            <div className="field">
              <label>Reason placement ended</label>
              <input
                placeholder="e.g. moved for higher pay, family relocated"
                value={form.endReason}
                onChange={(e) => setForm({ ...form, endReason: e.target.value })}
              />
            </div>
          </div>
          <div className="field">
            <label>What the family said</label>
            <textarea
              placeholder="Direct reference notes from the household"
              value={form.familyNotes}
              onChange={(e) => setForm({ ...form, familyNotes: e.target.value })}
            />
          </div>
          {error && <div className="error">{error}</div>}
          <button className="primary" type="submit" disabled={saving}>
            {saving ? "Saving…" : "Save placement"}
          </button>
        </form>
      )}
    </div>
  );
}
