import { NextResponse } from "next/server";
import { revalidateTag } from "next/cache";

import {
  CreatePositionRequestSchema,
  PositionSchema,
  UpdatePositionRequestSchema,
} from "@/lib/api/position.schema";
import {
  type GetPositionsResponse,
  GetPositionsResponseSchema,
} from "@/lib/api/position.schema";
import { mockPositions } from "@/lib/api/positions.mock";

export async function GET() {
  try {
    const response: GetPositionsResponse = GetPositionsResponseSchema.parse({
      positions: mockPositions,
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

    const index = mockPositions.findIndex(
      (position) => position.id === values.id,
    );

    if (index === -1) {
      return NextResponse.json(
        { error: "Position not found" },
        { status: 404 },
      );
    }

    const updatedPosition = PositionSchema.parse({
      id: values.id,
      role: values.role,
      position_name: values.position_name,
      features: {
        description: values.description,
        ...Object.fromEntries(
          values.permissions.map((permission) => [permission, true]),
        ),
      },
    });

    mockPositions[index] = updatedPosition;
    revalidateTag("positions", { expire: 0 });

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

    const nextId =
      mockPositions.length === 0
        ? 1
        : Math.max(...mockPositions.map((position) => position.id)) + 1;

    const newPosition = PositionSchema.parse({
      id: nextId,
      role: values.role,
      position_name: values.position_name,
      features: {
        description: values.description,
        ...Object.fromEntries(
          values.permissions.map((permission) => [permission, true]),
        ),
      },
    });

    mockPositions.push(newPosition);
    revalidateTag("positions", { expire: 0 });

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

    const index = mockPositions.findIndex((position) => position.id === id);

    if (index === -1) {
      return NextResponse.json(
        { error: "Position not found" },
        { status: 404 },
      );
    }

    mockPositions.splice(index, 1);
    revalidateTag("positions", { expire: 0 });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting position:", error);

    return NextResponse.json(
      { error: "Failed to delete position" },
      { status: 400 },
    );
  }
}
