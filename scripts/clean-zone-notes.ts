/**
 * clean-zone-notes.ts
 *
 * One-shot script: removes all lure/technique mentions from fishing_zones
 * notes and profile fields. Keeps only structural/tactical info.
 *
 * Usage:
 *   npx tsx scripts/clean-zone-notes.ts          # dry run
 *   npx tsx scripts/clean-zone-notes.ts --apply   # apply changes
 */

process.env.DOTENV_CONFIG_QUIET = "true";
import { config } from "dotenv";
config({ path: ".env.local", override: false });
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const dryRun = !process.argv.includes("--apply");

function cleanText(text: string): string {
  // Split into sentences
  const sentences = text.split(/(?<=\.)\s+/);

  const lurePattern =
    /jerkbait|swimbait|spinnerbait|shad[s]?\b|chatterbait|crankbait|lipless|leurre|texan|grub|minnow|buster.?jerk|pointer|glide.?bait|buzzing|leurres?\s+souples?|leurres?\s+de\s+surface|leurres?\s+vibratoire|leurres?\s+à\s+palette/i;

  const techPattern =
    /power.?fishing|linéaire|traction|verticale|pauses?\s+(longues?|très)|retrieve|ramener|ratisser|peigner|peignant|gratter|grattant|cranking|prospect|pêcher\s+(au|en|le|la|aux|l')|pêche\s+(lente|fine|planante)|lancer\s+(des|en|un)|faire\s+le\s+tour|manié|suspending|non\s+plombé|plombé|à\s+palette|en\s+éventail|en\s+diagonale|en\s+parallèle|marquant|animation|récupération\s+(lente|rapide)|vitesse/i;

  const filtered = sentences.filter((s) => {
    return !lurePattern.test(s) && !techPattern.test(s);
  });

  return filtered.join(" ").trim();
}

async function main() {
  const { data: zones, error } = await supabase
    .from("fishing_zones")
    .select("id, zone_name, name, notes, profile");

  if (error || !zones) {
    console.error("Failed to fetch zones:", error);
    process.exit(1);
  }

  console.log(`Mode: ${dryRun ? "DRY RUN" : "APPLY"}`);
  console.log(`Zones: ${zones.length}\n`);

  let changedCount = 0;

  for (const z of zones) {
    const cleanedNotes = z.notes ? cleanText(z.notes) : z.notes;
    const cleanedProfile = z.profile ? cleanText(z.profile) : z.profile;

    const notesChanged = cleanedNotes !== z.notes;
    const profileChanged = cleanedProfile !== z.profile;

    if (notesChanged || profileChanged) {
      changedCount++;
      console.log(`--- ${z.zone_name} — ${z.name}`);

      if (notesChanged) {
        console.log(`  NOTES BEFORE: ${z.notes}`);
        console.log(`  NOTES AFTER:  ${cleanedNotes || "(empty)"}`);
      }
      if (profileChanged) {
        console.log(`  PROFILE BEFORE: ${z.profile}`);
        console.log(`  PROFILE AFTER:  ${cleanedProfile || "(empty)"}`);
      }
      console.log();

      if (!dryRun) {
        const update: Record<string, string | null> = {};
        if (notesChanged) update.notes = cleanedNotes || null;
        if (profileChanged) update.profile = cleanedProfile || null;

        const { error: updateError } = await supabase
          .from("fishing_zones")
          .update(update)
          .eq("id", z.id);

        if (updateError) {
          console.error(`  ERROR updating ${z.name}:`, updateError.message);
        } else {
          console.log(`  ✓ Updated`);
        }
      }
    }
  }

  console.log(`\n${changedCount} zones ${dryRun ? "would be" : ""} updated.`);
  if (dryRun && changedCount > 0) {
    console.log("Run with --apply to commit changes.");
  }
}

main().catch((err) => {
  console.error("Fatal:", err);
  process.exit(1);
});
