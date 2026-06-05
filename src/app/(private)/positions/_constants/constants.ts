export const POSITION_ROLES = [
  "headquarter",
  "manager",
  "staff",
  "trainer",
  "observer",
] as const;

export const POSITIONS_PAGE_SIZE = 10;

export type PositionRole = (typeof POSITION_ROLES)[number];
