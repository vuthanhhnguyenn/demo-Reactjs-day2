import { queryOptions } from "@tanstack/react-query";

import {
  type GetPositionsResponse,
  GetPositionsResponseSchema,
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
