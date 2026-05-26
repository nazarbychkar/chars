import { NextResponse } from "next/server";
import { sqlGetAllGiftCertificates } from "@/lib/sql";

export async function GET() {
  try {
    const certificates = await sqlGetAllGiftCertificates();
    return NextResponse.json(certificates);
  } catch (error) {
    console.error("[GET /api/gift-certificates]", error);
    return NextResponse.json(
      { error: "Failed to fetch gift certificates" },
      { status: 500 }
    );
  }
}
