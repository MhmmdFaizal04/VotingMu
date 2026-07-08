import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { closePoll } from "@/lib/queries/polls";

export async function PATCH(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: pollId } = await params;
    const closed = await closePoll(pollId, session.user.id);
    if (!closed) {
      return NextResponse.json(
        { error: "Polling tidak ditemukan atau kamu bukan pembuatnya" },
        { status: 403 }
      );
    }

    return NextResponse.json({ message: "Polling ditutup" });
  } catch {
    return NextResponse.json({ error: "Gagal menutup polling" }, { status: 500 });
  }
}
