import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { listActivePolls, createPoll } from "@/lib/queries/polls";

const createSchema = z.object({
  title: z.string().min(3).max(200),
  description: z.string().max(500).default(""),
  showResultsBeforeVote: z.boolean().default(false),
  expiresAt: z.string().nullable().default(null),
  options: z.array(z.string().min(1).max(200)).min(2).max(10),
});

export async function GET() {
  try {
    const polls = await listActivePolls();
    return NextResponse.json(polls);
  } catch {
    return NextResponse.json({ error: "Gagal memuat daftar polling" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const parsed = createSchema.safeParse(body);
    if (!parsed.success) {
      const firstError = parsed.error.flatten().fieldErrors;
      const msg = Object.values(firstError).flat()[0] ?? "Input tidak valid";
      return NextResponse.json({ error: msg }, { status: 400 });
    }

    const { title, description, showResultsBeforeVote, expiresAt, options } = parsed.data;
    const pollId = await createPoll({
      title,
      description,
      createdBy: session.user.id,
      showResultsBeforeVote,
      expiresAt,
      options,
    });

    return NextResponse.json({ id: pollId }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Gagal membuat polling" }, { status: 500 });
  }
}
