import { NextResponse } from "next/server";
import { createPlacement, getWorker } from "../../../lib/db";

export async function POST(request) {
  const body = await request.json();

  if (!body.workerId || !body.household || !body.startDate) {
    return NextResponse.json(
      { error: "workerId, household, and startDate are required." },
      { status: 400 }
    );
  }

  const worker = await getWorker(body.workerId);
  if (!worker) {
    return NextResponse.json({ error: "Worker not found." }, { status: 404 });
  }

  const placement = await createPlacement(body);
  return NextResponse.json({ placement }, { status: 201 });
}
