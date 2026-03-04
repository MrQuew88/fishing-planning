"use client";

import dynamic from "next/dynamic";

const ZonesMap = dynamic(() => import("@/components/zones/ZonesMap"), {
  ssr: false,
  loading: () => (
    <div className="fixed left-0 right-0 bottom-0 flex items-center justify-center bg-[#080F1E]" style={{ top: "52px" }}>
      <p className="text-white/50 text-lg">Chargement de la carte…</p>
    </div>
  ),
});

export default ZonesMap;
