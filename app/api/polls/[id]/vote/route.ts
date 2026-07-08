import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { castVote, getVoteCounts } from "@/lib/queries/votes";
import pusherServer from "@/lib/pusher";

const schema = z.object({
  optionId: z.string().uuid(),
});

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: pollId } = await params;
    const body = await req.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "optionId tidak valid" },
        { status: 400 }
      );
    }

    await castVote(session.user.id, pollId, parsed.data.optionId);

    // Fetch updated counts and broadcast via Pusher
    // Pusher trigger is fire-and-forget — a Pusher failure must NOT
    // cause a 500. The vote is already committed to the DB.
    const voteCounts = await getVoteCounts(pollId);
    const total = voteCounts.reduce((sum, o) => sum + o.vote_count, 0);

    const pusherConfigured =
      process.env.PUSHER_APP_ID &&
      process.env.PUSHER_KEY &&
      process.env.PUSHER_SECRET;

    if (pusherConfigured) {
      pusherServer
        .trigger(`poll-${pollId}`, "vote-update", { options: voteCounts, total })
        .catch((err: unknown) =>
          console.error("[Pusher] trigger failed:", err)
        );
    }

    return NextResponse.json({ options: voteCounts, total }, { status: 200 });
  } catch {
    return NextResponse.json({ error: "Gagal mengirim suara" }, { status: 500 });
  }
}
