"use client";

import { Toaster as RHTToaster } from "react-hot-toast";

export default function Toaster() {
  return (
    <RHTToaster
      position="top-center"
      toastOptions={{
        duration: 4000,
        style: {
          background: "var(--toast-bg, #1f2937)",
          color: "var(--toast-fg, #f9fafb)",
          borderRadius: "0.5rem",
          border: "1px solid var(--toast-border, #374151)",
        },
        success: {
          iconTheme: {
            primary: "#22c55e",
            secondary: "#f9fafb",
          },
        },
        error: {
          iconTheme: {
            primary: "#ef4444",
            secondary: "#f9fafb",
          },
        },
      }}
    />
  );
}
