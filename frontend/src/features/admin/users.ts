import { buildQueryString, proxyApiFetch } from "@/lib/api/client";
import { safeServerApiFetch } from "@/lib/api/server";
import type {
  AdminUserDetail,
  AdminUserListItem,
  AdminUserRoleUpdateInput,
  SystemHealth,
} from "@/types/domain";
import type { AdminUserFilters } from "@/types/forms";

export async function getAdminUsers(filters: AdminUserFilters = {}) {
  return safeServerApiFetch<AdminUserListItem[]>(
    `/users${buildQueryString(filters)}`,
    undefined,
    { auth: true },
  );
}

export async function getAdminUser(userId: string) {
  return safeServerApiFetch<AdminUserDetail>(`/users/${userId}`, undefined, {
    auth: true,
  });
}

export async function updateAdminUserRole(
  userId: string,
  payload: AdminUserRoleUpdateInput,
) {
  return proxyApiFetch(`/api/proxy/users/${userId}/role`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

export async function getSystemHealth() {
  return safeServerApiFetch<SystemHealth>(`/health`);
}
