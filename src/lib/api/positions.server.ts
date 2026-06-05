import { listPositions } from "./positions.store";

const POSITIONS_PAGE_SIZE = 10;

export async function getPositionsForPage() {
  const positions = await listPositions();

  return {
    positions: positions.slice(0, POSITIONS_PAGE_SIZE),
    pagination: {
      page: 1,
      pageSize: POSITIONS_PAGE_SIZE,
      totalItems: positions.length,
      totalPages: Math.max(1, Math.ceil(positions.length / POSITIONS_PAGE_SIZE)),
    },
    summary: {
      totalPositions: positions.length,
      totalRoles: new Set(positions.map((position) => position.role)).size,
    },
  };
}

export async function getAllPositionsForPage() {
  return listPositions();
}
