import { z } from "zod";

export const adminRoleSchema = z.object({
  role: z.enum(["STUDENT", "TEACHER", "ADMIN"]),
});
