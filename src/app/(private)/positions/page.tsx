import { Suspense } from "react";

import { Skeleton } from "@/components/ui/skeleton";
import { getPositionsForPage } from "@/lib/api/positions.server";

import { PositionsClient } from "./_components/positions-client";

export const dynamic = "force-dynamic";

export default async function PositionsPage() {
  const positionsResponse = await getPositionsForPage();

  return (
    <Suspense fallback={<Skeleton className="h-10 w-full" />}>
      <PositionsClient initialData={positionsResponse} />
    </Suspense>
  );
}
