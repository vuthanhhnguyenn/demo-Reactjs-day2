import { Suspense } from "react";

import { Skeleton } from "@/components/ui/skeleton";
import { getPositionsForPage } from "@/lib/api/positions.server";

import { PositionsClient } from "./_components/positions-client";

export default async function PositionsPage() {
  const positions = await getPositionsForPage();

  return (
    <Suspense fallback={<Skeleton className="h-10 w-full" />}>
      <PositionsClient initialPositions={positions} />
    </Suspense>
  );
}
