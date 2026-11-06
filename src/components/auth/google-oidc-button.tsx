"use client";

import * as React from "react";
import { signInWithGoogleAction } from "@/app/actions/auth";

export function GoogleOidcButton({
  label = "Continue with Google",
}: {
  label?: string;
}) {
  const [isPending, startTransition] = React.useTransition();
  const [error, setError] = React.useState<string | null>(null);

  const handleGoogleSignIn = () => {
    setError(null);
    startTransition(async () => {
      const result = await signInWithGoogleAction();
      if (result?.error) {
        setError(result.error);
      }
    });
  };

  return (
    <div>
      <button
        type="button"
        onClick={handleGoogleSignIn}
        disabled={isPending}
        className="inline-flex w-full items-center justify-center gap-2.5 rounded-lg border border-border bg-surface px-4 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-surface-muted disabled:cursor-not-allowed disabled:opacity-60"
      >
        <svg
          viewBox="0 0 24 24"
          className="h-4 w-4 shrink-0"
          aria-hidden="true"
        >
          <path
            d="M21.805 10.023h-9.62v3.957h5.524c-.239 1.277-.963 2.359-2.052 3.084v2.56h3.321c1.944-1.79 3.065-4.43 3.065-7.619 0-.664-.06-1.317-.238-1.982z"
            fill="#4285F4"
          />
          <path
            d="M12.185 22c2.775 0 5.107-.916 6.809-2.486l-3.321-2.56c-.921.619-2.101.988-3.488.988-2.681 0-4.953-1.81-5.764-4.244H2.992v2.642C4.687 19.708 8.157 22 12.185 22z"
            fill="#34A853"
          />
          <path
            d="M6.421 13.698a6.128 6.128 0 0 1 0-3.896V7.16H2.992a10.261 10.261 0 0 0 0 9.18l3.429-2.642z"
            fill="#FBBC05"
          />
          <path
            d="M12.185 5.558c1.51 0 2.866.52 3.934 1.54l2.948-2.948C17.286 2.49 14.959 1.5 12.185 1.5 8.157 1.5 4.687 3.792 2.992 7.16l3.429 2.642c.811-2.434 3.083-4.244 5.764-4.244z"
            fill="#EA4335"
          />
        </svg>
        <span>{isPending ? "Connecting to Google..." : label}</span>
      </button>

      {error && (
        <p role="alert" className="mt-2 text-xs text-destructive">
          {error}
        </p>
      )}
    </div>
  );
}
