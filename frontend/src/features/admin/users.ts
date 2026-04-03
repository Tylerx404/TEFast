import { buildQueryString, proxyApiFetch } from "@/lib/api/client";
import type {
  AdminUserDetail,
  AdminUserListItem,
  AdminUserRoleUpdateInput,
  SystemHealth,
} from "@/types/domain";
import type { AdminUserFilters } from "@/types/forms";

async function getSafeServerApiFetch() {
  const { safeServerApiFetch } = await import("@/lib/api/server");
  return safeServerApiFetch;
}

export async function getAdminUsers(filters: AdminUserFilters = {}) {
  const safeServerApiFetch = await getSafeServerApiFetch();
  return safeServerApiFetch<AdminUserListItem[]>(
    `/users${buildQueryString(filters)}`,
    undefined,
    { auth: true },
  );
}

export async function getAdminUser(userId: string) {
  const safeServerApiFetch = await getSafeServerApiFetch();
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
  const safeServerApiFetch = await getSafeServerApiFetch();
  return safeServerApiFetch<SystemHealth>(`/health`);
}
