"use client";

import { Toaster } from "sonner";

export function Sonner() {
  return (
    <Toaster
      position="top-right"
      richColors
      toastOptions={{
        classNames: {
          toast: "!rounded-3xl !border !border-[hsl(var(--border))] !bg-[hsl(var(--card))] !text-[hsl(var(--card-foreground))]",
        },
      }}
    />
  );
}
