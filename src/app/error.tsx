"use client";

import { useEffect } from "react";
import { AlertTriangle, RotateCcw } from "lucide-react";
import { DishionaryLogo } from "@/components/brand/dishionary-logo";

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Unhandled application error:", error);
  }, [error]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4 text-center text-foreground">
      <DishionaryLogo size="md" className="mb-8" />
      <div className="mx-auto max-w-md rounded-2xl border border-border bg-surface p-8 shadow-xs">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl border border-border bg-surface-muted text-destructive">
          <AlertTriangle className="h-6 w-6" strokeWidth={1.75} />
        </div>
        <h1 className="mt-4 font-serif text-2xl font-semibold text-foreground">
          Something went wrong in the kitchen
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          An unexpected error occurred while rendering this view. Your cookbook
          data is safe.
        </p>
        <div className="mt-6">
          <button
            type="button"
            onClick={reset}
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary-hover"
          >
            <RotateCcw className="h-4 w-4" strokeWidth={1.75} />
            <span>Try Again</span>
          </button>
        </div>
      </div>
    </div>
  );
}
