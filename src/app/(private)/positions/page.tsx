import { Suspense } from "react";

import { Skeleton } from "@/components/ui/skeleton";
import {
  getPositionsForPage,
  getPositionsSummaryForPage,
} from "@/lib/api/positions.server";

import { PositionsClient } from "./_components/positions-client";

export const dynamic = "force-dynamic";

export default async function PositionsPage() {
  const [positionsResponse, positionsSummary] = await Promise.all([
    getPositionsForPage(),
    getPositionsSummaryForPage(),
  ]);

  return (
    <Suspense fallback={<Skeleton className="h-10 w-full" />}>
      <PositionsClient
        initialData={positionsResponse}
        initialSummary={positionsSummary}
      />
    </Suspense>
  );
}
