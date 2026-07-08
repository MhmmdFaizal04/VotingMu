import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getPollsByUser } from "@/lib/queries/polls";
import { getVotesByUser } from "@/lib/queries/votes";
import ProfileClient from "./ProfileClient";

export const revalidate = 0;

export default async function ProfilePage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const [myPolls, myVotes] = await Promise.all([
    getPollsByUser(session.user.id),
    getVotesByUser(session.user.id),
  ]);

  return (
    <ProfileClient
      user={{ id: session.user.id, name: session.user.name ?? "", email: session.user.email ?? "" }}
      myPolls={myPolls}
      myVotes={myVotes}
    />
  );
}
