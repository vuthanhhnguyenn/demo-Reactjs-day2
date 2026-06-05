import { NextResponse } from "next/server";

import { GetPositionsSummaryResponseSchema } from "@/lib/api/position.schema";
import { getPositionsSummary } from "@/lib/api/positions.store";

export async function GET() {
  try {
    const response = GetPositionsSummaryResponseSchema.parse(
      await getPositionsSummary(),
    );

    return NextResponse.json(response);
  } catch (error) {
    console.error("Error fetching positions summary:", error);

    return NextResponse.json(
      { error: "Failed to fetch positions summary" },
      { status: 500 },
    );
  }
}
