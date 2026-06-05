import { NextResponse } from "next/server";

import {
  CreatePositionRequestSchema,
  PositionRoleCategorySchema,
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

function parsePositiveInteger(value: string | null, fallback: number) {
  const parsedValue = Number(value);

  if (!Number.isInteger(parsedValue) || parsedValue < 1) {
    return fallback;
  }

  return parsedValue;
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parsePositiveInteger(searchParams.get("page"), 1);
    const pageSize = Math.min(
      parsePositiveInteger(searchParams.get("pageSize"), 10),
      100,
    );
    const search = searchParams.get("search")?.trim().toLowerCase() ?? "";
    const roleResult = PositionRoleCategorySchema.safeParse(
      searchParams.get("role"),
    );
    const role = roleResult.success ? roleResult.data : null;
    const positions = await listPositions();
    const filteredPositions = positions.filter((position) => {
      const matchesSearch = position.position_name
        .toLowerCase()
        .includes(search);
      const matchesRole = role === null || position.role === role;

      return matchesSearch && matchesRole;
    });
    const totalItems = filteredPositions.length;
    const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
    const currentPage = Math.min(page, totalPages);
    const startIndex = (currentPage - 1) * pageSize;

    const response: GetPositionsResponse = GetPositionsResponseSchema.parse({
      positions: filteredPositions.slice(startIndex, startIndex + pageSize),
      pagination: {
        page: currentPage,
        pageSize,
        totalItems,
        totalPages,
      },
      summary: {
        totalPositions: positions.length,
        totalRoles: new Set(positions.map((position) => position.role)).size,
      },
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
