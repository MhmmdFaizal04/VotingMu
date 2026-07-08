import { listActivePolls } from "@/lib/queries/polls";
import { auth } from "@/lib/auth";
import PollCard from "@/components/PollCard";
import Link from "next/link";

export const revalidate = 0;

export default async function HomePage() {
  const session = await auth();
  const polls = await listActivePolls();

  return (
    <div>
      {/* Hero */}
      <div className="bg-white rounded-2xl border border-[#e9edef] p-6 mb-8 flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#111b21] mb-1">
            Polling Real-time
          </h1>
          <p className="text-[#667781] text-sm">
            Buat polling, bagikan, dan lihat hasilnya langsung secara real-time.
          </p>
        </div>
        {session ? (
          <Link
            href="/polls/create"
            className="flex-shrink-0 px-5 py-2.5 bg-[#25d366] text-white rounded-xl font-semibold hover:bg-[#128c7e] transition text-sm"
          >
            Buat Polling
          </Link>
        ) : (
          <Link
            href="/register"
            className="flex-shrink-0 px-5 py-2.5 bg-[#25d366] text-white rounded-xl font-semibold hover:bg-[#128c7e] transition text-sm"
          >
            Mulai Gratis
          </Link>
        )}
      </div>

      {/* Poll list */}
      <h2 className="text-base font-semibold text-[#667781] uppercase tracking-wider mb-4">
        Polling Aktif ({polls.length})
      </h2>

      {polls.length === 0 ? (
        <div className="text-center py-16 text-[#667781]">
          <p className="text-lg font-medium mb-2">Belum ada polling aktif</p>
          {session ? (
            <Link href="/polls/create" className="text-[#25d366] font-semibold hover:underline">
              Buat polling pertama
            </Link>
          ) : (
            <Link href="/register" className="text-[#25d366] font-semibold hover:underline">
              Daftar untuk membuat polling
            </Link>
          )}
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {polls.map((poll) => (
            <PollCard key={poll.id} poll={poll} />
          ))}
        </div>
      )}
    </div>
  );
}
