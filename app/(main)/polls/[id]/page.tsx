import { notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import { getPollById } from "@/lib/queries/polls";
import { getUserVote } from "@/lib/queries/votes";
import PollDetailClient from "./PollDetailClient";

export const revalidate = 0;

export default async function PollDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [session, poll] = await Promise.all([auth(), getPollById(id)]);

  if (!poll) notFound();

  const userVoteId = session?.user?.id
    ? await getUserVote(session.user.id, id)
    : null;

  return (
    <PollDetailClient
      poll={poll}
      userVoteId={userVoteId}
      userId={session?.user?.id ?? ""}
    />
  );
}
