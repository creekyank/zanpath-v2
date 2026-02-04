import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function POST() {
  return NextResponse.json(
    { error: "Deprecated. Results are saved by /api/chat." },
    { status: 410 }
  );
}
