import { z } from "zod";

export const PositionRoleCategorySchema = z.enum([
  "headquarter",
  "manager",
  "staff",
  "trainer",
  "observer",
]);

export const PositionFeaturesSchema = z.record(z.string(), z.unknown());

export const PositionSchema = z.object({
  id: z.number().int(),
  role: PositionRoleCategorySchema,
  position_name: z.string(),
  features: PositionFeaturesSchema,
});

export const GetPositionsResponseSchema = z.object({
  positions: z.array(PositionSchema),
});

export type Position = z.infer<typeof PositionSchema>;
export type PositionRoleCategory = z.infer<typeof PositionRoleCategorySchema>;
export type GetPositionsResponse = z.infer<typeof GetPositionsResponseSchema>;
