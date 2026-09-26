// Data layer with two backends, picked automatically at runtime:
//  - Postgres, when POSTGRES_URL or DATABASE_URL is set (used on Vercel)
//  - SQLite (a local file), otherwise (used for local development)
// Every exported function is async and returns the same shape either way,
// so nothing above this file needs to know which backend is in use.

let pgPool = null;
let pgReady = null;
let sqliteDb = null;

function usePostgres() {
  return Boolean(process.env.POSTGRES_URL || process.env.DATABASE_URL);
}

async function getPg() {
  if (!pgPool) {
    const { Pool } = await import("pg");
    const connectionString = process.env.POSTGRES_URL || process.env.DATABASE_URL;
    pgPool = new Pool({
      connectionString,
      ssl: connectionString.includes("localhost") ? false : { rejectUnauthorized: false },
    });
  }
  if (!pgReady) {
    pgReady = pgPool.query(`
      CREATE TABLE IF NOT EXISTS workers (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        phone TEXT NOT NULL,
        id_last4 TEXT NOT NULL,
        criminal_record_status TEXT NOT NULL DEFAULT 'pending',
        record_date TEXT,
        health_certificate BOOLEAN NOT NULL DEFAULT false,
        notes TEXT,
        is_example BOOLEAN NOT NULL DEFAULT false,
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
  }
  await pgReady;
  return pgPool;
}

async function getSqlite() {
  if (sqliteDb) return sqliteDb;
  const { default: Database } = await import("better-sqlite3");
  const path = await import("path");
  const fs = await import("fs");

  const dataDir = path.join(process.cwd(), "data");
  if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
  const dbPath = path.join(dataDir, "registry.db");

  const globalForDb = globalThis;
  const database = globalForDb.__icyizereDb || new Database(dbPath);
  if (process.env.NODE_ENV !== "production") globalForDb.__icyizereDb = database;

  database.pragma("journal_mode = WAL");
  database.exec(`
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

  sqliteDb = database;
  return sqliteDb;
}

function newId(prefix) {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

export async function listWorkers() {
  if (usePostgres()) {
    const pool = await getPg();
    const { rows } = await pool.query("SELECT * FROM workers ORDER BY LOWER(name)");
    return rows;
  }
  const db = await getSqlite();
  return db.prepare("SELECT * FROM workers ORDER BY name COLLATE NOCASE").all();
}

export async function getWorker(id) {
  if (usePostgres()) {
    const pool = await getPg();
    const { rows } = await pool.query("SELECT * FROM workers WHERE id = $1", [id]);
    return rows[0] || null;
  }
  const db = await getSqlite();
  return db.prepare("SELECT * FROM workers WHERE id = ?").get(id) || null;
}

export async function createWorker(w) {
  const id = newId("w");
  const record = {
    id,
    name: w.name,
    phone: w.phone,
    idLast4: w.idLast4,
    criminalRecordStatus: w.criminalRecordStatus || "pending",
    recordDate: w.recordDate || null,
    healthCertificate: Boolean(w.healthCertificate),
    notes: w.notes || "",
    isExample: Boolean(w.isExample),
    createdAt: new Date().toISOString(),
  };

  if (usePostgres()) {
    const pool = await getPg();
    const { rows } = await pool.query(
      `INSERT INTO workers (id, name, phone, id_last4, criminal_record_status, record_date, health_certificate, notes, is_example, created_at)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) RETURNING *`,
      [
        record.id, record.name, record.phone, record.idLast4, record.criminalRecordStatus,
        record.recordDate, record.healthCertificate, record.notes, record.isExample, record.createdAt,
      ]
    );
    return rows[0];
  }

  const db = await getSqlite();
  db.prepare(
    `INSERT INTO workers (id, name, phone, id_last4, criminal_record_status, record_date, health_certificate, notes, is_example, created_at)
     VALUES (@id, @name, @phone, @idLast4, @criminalRecordStatus, @recordDate, @healthCertificate, @notes, @isExample, @createdAt)`
  ).run({ ...record, healthCertificate: record.healthCertificate ? 1 : 0, isExample: record.isExample ? 1 : 0 });
  return getWorker(id);
}

export async function listPlacements(workerId) {
  if (usePostgres()) {
    const pool = await getPg();
    const { rows } = await pool.query(
      "SELECT * FROM placements WHERE worker_id = $1 ORDER BY start_date DESC",
      [workerId]
    );
    return rows;
  }
  const db = await getSqlite();
  return db.prepare("SELECT * FROM placements WHERE worker_id = ? ORDER BY start_date DESC").all(workerId);
}

export async function listAllPlacements() {
  if (usePostgres()) {
    const pool = await getPg();
    const { rows } = await pool.query("SELECT * FROM placements");
    return rows;
  }
  const db = await getSqlite();
  return db.prepare("SELECT * FROM placements").all();
}

export async function createPlacement(p) {
  const id = newId("p");
  const record = {
    id,
    workerId: p.workerId,
    household: p.household,
    startDate: p.startDate,
    endDate: p.endDate || null,
    endReason: p.endReason || "",
    familyNotes: p.familyNotes || "",
    createdAt: new Date().toISOString(),
  };

  if (usePostgres()) {
    const pool = await getPg();
    const { rows } = await pool.query(
      `INSERT INTO placements (id, worker_id, household, start_date, end_date, end_reason, family_notes, created_at)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *`,
      [record.id, record.workerId, record.household, record.startDate, record.endDate, record.endReason, record.familyNotes, record.createdAt]
    );
    return rows[0];
  }

  const db = await getSqlite();
  db.prepare(
    `INSERT INTO placements (id, worker_id, household, start_date, end_date, end_reason, family_notes, created_at)
     VALUES (@id, @workerId, @household, @startDate, @endDate, @endReason, @familyNotes, @createdAt)`
  ).run(record);
  return db.prepare("SELECT * FROM placements WHERE id = ?").get(id);
}

export async function countExampleWorkers() {
  if (usePostgres()) {
    const pool = await getPg();
    const { rows } = await pool.query("SELECT COUNT(*)::int AS n FROM workers WHERE is_example = true");
    return rows[0].n;
  }
  const db = await getSqlite();
  return db.prepare("SELECT COUNT(*) AS n FROM workers WHERE is_example = 1").get().n;
}
