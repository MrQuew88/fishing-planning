"use client";

import { FishingZone } from "@/lib/types";
import ZoneCard from "./ZoneCard";

interface Props {
  zones: FishingZone[];
}

export default function ZonesClient({ zones }: Props) {
  const grouped = zones.reduce<Record<string, FishingZone[]>>((acc, z) => {
    (acc[z.zone_name] ||= []).push(z);
    return acc;
  }, {});

  return (
    <div className="space-y-8">
      {Object.entries(grouped).map(([zoneName, features]) => (
        <section key={zoneName} className="space-y-4">
          <h2 className="text-xl font-bold uppercase tracking-wide text-[#F1F5F9]">
            {zoneName}
          </h2>
          <div className="grid gap-4">
            {features.map((f) => (
              <ZoneCard key={f.id} zone={f} />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
