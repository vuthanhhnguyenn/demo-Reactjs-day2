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

export const CreatePositionRequestSchema = z.object({
  position_name: z.string().min(1).max(100),
  role: PositionRoleCategorySchema,
  description: z.string().min(1).max(300),
  permissions: z.array(z.string()),
});

export const UpdatePositionRequestSchema = CreatePositionRequestSchema.extend({
  id: z.number().int(),
});

export type CreatePositionRequest = z.infer<typeof CreatePositionRequestSchema>;
export type UpdatePositionRequest = z.infer<typeof UpdatePositionRequestSchema>;
export type Position = z.infer<typeof PositionSchema>;
export type PositionRoleCategory = z.infer<typeof PositionRoleCategorySchema>;
export type GetPositionsResponse = z.infer<typeof GetPositionsResponseSchema>;
