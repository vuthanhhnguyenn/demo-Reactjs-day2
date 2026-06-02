export const POSITION_ROLES = [
  "headquarter",
  "manager",
  "staff",
  "trainer",
  "observer",
] as const;

export type PositionRole = (typeof POSITION_ROLES)[number];
