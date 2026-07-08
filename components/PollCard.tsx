"use client";

import Link from "next/link";
import { Poll } from "@/lib/queries/polls";
import PollTimer from "./PollTimer";

interface PollCardProps {
  poll: Poll;
}

export default function PollCard({ poll }: PollCardProps) {
  const isExpired = poll.expires_at ? new Date(poll.expires_at) < new Date() : false;
  const closed = !poll.is_active || isExpired;

  return (
    <Link href={`/polls/${poll.id}`} className="block group">
      <div className="bg-white rounded-2xl border border-[#e9edef] p-5 hover:shadow-md hover:border-[#25d366] transition-all duration-200">
        {/* Status badge */}
        <div className="flex items-start justify-between gap-2 mb-3">
          <span
            className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold ${
              closed
                ? "bg-gray-100 text-gray-500"
                : "bg-[#dcf8c6] text-[#128c7e]"
            }`}
          >
            {closed ? "Ditutup" : "Aktif"}
          </span>
          <span className="text-xs text-[#667781]">
            {poll.total_votes} suara
          </span>
        </div>

        {/* Title */}
        <h3 className="font-semibold text-[#111b21] text-base leading-snug mb-1 group-hover:text-[#128c7e] transition-colors line-clamp-2">
          {poll.title}
        </h3>

        {/* Description */}
        {poll.description && (
          <p className="text-sm text-[#667781] line-clamp-2 mb-3">
            {poll.description}
          </p>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between mt-3 pt-3 border-t border-[#e9edef]">
          <span className="text-xs text-[#667781]">oleh {poll.creator_name}</span>
          {!closed && poll.expires_at && (
            <PollTimer expiresAt={poll.expires_at} compact />
          )}
        </div>
      </div>
    </Link>
  );
}
