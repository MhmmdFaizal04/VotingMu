"use client";

import { useState, useEffect } from "react";

interface PollTimerProps {
  expiresAt: string;
  compact?: boolean;
}

export default function PollTimer({ expiresAt, compact = false }: PollTimerProps) {
  const [remaining, setRemaining] = useState("");
  const [expired, setExpired] = useState(false);

  useEffect(() => {
    function update() {
      const diff = new Date(expiresAt).getTime() - Date.now();
      if (diff <= 0) {
        setExpired(true);
        setRemaining("Berakhir");
        return;
      }
      const d = Math.floor(diff / 86400000);
      const h = Math.floor((diff % 86400000) / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      const s = Math.floor((diff % 60000) / 1000);

      if (compact) {
        if (d > 0) setRemaining(`${d}h ${h}j`);
        else if (h > 0) setRemaining(`${h}j ${m}m`);
        else setRemaining(`${m}m ${s}d`);
      } else {
        if (d > 0) setRemaining(`${d} hari ${h} jam ${m} menit`);
        else if (h > 0) setRemaining(`${h} jam ${m} menit ${s} detik`);
        else setRemaining(`${m} menit ${s} detik`);
      }
    }

    update();
    const id = setInterval(update, 1000);
    return () => clearInterval(id);
  }, [expiresAt, compact]);

  if (expired) return null;

  return (
    <span className={`text-xs font-medium ${compact ? "text-[#667781]" : "text-[#128c7e]"}`}>
      {compact ? remaining : `Berakhir dalam ${remaining}`}
    </span>
  );
}
