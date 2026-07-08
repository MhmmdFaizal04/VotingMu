"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function CreatePollPage() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [options, setOptions] = useState(["", ""]);
  const [showResultsBeforeVote, setShowResultsBeforeVote] = useState(false);
  const [expiresAt, setExpiresAt] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function addOption() {
    if (options.length < 10) setOptions([...options, ""]);
  }

  function removeOption(i: number) {
    if (options.length <= 2) return;
    setOptions(options.filter((_, idx) => idx !== i));
  }

  function updateOption(i: number, val: string) {
    const updated = [...options];
    updated[i] = val;
    setOptions(updated);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    const trimmedOptions = options.map((o) => o.trim()).filter(Boolean);
    if (trimmedOptions.length < 2) {
      setError("Minimal 2 opsi harus diisi");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/polls", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          description: description.trim(),
          showResultsBeforeVote,
          expiresAt: expiresAt || null,
          options: trimmedOptions,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Gagal membuat polling");
        return;
      }
      router.push(`/polls/${data.id}`);
    } catch {
      setError("Tidak dapat terhubung ke server");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-xl mx-auto">
      <h1 className="text-2xl font-bold text-[#111b21] mb-6">Buat Polling Baru</h1>

      <div className="bg-white rounded-2xl border border-[#e9edef] p-6">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm mb-5">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Title */}
          <div>
            <label className="block text-sm font-semibold text-[#111b21] mb-1.5">
              Pertanyaan / Judul Polling
            </label>
            <input
              type="text"
              required
              maxLength={200}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Contoh: Bahasa pemrograman favorit kamu?"
              className="w-full px-4 py-2.5 rounded-lg border border-[#e9edef] bg-[#f0f2f5] text-[#111b21] placeholder-[#667781] focus:outline-none focus:ring-2 focus:ring-[#25d366] focus:border-transparent transition"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-semibold text-[#111b21] mb-1.5">
              Deskripsi <span className="font-normal text-[#667781]">(opsional)</span>
            </label>
            <textarea
              maxLength={500}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Tambahkan konteks atau penjelasan..."
              rows={3}
              className="w-full px-4 py-2.5 rounded-lg border border-[#e9edef] bg-[#f0f2f5] text-[#111b21] placeholder-[#667781] focus:outline-none focus:ring-2 focus:ring-[#25d366] focus:border-transparent transition resize-none"
            />
          </div>

          {/* Options */}
          <div>
            <label className="block text-sm font-semibold text-[#111b21] mb-2">
              Opsi Jawaban ({options.length}/10)
            </label>
            <div className="space-y-2">
              {options.map((opt, i) => (
                <div key={i} className="flex gap-2">
                  <input
                    type="text"
                    maxLength={200}
                    value={opt}
                    onChange={(e) => updateOption(i, e.target.value)}
                    placeholder={`Opsi ${i + 1}`}
                    className="flex-1 px-4 py-2.5 rounded-lg border border-[#e9edef] bg-[#f0f2f5] text-[#111b21] placeholder-[#667781] focus:outline-none focus:ring-2 focus:ring-[#25d366] focus:border-transparent transition"
                  />
                  {options.length > 2 && (
                    <button
                      type="button"
                      onClick={() => removeOption(i)}
                      className="px-3 py-2.5 rounded-lg border border-red-200 text-red-400 hover:bg-red-50 transition text-sm"
                    >
                      Hapus
                    </button>
                  )}
                </div>
              ))}
            </div>
            {options.length < 10 && (
              <button
                type="button"
                onClick={addOption}
                className="mt-2 text-sm text-[#25d366] font-semibold hover:text-[#128c7e] transition"
              >
                + Tambah opsi
              </button>
            )}
          </div>

          {/* Expiry */}
          <div>
            <label className="block text-sm font-semibold text-[#111b21] mb-1.5">
              Tanggal Berakhir <span className="font-normal text-[#667781]">(opsional)</span>
            </label>
            <input
              type="datetime-local"
              value={expiresAt}
              onChange={(e) => setExpiresAt(e.target.value)}
              min={new Date().toISOString().slice(0, 16)}
              className="w-full px-4 py-2.5 rounded-lg border border-[#e9edef] bg-[#f0f2f5] text-[#111b21] focus:outline-none focus:ring-2 focus:ring-[#25d366] focus:border-transparent transition"
            />
          </div>

          {/* Show results toggle */}
          <label className="flex items-center gap-3 cursor-pointer select-none">
            <div className="relative">
              <input
                type="checkbox"
                className="sr-only"
                checked={showResultsBeforeVote}
                onChange={(e) => setShowResultsBeforeVote(e.target.checked)}
              />
              <div
                className={`w-10 h-5 rounded-full transition-colors ${
                  showResultsBeforeVote ? "bg-[#25d366]" : "bg-[#e9edef]"
                }`}
              />
              <div
                className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${
                  showResultsBeforeVote ? "translate-x-5" : "translate-x-0"
                }`}
              />
            </div>
            <span className="text-sm font-medium text-[#111b21]">
              Tampilkan hasil sebelum voting
            </span>
          </label>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-[#25d366] text-white font-semibold hover:bg-[#128c7e] active:scale-95 transition disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? "Membuat polling..." : "Buat Polling"}
          </button>
        </form>
      </div>
    </div>
  );
}
