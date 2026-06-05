import { NextResponse } from "next/server";

import {
  CreatePositionRequestSchema,
  UpdatePositionRequestSchema,
} from "@/lib/api/position.schema";
import {
  type GetPositionsResponse,
  GetPositionsResponseSchema,
} from "@/lib/api/position.schema";
import {
  createPosition,
  deletePosition,
  listPositions,
  updatePosition,
} from "@/lib/api/positions.store";

export async function GET() {
  try {
    const response: GetPositionsResponse = GetPositionsResponseSchema.parse({
      positions: await listPositions(),
    });

    return NextResponse.json(response);
  } catch (error) {
    console.error("Error fetching positions:", error);

    return NextResponse.json(
      { error: "Failed to fetch positions" },
      { status: 500 },
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const values = UpdatePositionRequestSchema.parse(body);

    const updatedPosition = await updatePosition(values);

    if (!updatedPosition) {
      return NextResponse.json(
        { error: "Position not found" },
        { status: 404 },
      );
    }

    return NextResponse.json(updatedPosition);
  } catch (error) {
    console.error("Error updating position:", error);

    return NextResponse.json(
      { error: "Failed to update position" },
      { status: 400 },
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const values = CreatePositionRequestSchema.parse(body);

    const newPosition = await createPosition(values);

    return NextResponse.json(newPosition, { status: 201 });
  } catch (error) {
    console.error("Error creating position:", error);

    return NextResponse.json(
      { error: "Failed to create position" },
      { status: 400 },
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = Number(searchParams.get("id"));

    if (!Number.isInteger(id)) {
      return NextResponse.json(
        { error: "Invalid position id" },
        { status: 400 },
      );
    }

    const deleted = await deletePosition(id);

    if (!deleted) {
      return NextResponse.json(
        { error: "Position not found" },
        { status: 404 },
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting position:", error);

    return NextResponse.json(
      { error: "Failed to delete position" },
      { status: 400 },
    );
  }
}
