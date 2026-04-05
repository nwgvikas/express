"use client";

import { Toaster } from "sonner";

export function BackofficeToaster() {
  return (
    <Toaster
      position="top-center"
      richColors
      closeButton
      toastOptions={{ classNames: { title: "font-semibold", description: "text-sm" } }}
    />
  );
}
