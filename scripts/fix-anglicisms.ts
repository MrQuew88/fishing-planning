/**
 * fix-anglicisms.ts — Replace anglicisms in fishing_zones notes/profile
 *
 * Usage:
 *   npx tsx scripts/fix-anglicisms.ts          # dry run
 *   npx tsx scripts/fix-anglicisms.ts --apply   # apply
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

// Replacements: pattern → replacement
// Order matters: longer/more specific patterns first
const REPLACEMENTS: [RegExp, string | ((match: string, ...args: string[]) => string)][] = [
  // Compound terms first
  [/\bmagnet spot\b/gi, "zone aimant"],
  [/\b(un|le|ce|du) spot\b/gi, "$1 poste"],
  // Spot at start of sentence or standalone — preserve case
  [/\bSpot\b/g, "Poste"],
  [/\bspot\b/g, "poste"],
  [/\bnarrows\b/gi, "goulet"],
  [/\bchop\b/gi, "clapots"],
  // shallow — context-dependent
  [/\bbordure shallow\b/gi, "bordure peu profonde"],
  [/\bmarge shallow\b/gi, "marge peu profonde"],
  [/\bzone shallow\b/gi, "zone peu profonde"],
  [/\bbaie shallow\b/gi, "baie peu profonde"],
  [/\ble shallow\b/gi, "le peu profond"],
  [/\bshallow\b/gi, "peu profonde"],
];

function fixText(text: string): string {
  let result = text;
  for (const [pattern, replacement] of REPLACEMENTS) {
    result = result.replace(pattern, replacement);
  }
  return result;
}

async function main() {
  const { data: zones, error } = await supabase
    .from("fishing_zones")
    .select("id, zone_name, name, notes, profile");

  if (error || !zones) {
    console.error("Error:", error);
    process.exit(1);
  }

  console.log(`Mode: ${dryRun ? "DRY RUN" : "APPLY"}\n`);

  let changedCount = 0;

  for (const z of zones) {
    const fixedNotes = z.notes ? fixText(z.notes) : z.notes;
    const fixedProfile = z.profile ? fixText(z.profile) : z.profile;

    const notesChanged = fixedNotes !== z.notes;
    const profileChanged = fixedProfile !== z.profile;

    if (notesChanged || profileChanged) {
      changedCount++;
      console.log(`--- ${z.zone_name} — ${z.name}`);
      if (notesChanged) {
        console.log(`  NOTES BEFORE: ${z.notes}`);
        console.log(`  NOTES AFTER:  ${fixedNotes}`);
      }
      if (profileChanged) {
        console.log(`  PROFILE BEFORE: ${z.profile}`);
        console.log(`  PROFILE AFTER:  ${fixedProfile}`);
      }
      console.log();

      if (!dryRun) {
        const update: Record<string, string | null> = {};
        if (notesChanged) update.notes = fixedNotes || null;
        if (profileChanged) update.profile = fixedProfile || null;

        const { error: updateError } = await supabase
          .from("fishing_zones")
          .update(update)
          .eq("id", z.id);

        if (updateError) {
          console.error(`  ERROR: ${updateError.message}`);
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
