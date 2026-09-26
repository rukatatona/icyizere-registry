import { NextResponse } from "next/server";
import { listWorkers, createWorker } from "../../../lib/db";

export async function GET() {
  const workers = await listWorkers();
  return NextResponse.json({ workers });
}

export async function POST(request) {
  const body = await request.json();

  if (!body.name || !body.phone || !body.idLast4) {
    return NextResponse.json(
      { error: "Name, phone, and the last 4 digits of the national ID are required." },
      { status: 400 }
    );
  }

  const worker = await createWorker(body);
  return NextResponse.json({ worker }, { status: 201 });
}
