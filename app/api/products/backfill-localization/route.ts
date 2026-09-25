import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/adminAuth";
import { runBackfillLocalization } from "@/lib/backfillLocalization";

export async function POST(request: NextRequest) {
  const authError = requireAdmin(request);
  if (authError) return authError;

  try {
    const body = await request.json().catch(() => ({}));
    const force = Boolean(body?.force);
    const dryRun = Boolean(body?.dryRun);

    const result = await runBackfillLocalization({ force, dryRun });

    return NextResponse.json({ success: true, ...result });
  } catch (error) {
    console.error("[POST /api/products/backfill-localization] error:", error);
    return NextResponse.json(
      { success: false, error: "Backfill failed", details: String(error) },
      { status: 500 }
    );
  }
}
