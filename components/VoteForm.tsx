"use client";

import { useState } from "react";

interface VoteFormProps {
  pollId: string;
  options: { id: string; text: string; vote_count: number }[];
  onVoted: (optionId: string) => void;
  defaultSelected?: string | null;
}

export default function VoteForm({ pollId, options, onVoted, defaultSelected }: VoteFormProps) {
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState<string>(defaultSelected ?? "");
  const [error, setError] = useState("");

  async function handleSelect(optionId: string) {
    if (loading || optionId === selected) return;
    setSelected(optionId);
    setError("");
    setLoading(true);
    try {
      const res = await fetch(`/api/polls/${pollId}/vote`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ optionId }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Gagal mengirim suara");
        setSelected("");
        return;
      }
      onVoted(optionId);
    } catch {
      setError("Tidak dapat terhubung ke server");
      setSelected("");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-3">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm">
          {error}
        </div>
      )}

      <div className="space-y-2">
        {options.map((opt) => (
          <button
            key={opt.id}
            type="button"
            disabled={loading}
            onClick={() => handleSelect(opt.id)}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border-2 text-left transition-all disabled:cursor-not-allowed ${
              selected === opt.id
                ? "border-[#25d366] bg-[#dcf8c6]"
                : "border-[#e9edef] bg-white hover:border-[#25d366]/50 hover:bg-[#f0f2f5]"
            }`}
          >
            <span
              className={`w-4 h-4 rounded-full border-2 flex-shrink-0 transition-colors ${
                selected === opt.id
                  ? "border-[#25d366] bg-[#25d366]"
                  : "border-[#667781] bg-white"
              }`}
            />
            <span className="font-medium text-[#111b21]">
              {opt.text}
            </span>
            {loading && selected === opt.id && (
              <span className="ml-auto text-xs text-[#667781]">Mengirim...</span>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
