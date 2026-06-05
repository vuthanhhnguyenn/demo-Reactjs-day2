import {
  getPositionsSummary,
  listPositions,
  listPositionsPage,
} from "./positions.store";

const POSITIONS_PAGE_SIZE = 10;

export async function getPositionsForPage() {
  return listPositionsPage({
    page: 1,
    pageSize: POSITIONS_PAGE_SIZE,
    search: "",
    role: null,
  });
}

export async function getPositionsSummaryForPage() {
  return getPositionsSummary();
}

export async function getAllPositionsForPage() {
  return listPositions();
}
