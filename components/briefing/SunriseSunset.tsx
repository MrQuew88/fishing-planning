"use client";

import { Solunar } from "@/lib/types";

const D = "font-[family-name:var(--font-space)]";

function trimSeconds(time: string | null): string {
  if (!time) return "\u2013";
  return time.slice(0, 5);
}

export default function SunriseSunset({ solunar }: { solunar: Solunar }) {
  return (
    <div className="bg-white/[0.07] backdrop-blur-xl border border-white/[0.12] rounded-2xl px-5 py-4 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <span className="text-[#F59E0B] text-xl">{"\u2600\uFE0F"}</span>
        <div>
          <div className="text-sm text-white/50 font-medium">Lever</div>
          <div className={`${D} text-3xl font-bold text-white`}>
            {trimSeconds(solunar.lever_soleil)}
          </div>
        </div>
      </div>
      <div className="w-px h-10 bg-white/[0.08]" />
      <div className="flex items-center gap-3">
        <div className="text-right">
          <div className="text-sm text-white/50 font-medium">Coucher</div>
          <div className={`${D} text-3xl font-bold text-white`}>
            {trimSeconds(solunar.coucher_soleil)}
          </div>
        </div>
        <span className="text-[#F59E0B]/60 text-xl">{"\uD83C\uDF19"}</span>
      </div>
    </div>
  );
}
