"use client";

import { useState } from "react";
import Link from "next/link";
import { Poll } from "@/lib/queries/polls";
import { VoteRecord } from "@/lib/queries/votes";

interface ProfileClientProps {
  user: { id: string; name: string; email: string };
  myPolls: Poll[];
  myVotes: VoteRecord[];
}

export default function ProfileClient({ user, myPolls, myVotes }: ProfileClientProps) {
  const [tab, setTab] = useState<"polls" | "votes">("polls");
  const [closingId, setClosingId] = useState<string | null>(null);
  const [polls, setPolls] = useState<Poll[]>(myPolls);

  async function handleClose(pollId: string) {
    if (!confirm("Tutup polling ini?")) return;
    setClosingId(pollId);
    try {
      await fetch(`/api/polls/${pollId}/close`, { method: "PATCH" });
      setPolls((prev) =>
        prev.map((p) => (p.id === pollId ? { ...p, is_active: false } : p))
      );
    } finally {
      setClosingId(null);
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      {/* Profile card */}
      <div className="bg-white rounded-2xl border border-[#e9edef] p-6 mb-6">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-[#25d366] flex items-center justify-center text-white text-xl font-bold">
            {user.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <p className="text-lg font-bold text-[#111b21]">{user.name}</p>
            <p className="text-sm text-[#667781]">{user.email}</p>
          </div>
        </div>
        <div className="flex gap-6 mt-5 pt-5 border-t border-[#e9edef]">
          <div className="text-center">
            <p className="text-xl font-bold text-[#25d366]">{polls.length}</p>
            <p className="text-xs text-[#667781]">Polling Dibuat</p>
          </div>
          <div className="text-center">
            <p className="text-xl font-bold text-[#25d366]">{myVotes.length}</p>
            <p className="text-xs text-[#667781]">Suara Dikirim</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-white rounded-xl border border-[#e9edef] p-1 mb-5">
        <button
          onClick={() => setTab("polls")}
          className={`flex-1 py-2 rounded-lg text-sm font-semibold transition ${
            tab === "polls"
              ? "bg-[#25d366] text-white"
              : "text-[#667781] hover:text-[#111b21]"
          }`}
        >
          Polling Saya
        </button>
        <button
          onClick={() => setTab("votes")}
          className={`flex-1 py-2 rounded-lg text-sm font-semibold transition ${
            tab === "votes"
              ? "bg-[#25d366] text-white"
              : "text-[#667781] hover:text-[#111b21]"
          }`}
        >
          Riwayat Vote
        </button>
      </div>

      {/* Tab content */}
      {tab === "polls" && (
        <div className="space-y-3">
          {polls.length === 0 ? (
            <div className="text-center py-10 text-[#667781]">
              <p className="mb-2">Belum ada polling yang dibuat.</p>
              <Link href="/polls/create" className="text-[#25d366] font-semibold hover:underline">
                Buat polling pertama
              </Link>
            </div>
          ) : (
            polls.map((poll) => {
              const isExpired = poll.expires_at ? new Date(poll.expires_at) < new Date() : false;
              const closed = !poll.is_active || isExpired;
              return (
                <div key={poll.id} className="bg-white rounded-xl border border-[#e9edef] p-4 flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <Link href={`/polls/${poll.id}`} className="font-semibold text-[#111b21] hover:text-[#25d366] transition line-clamp-1">
                      {poll.title}
                    </Link>
                    <p className="text-xs text-[#667781] mt-0.5">
                      {poll.total_votes} suara &bull;{" "}
                      <span className={closed ? "text-gray-400" : "text-[#128c7e]"}>
                        {closed ? "Ditutup" : "Aktif"}
                      </span>
                    </p>
                  </div>
                  {!closed && (
                    <button
                      onClick={() => handleClose(poll.id)}
                      disabled={closingId === poll.id}
                      className="flex-shrink-0 text-xs text-red-400 hover:text-red-600 font-medium transition disabled:opacity-50"
                    >
                      {closingId === poll.id ? "Menutup..." : "Tutup"}
                    </button>
                  )}
                </div>
              );
            })
          )}
        </div>
      )}

      {tab === "votes" && (
        <div className="space-y-3">
          {myVotes.length === 0 ? (
            <div className="text-center py-10 text-[#667781]">
              Belum ada riwayat voting.
            </div>
          ) : (
            myVotes.map((vote) => (
              <Link
                href={`/polls/${vote.poll_id}`}
                key={vote.id}
                className="block bg-white rounded-xl border border-[#e9edef] p-4 hover:border-[#25d366] transition"
              >
                <p className="font-semibold text-[#111b21] line-clamp-1">{vote.poll_title}</p>
                <p className="text-sm text-[#128c7e] mt-0.5">
                  Pilihan: <span className="font-semibold">{vote.option_text}</span>
                </p>
                <p className="text-xs text-[#667781] mt-1">
                  {new Date(vote.created_at).toLocaleDateString("id-ID", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </p>
              </Link>
            ))
          )}
        </div>
      )}
    </div>
  );
}
