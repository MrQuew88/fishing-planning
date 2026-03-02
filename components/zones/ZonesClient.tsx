"use client";

import { useState } from "react";
import { FishingZone } from "@/lib/types";
import ZoneCard from "./ZoneCard";

interface Props {
  zones: FishingZone[];
}

function ZoneSection({
  zoneName,
  features,
  defaultOpen,
}: {
  zoneName: string;
  features: FishingZone[];
  defaultOpen: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <section>
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-3 w-full text-left py-2 group"
      >
        <h2 className="text-base md:text-xl font-bold uppercase tracking-wide text-[#F1F5F9]">
          {zoneName}
          <span className="text-white/70 font-semibold ml-2 text-sm md:text-base">({features.length})</span>
        </h2>
        <svg
          className={`w-5 h-5 text-white/70 transition-transform duration-200 shrink-0 ${
            open ? "rotate-0" : "-rotate-90"
          }`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      <div
        className="collapse-content mt-4"
        data-open={open}
      >
        <div className="collapse-inner">
          <div className="grid gap-4">
            {features.map((f) => (
              <ZoneCard key={f.id} zone={f} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

export default function ZonesClient({ zones }: Props) {
  const grouped = zones.reduce<Record<string, FishingZone[]>>((acc, z) => {
    (acc[z.zone_name] ||= []).push(z);
    return acc;
  }, {});

  return (
    <div className="space-y-8">
      {Object.entries(grouped).map(([zoneName, features], i) => (
        <ZoneSection
          key={zoneName}
          zoneName={zoneName}
          features={features}
          defaultOpen={i === 0}
        />
      ))}
    </div>
  );
}
