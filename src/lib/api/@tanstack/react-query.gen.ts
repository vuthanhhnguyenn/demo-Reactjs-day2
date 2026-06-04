import { queryOptions } from "@tanstack/react-query";

import {
  type GetPositionsResponse,
  GetPositionsResponseSchema,
  type CreatePositionRequest,
  type Position,
  PositionSchema,
  type UpdatePositionRequest,
} from "../position.schema";
export type GetCrmPositionsResponse = GetPositionsResponse;

export async function getCrmPositions(): Promise<GetCrmPositionsResponse> {
  const response = await fetch("/api/crm/positions");

  if (!response.ok) {
    throw new Error("Failed to fetch positions");
  }

  return GetPositionsResponseSchema.parse(await response.json());
}

export function getCrmPositionsOptions() {
  return queryOptions({
    queryKey: ["getCrmPositions"],
    queryFn: getCrmPositions,
  });
}
export async function createCrmPosition(
  values: CreatePositionRequest,
): Promise<Position> {
  const response = await fetch("/api/crm/positions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(values),
  });

  if (!response.ok) {
    throw new Error("Failed to create position");
  }

  return PositionSchema.parse(await response.json());
}

export async function updateCrmPosition(
  values: UpdatePositionRequest,
): Promise<Position> {
  const response = await fetch("/api/crm/positions", {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(values),
  });

  if (!response.ok) {
    throw new Error("Failed to update position");
  }

  return PositionSchema.parse(await response.json());
}

export async function deleteCrmPosition(id: number): Promise<void> {
  const response = await fetch(`/api/crm/positions?id=${id}`, {
    method: "DELETE",
  });

  if (!response.ok) {
    throw new Error("Failed to delete position");
  }
}
