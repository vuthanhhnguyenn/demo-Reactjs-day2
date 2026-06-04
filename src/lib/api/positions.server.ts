import { headers } from "next/headers";

import { GetPositionsResponseSchema } from "./position.schema";

export async function getPositionsForPage() {
  const headersList = await headers();
  const host = headersList.get("host");

  const protocol =
    process.env.NODE_ENV === "production" ? "https" : "http";

  const response = await fetch(`${protocol}://${host}/api/crm/positions`, {
    next: {
      revalidate: 60,
      tags: ["positions"],
    },
  });

  if (!response.ok) {
    throw new Error("Failed to fetch positions");
  }

  const data = await response.json();

  return GetPositionsResponseSchema.parse(data).positions;
}