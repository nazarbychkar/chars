#!/usr/bin/env node
/**
 * Масовий переклад товарів, категорій і підкатегорій (UA → EN/DE) у БД.
 *
 * Usage:
 *   npm run backfill:translate
 *   npm run backfill:translate -- --force
 *   npm run backfill:translate -- --dry-run
 */
import { runBackfillLocalization } from "../lib/backfillLocalization";

async function main() {
  if (!process.env.DATABASE_URL) {
    console.error("❌ DATABASE_URL is not set (.env or environment)");
    process.exit(1);
  }

  const args = process.argv.slice(2);
  const force = args.includes("--force");
  const dryRun = args.includes("--dry-run");
  const delayArg = args.find((a) => a.startsWith("--delay="));
  const delayMs = delayArg ? Number(delayArg.split("=")[1]) : 250;

  console.log("🌐 Backfill localization (products + categories + subcategories)");
  console.log(
    `   force=${force} dryRun=${dryRun} delayMs=${Number.isFinite(delayMs) ? delayMs : 250}`
  );
  console.log("");

  const started = Date.now();
  const result = await runBackfillLocalization({
    force,
    dryRun,
    delayMs: Number.isFinite(delayMs) ? delayMs : 250,
  });

  const sec = ((Date.now() - started) / 1000).toFixed(1);
  console.log("✅ Done in", sec, "s");
  console.log(
    `   Products:    ${result.products.updated} updated, ${result.products.skipped} skipped`
  );
  console.log(
    `   Categories:  ${result.categories.updated} updated, ${result.categories.skipped} skipped`
  );
  console.log(
    `   Subcategories: ${result.subcategories.updated} updated, ${result.subcategories.skipped} skipped`
  );
  if (dryRun) {
    console.log("\n(dry-run — зміни в БД не записувались)");
  }
}

main().catch((err) => {
  console.error("❌ Backfill failed:", err);
  process.exit(1);
});
