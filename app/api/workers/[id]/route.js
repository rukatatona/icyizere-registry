import { NextResponse } from "next/server";
import { getWorker, listPlacements } from "../../../../lib/db";

export async function GET(request, { params }) {
  const worker = await getWorker(params.id);
  if (!worker) {
    return NextResponse.json({ error: "Worker not found." }, { status: 404 });
  }
  const placements = await listPlacements(params.id);
  return NextResponse.json({ worker, placements });
}
