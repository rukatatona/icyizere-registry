import { NextResponse } from "next/server";
import { countExampleWorkers, createWorker, createPlacement } from "../../../lib/db";

// One-time helper: visiting this URL in a browser loads the two example
// records into whatever database is currently connected. Safe to call more
// than once — it checks first and does nothing if they're already there.
export async function GET() {
  const existing = await countExampleWorkers();
  if (existing > 0) {
    return NextResponse.json({ status: "already seeded", exampleWorkers: existing });
  }

  const w1 = await createWorker({
    name: "Example: Uwase Claudine",
    phone: "0788 000 111",
    idLast4: "0142",
    criminalRecordStatus: "clear",
    recordDate: "2026-06-02",
    healthCertificate: true,
    notes: "Sample record — shows what a clean, fully-verified file looks like.",
    isExample: true,
  });

  await createPlacement({
    workerId: w1.id,
    household: "Example Household — the Nzeyimana family",
    startDate: "2024-03-01",
    endDate: "2025-11-15",
    endReason: "Left for a higher-paying position (family confirmed, no issues)",
    familyNotes: "Reliable, great with the children, sorry to see her go.",
  });

  await createPlacement({
    workerId: w1.id,
    household: "Example Household — the Uwimana family",
    startDate: "2025-11-20",
    endDate: null,
    endReason: "",
    familyNotes: "Current placement.",
  });

  await createWorker({
    name: "Example: Mukamana Immaculee",
    phone: "0722 000 222",
    idLast4: "0987",
    criminalRecordStatus: "pending",
    recordDate: null,
    healthCertificate: false,
    notes: "Sample record — Irembo criminal record request submitted, awaiting result.",
    isExample: true,
  });

  return NextResponse.json({ status: "seeded" });
}
