import { listPositions } from "./positions.store";

export async function getPositionsForPage() {
  return listPositions();
}
