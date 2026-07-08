"use client";

import { useEffect, useState, useCallback } from "react";
import { PollDetail } from "@/lib/queries/polls";
import { PollOption } from "@/lib/queries/polls";
import pusherClient from "@/lib/pusher-client";
import VoteForm from "@/components/VoteForm";
import ResultsChart from "@/components/ResultsChart";
import PollTimer from "@/components/PollTimer";

interface PollDetailClientProps {
  poll: PollDetail;
  userVoteId: string | null;
  userId: string;
}

export default function PollDetailClient({
  poll: initialPoll,
  userVoteId: initialUserVoteId,
  userId,
}: PollDetailClientProps) {
  const [options, setOptions] = useState<PollOption[]>(initialPoll.options);
  const [total, setTotal] = useState(initialPoll.total_votes);
  const [userVoteId, setUserVoteId] = useState<string | null>(initialUserVoteId);

  const hasVoted = userVoteId !== null;
  const canSeeResults = hasVoted || initialPoll.show_results_before_vote;
  const isExpired = initialPoll.expires_at ? new Date(initialPoll.expires_at) < new Date() : false;
  const isClosed = !initialPoll.is_active || isExpired;

  const handleVoted = useCallback((optionId: string) => {
    setUserVoteId(optionId);
  }, []);

  // Pusher subscription for real-time updates
  useEffect(() => {
    const channel = pusherClient.subscribe(`poll-${initialPoll.id}`);
    channel.bind("vote-update", (data: { options: PollOption[]; total: number }) => {
      setOptions(data.options);
      setTotal(data.total);
    });
    return () => {
      pusherClient.unsubscribe(`poll-${initialPoll.id}`);
    };
  }, [initialPoll.id]);

  function copyLink() {
    navigator.clipboard.writeText(window.location.href);
  }

  async function closePoll() {
    if (!confirm("Tutup polling ini? Tindakan ini tidak bisa dibatalkan.")) return;
    await fetch(`/api/polls/${initialPoll.id}/close`, { method: "PATCH" });
    window.location.reload();
  }

  return (
    <div className="max-w-2xl mx-auto">
      {/* Poll header */}
      <div className="bg-white rounded-2xl border border-[#e9edef] p-6 mb-4">
        <div className="flex items-start justify-between gap-3 mb-3">
          <span
            className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
              isClosed ? "bg-gray-100 text-gray-500" : "bg-[#dcf8c6] text-[#128c7e]"
            }`}
          >
            {isClosed ? "Ditutup" : "Aktif"}
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={copyLink}
              className="text-xs text-[#667781] hover:text-[#25d366] font-medium transition"
            >
              Salin Link
            </button>
            {userId === initialPoll.created_by && !isClosed && (
              <button
                onClick={closePoll}
                className="text-xs text-red-400 hover:text-red-600 font-medium transition"
              >
                Tutup Poll
              </button>
            )}
          </div>
        </div>

        <h1 className="text-xl font-bold text-[#111b21] mb-2">{initialPoll.title}</h1>
        {initialPoll.description && (
          <p className="text-[#667781] text-sm mb-3">{initialPoll.description}</p>
        )}

        <div className="flex items-center justify-between text-xs text-[#667781]">
          <span>Dibuat oleh {initialPoll.creator_name}</span>
          {!isClosed && initialPoll.expires_at && (
            <PollTimer expiresAt={initialPoll.expires_at} />
          )}
        </div>
      </div>

      {/* Total votes badge */}
      <div className="flex items-center justify-center mb-4">
        <span className="px-4 py-1.5 bg-[#dcf8c6] text-[#128c7e] rounded-full text-sm font-semibold">
          {total} suara masuk
        </span>
      </div>

      {/* Vote form or already voted */}
      {!isClosed && !hasVoted && (
        <div className="bg-white rounded-2xl border border-[#e9edef] p-6 mb-4">
          <h2 className="text-base font-semibold text-[#111b21] mb-4">
            Berikan suaramu
          </h2>
          <VoteForm pollId={initialPoll.id} options={options} onVoted={handleVoted} />
        </div>
      )}

      {hasVoted && (
        <div className="bg-[#dcf8c6] border border-[#25d366]/30 rounded-2xl px-5 py-3 mb-4 text-sm text-[#128c7e] font-medium">
          Suara kamu sudah tercatat. Pilihan kamu:{" "}
          <span className="font-bold">
            {options.find((o) => o.id === userVoteId)?.text ?? ""}
          </span>
        </div>
      )}

      {isClosed && !hasVoted && (
        <div className="bg-gray-50 border border-[#e9edef] rounded-2xl px-5 py-3 mb-4 text-sm text-[#667781] font-medium">
          Polling ini sudah ditutup.
        </div>
      )}

      {/* Results chart */}
      {canSeeResults || isClosed ? (
        <div className="bg-white rounded-2xl border border-[#e9edef] p-6">
          <h2 className="text-base font-semibold text-[#111b21] mb-5">
            Hasil Polling
          </h2>
          {total === 0 ? (
            <p className="text-[#667781] text-sm text-center py-4">
              Belum ada suara yang masuk.
            </p>
          ) : (
            <ResultsChart options={options} total={total} userVoteId={userVoteId} />
          )}

          {/* Option detail list */}
          <div className="mt-4 space-y-2 border-t border-[#e9edef] pt-4">
            {options.map((o) => {
              const pct = total > 0 ? Math.round((o.vote_count / total) * 100) : 0;
              return (
                <div key={o.id} className="flex items-center justify-between text-sm">
                  <span
                    className={`font-medium ${
                      o.id === userVoteId ? "text-[#128c7e]" : "text-[#111b21]"
                    }`}
                  >
                    {o.text}
                    {o.id === userVoteId && (
                      <span className="ml-2 text-xs text-[#25d366]">(pilihan kamu)</span>
                    )}
                  </span>
                  <span className="text-[#667781]">
                    {o.vote_count} ({pct}%)
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-[#e9edef] p-6 text-center text-[#667781] text-sm">
          Hasil akan tampil setelah kamu memberikan suara.
        </div>
      )}
    </div>
  );
}
