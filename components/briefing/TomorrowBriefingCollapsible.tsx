"use client";

import { useState } from "react";
import { BriefingContent, FishingZone } from "@/lib/types";
import TacticalBriefingSection from "./TacticalBriefingSection";

interface Props {
  date: string;
  content: BriefingContent;
  zonesMap: Record<string, FishingZone>;
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr + "T12:00:00");
  return d.toLocaleDateString("fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
}

export default function TomorrowBriefingCollapsible({
  date,
  content,
  zonesMap,
}: Props) {
  const [open, setOpen] = useState(false);

  return (
    <div>
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-3 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl px-5 py-4 cursor-pointer hover:bg-white/[0.08] transition-colors"
      >
        <svg
          className={`w-5 h-5 flex-shrink-0 text-white/50 transition-transform duration-200 ${open ? "rotate-0" : "-rotate-90"}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M19 9l-7 7-7-7"
          />
        </svg>
        <span className="text-xs md:text-sm font-bold tracking-wider uppercase text-white/50">
          Briefing de demain — {formatDate(date)}
        </span>
      </button>

      <div className="collapse-content" data-open={open}>
        <div className="collapse-inner">
          <div className="pt-6">
            <TacticalBriefingSection content={content} zonesMap={zonesMap} />
          </div>
        </div>
      </div>
    </div>
  );
}
