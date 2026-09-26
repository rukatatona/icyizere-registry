import Database from "better-sqlite3";
import path from "path";
import fs from "fs";

const dataDir = path.join(process.cwd(), "data");
if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });

const dbPath = path.join(dataDir, "registry.db");

// Reuse a single connection across hot reloads in dev.
const globalForDb = globalThis;
export const db = globalForDb.__icyizereDb || new Database(dbPath);
if (process.env.NODE_ENV !== "production") globalForDb.__icyizereDb = db;

db.pragma("journal_mode = WAL");

db.exec(`
  CREATE TABLE IF NOT EXISTS workers (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    phone TEXT NOT NULL,
    id_last4 TEXT NOT NULL,
    criminal_record_status TEXT NOT NULL DEFAULT 'pending',
    record_date TEXT,
    health_certificate INTEGER NOT NULL DEFAULT 0,
    notes TEXT,
    is_example INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS placements (
    id TEXT PRIMARY KEY,
    worker_id TEXT NOT NULL REFERENCES workers(id) ON DELETE CASCADE,
    household TEXT NOT NULL,
    start_date TEXT NOT NULL,
    end_date TEXT,
    end_reason TEXT,
    family_notes TEXT,
    created_at TEXT NOT NULL
  );

  CREATE INDEX IF NOT EXISTS idx_placements_worker ON placements(worker_id);
`);

function newId(prefix) {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

export function listWorkers() {
  return db.prepare("SELECT * FROM workers ORDER BY name COLLATE NOCASE").all();
}

export function getWorker(id) {
  return db.prepare("SELECT * FROM workers WHERE id = ?").get(id);
}

export function createWorker(w) {
  const id = newId("w");
  db.prepare(
    `INSERT INTO workers (id, name, phone, id_last4, criminal_record_status, record_date, health_certificate, notes, is_example, created_at)
     VALUES (@id, @name, @phone, @idLast4, @criminalRecordStatus, @recordDate, @healthCertificate, @notes, @isExample, @createdAt)`
  ).run({
    id,
    name: w.name,
    phone: w.phone,
    idLast4: w.idLast4,
    criminalRecordStatus: w.criminalRecordStatus || "pending",
    recordDate: w.recordDate || null,
    healthCertificate: w.healthCertificate ? 1 : 0,
    notes: w.notes || "",
    isExample: w.isExample ? 1 : 0,
    createdAt: new Date().toISOString(),
  });
  return getWorker(id);
}

export function listPlacements(workerId) {
  return db
    .prepare("SELECT * FROM placements WHERE worker_id = ? ORDER BY start_date DESC")
    .all(workerId);
}

export function listAllPlacements() {
  return db.prepare("SELECT * FROM placements").all();
}

export function createPlacement(p) {
  const id = newId("p");
  db.prepare(
    `INSERT INTO placements (id, worker_id, household, start_date, end_date, end_reason, family_notes, created_at)
     VALUES (@id, @workerId, @household, @startDate, @endDate, @endReason, @familyNotes, @createdAt)`
  ).run({
    id,
    workerId: p.workerId,
    household: p.household,
    startDate: p.startDate,
    endDate: p.endDate || null,
    endReason: p.endReason || "",
    familyNotes: p.familyNotes || "",
    createdAt: new Date().toISOString(),
  });
  return db.prepare("SELECT * FROM placements WHERE id = ?").get(id);
}
