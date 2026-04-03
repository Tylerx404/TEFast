import { proxyApiFetch } from "@/lib/api/client";
import type { AdminUserRoleUpdateInput } from "@/types/domain";

export async function updateAdminUserRole(
  userId: string,
  payload: AdminUserRoleUpdateInput,
) {
  return proxyApiFetch(`/api/proxy/users/${userId}/role`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}
