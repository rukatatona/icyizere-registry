import { listWorkers, listAllPlacements } from "../lib/db";

export const dynamic = "force-dynamic";

export default async function OverviewPage() {
  const workers = await listWorkers();
  const placements = await listAllPlacements();

  const stats = {
    total: workers.length,
    active: placements.filter((p) => !p.end_date).length,
    clear: workers.filter((w) => w.criminal_record_status === "clear").length,
    flagged: workers.filter((w) => w.criminal_record_status === "flagged").length,
  };

  return (
    <>
      <div className="stats">
        <div className="stat">
          <div className="n mono">{stats.total}</div>
          <div className="l">Workers on file</div>
        </div>
        <div className="stat">
          <div className="n mono">{stats.active}</div>
          <div className="l">Active placements</div>
        </div>
        <div className="stat">
          <div className="n mono">{stats.clear}</div>
          <div className="l">Clear record</div>
        </div>
        <div className="stat">
          <div className="n mono">{stats.flagged}</div>
          <div className="l">Flagged</div>
        </div>
      </div>

      <div className="card pad">
        <h3 style={{ marginBottom: 8 }}>How this works</h3>
        <p style={{ color: "var(--ink-dim)", margin: "0 0 8px" }}>
          A hiring family pays for a lookup on a worker already on file, or for a first-time
          verification if she isn&rsquo;t yet. Every time she changes households, the record
          grows: how long she stayed, why it ended, and what that family says.
        </p>
        <p className="note" style={{ margin: 0 }}>
          This is a working pilot. Records marked &ldquo;example&rdquo; under All Workers are
          placeholders to show the shape of a real file &mdash; not real people.
        </p>
      </div>
    </>
  );
}
