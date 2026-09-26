"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const initial = {
  name: "",
  phone: "",
  idLast4: "",
  criminalRecordStatus: "clear",
  recordDate: "",
  healthCertificate: false,
  notes: "",
};

export default function AddWorkerPage() {
  const [form, setForm] = useState(initial);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  async function submit(e) {
    e.preventDefault();
    setError("");
    if (!form.name || !form.phone || !form.idLast4) return;
    setSaving(true);
    const res = await fetch("/api/workers", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, recordDate: form.recordDate || null }),
    });
    setSaving(false);
    if (!res.ok) {
      const data = await res.json();
      setError(data.error || "Something went wrong.");
      return;
    }
    const data = await res.json();
    router.push(`/registry/${data.worker.id}`);
  }

  return (
    <div className="card pad">
      <h3 style={{ marginBottom: 14 }}>Add a worker to the registry</h3>
      <form onSubmit={submit}>
        <div className="row2">
          <div className="field">
            <label htmlFor="w-name">Full name</label>
            <input
              id="w-name"
              required
              placeholder="e.g. Uwase Claudine"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
          </div>
          <div className="field">
            <label htmlFor="w-phone">Phone number</label>
            <input
              id="w-phone"
              required
              placeholder="07XX XXX XXX"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
            />
          </div>
        </div>

        <div className="row2">
          <div className="field">
            <label htmlFor="w-id">National ID (last 4 digits)</label>
            <input
              id="w-id"
              required
              maxLength={4}
              pattern="[0-9]{4}"
              placeholder="1234"
              value={form.idLast4}
              onChange={(e) => setForm({ ...form, idLast4: e.target.value })}
            />
          </div>
          <div className="field">
            <label htmlFor="w-status">Criminal record status</label>
            <select
              id="w-status"
              value={form.criminalRecordStatus}
              onChange={(e) => setForm({ ...form, criminalRecordStatus: e.target.value })}
            >
              <option value="clear">Clear</option>
              <option value="pending">Pending (Irembo request submitted)</option>
              <option value="flagged">Flagged</option>
            </select>
          </div>
        </div>

        <div className="row2">
          <div className="field">
            <label htmlFor="w-recorddate">Record checked on</label>
            <input
              id="w-recorddate"
              type="date"
              value={form.recordDate}
              onChange={(e) => setForm({ ...form, recordDate: e.target.value })}
            />
          </div>
          <div className="field" style={{ justifyContent: "center" }}>
            <label className="checkline">
              <input
                type="checkbox"
                checked={form.healthCertificate}
                onChange={(e) => setForm({ ...form, healthCertificate: e.target.checked })}
              />
              Health certificate on file
            </label>
          </div>
        </div>

        <div className="field">
          <label htmlFor="w-notes">Notes from initial verification</label>
          <textarea
            id="w-notes"
            placeholder="How she was found, who vouched for her, anything worth recording…"
            value={form.notes}
            onChange={(e) => setForm({ ...form, notes: e.target.value })}
          />
        </div>

        {error && <div className="error">{error}</div>}

        <button className="primary" type="submit" disabled={saving}>
          {saving ? "Saving…" : "Add to registry"}
        </button>
      </form>
    </div>
  );
}
