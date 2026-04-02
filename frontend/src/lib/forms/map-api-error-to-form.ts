import type { FieldValues, Path, UseFormSetError } from "react-hook-form";

import { ApiRequestError } from "@/lib/api/client";

export function mapApiErrorToForm<TFieldValues extends FieldValues>(
  error: unknown,
  setError: UseFormSetError<TFieldValues>,
) {
  if (!(error instanceof ApiRequestError)) {
    return;
  }

  for (const item of error.errors) {
    if (!item.field) {
      continue;
    }

    setError(item.field as Path<TFieldValues>, {
      type: "server",
      message: item.message,
    });
  }
}
