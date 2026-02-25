import { NextResponse } from "next/server";
import { sqlGetAllSubcategories } from "@/lib/sql";

export async function GET() {
  try {
    const subcategories = await sqlGetAllSubcategories();
    return NextResponse.json(subcategories);
  } catch (error) {
    console.error("[GET /api/subcategories/all]", error);
    return NextResponse.json(
      { error: "Failed to fetch subcategories" },
      { status: 500 }
    );
  }
}

