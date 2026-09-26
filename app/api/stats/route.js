import { NextResponse } from "next/server";
import { listWorkers, listAllPlacements } from "../../../lib/db";

export async function GET() {
  const workers = await listWorkers();
  const placements = await listAllPlacements();

  const stats = {
    total: workers.length,
    active: placements.filter((p) => !p.end_date).length,
    clear: workers.filter((w) => w.criminal_record_status === "clear").length,
    flagged: workers.filter((w) => w.criminal_record_status === "flagged").length,
  };

  return NextResponse.json({ stats });
}
