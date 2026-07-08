import { NextRequest, NextResponse } from "next/server";
import { getPollById } from "@/lib/queries/polls";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const poll = await getPollById(id);
    if (!poll) {
      return NextResponse.json({ error: "Polling tidak ditemukan" }, { status: 404 });
    }
    return NextResponse.json(poll);
  } catch {
    return NextResponse.json({ error: "Gagal memuat polling" }, { status: 500 });
  }
}
