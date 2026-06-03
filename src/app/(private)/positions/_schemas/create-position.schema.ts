import { z } from "zod";

import { POSITION_ROLES } from "../_constants/constants";

export const CREATE_POSITION_PERMISSIONS = [
  "manage_staffs",
  "manage_positions",
  "view_reports",
  "manage_schedules",
  "create_orders",
  "view_customers",
] as const;

export const CreatePositionSchema = z.object({
  position_name: z
    .string()
    .min(1, "Vui lòng nhập tên chức vụ")
    .max(100, "Tên chức vụ tối đa 100 ký tự"),

  role: z.enum(POSITION_ROLES, {
    error: "Vui lòng chọn role",
  }),

  description: z
    .string()
    .min(1, "Vui lòng nhập mô tả quyền")
    .max(300, "Mô tả tối đa 300 ký tự"),

  permissions: z.array(z.enum(CREATE_POSITION_PERMISSIONS)),
});

export type CreatePositionFormValues = z.infer<
  typeof CreatePositionSchema
>;