/**
 * scan-anglicisms.ts — One-shot scan for anglicisms in fishing_zones notes/profile
 */
process.env.DOTENV_CONFIG_QUIET = "true";
import { config } from "dotenv";
config({ path: ".env.local", override: false });
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const TERMS = [
  { re: /\bchop\b/gi, label: "chop" },
  { re: /\bshallow\b/gi, label: "shallow" },
  { re: /\bdeep\b/gi, label: "deep" },
  { re: /\bdrop[\s-]?off\b/gi, label: "drop-off" },
  { re: /\bmagnet[\s-]?spot\b/gi, label: "magnet spot" },
  { re: /\bspot\b/gi, label: "spot" },
  { re: /\bnarrows\b/gi, label: "narrows" },
  { re: /\bslow[\s-]?rolling\b/gi, label: "slow-rolling" },
  { re: /\bfront\s+froid\b/gi, label: "front froid (OK)" },
  { re: /\bsuspend(?:ed|ing)\b/gi, label: "suspended/suspending" },
];

async function main() {
  const { data: zones, error } = await supabase
    .from("fishing_zones")
    .select("id, zone_name, name, notes, profile, type");

  if (error || !zones) {
    console.error("Error:", error);
    process.exit(1);
  }

  // Also check the `type` field for anglicisms
  const types = new Set(zones.map((z) => z.type));
  console.log("Zone types in DB:", [...types].join(", "));
  console.log();

  for (const term of TERMS) {
    const matches: string[] = [];
    for (const z of zones) {
      const text = [z.notes, z.profile].filter(Boolean).join(" ");
      if (term.re.test(text)) {
        matches.push(`  ${z.zone_name} — ${z.name}`);
        term.re.lastIndex = 0;
      }
    }
    if (matches.length > 0) {
      console.log(`${term.label}: ${matches.length} zones`);
      for (const m of matches.slice(0, 3)) console.log(m);
      if (matches.length > 3) console.log(`  ... +${matches.length - 3} more`);
      console.log();
    }
  }
}

main();
