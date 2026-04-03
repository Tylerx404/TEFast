import { proxyApiFetch } from "@/lib/api/client";
import type { UploadFileItem } from "@/types/domain";

export async function uploadTeacherSingleFile(formData: FormData) {
  return proxyApiFetch<UploadFileItem>(`/api/proxy/upload/single`, {
    method: "POST",
    body: formData,
  });
}

export async function uploadTeacherMultipleFiles(formData: FormData) {
  return proxyApiFetch<UploadFileItem[]>(`/api/proxy/upload/multiple`, {
    method: "POST",
    body: formData,
  });
}
