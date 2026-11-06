"use client";

import * as React from "react";
import { Lock, ArrowRight, AlertCircle } from "lucide-react";
import { updatePasswordAction } from "@/app/actions/auth";

export default function ResetPasswordPage() {
  const [error, setError] = React.useState<string | null>(null);
  const [isPending, startTransition] = React.useTransition();

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    const formData = new FormData(event.currentTarget);

    startTransition(async () => {
      const result = await updatePasswordAction(formData);
      if (result?.error) {
        setError(result.error);
      }
    });
  };

  return (
    <div>
      <div className="text-center">
        <h1 className="font-serif text-2xl font-semibold text-foreground sm:text-3xl">
          Choose a new password
        </h1>
        <p className="mt-1.5 text-sm text-muted-foreground">
          Enter and confirm your new password below.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="mt-6 space-y-4" noValidate>
        {error && (
          <div
            role="alert"
            className="flex items-start gap-2.5 rounded-lg border border-destructive/40 bg-destructive/10 p-3 text-xs text-destructive"
          >
            <AlertCircle
              className="mt-0.5 h-4 w-4 shrink-0"
              strokeWidth={1.75}
            />
            <span>{error}</span>
          </div>
        )}

        <div>
          <label
            htmlFor="password"
            className="block text-xs font-medium text-foreground"
          >
            New Password
          </label>
          <div className="relative mt-1.5">
            <Lock
              className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground"
              strokeWidth={1.75}
            />
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="new-password"
              required
              placeholder="At least 8 characters"
              className="w-full rounded-lg border border-border bg-background py-2.5 pr-3.5 pl-9 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
            />
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            Must include uppercase, lowercase, and a number or symbol.
          </p>
        </div>

        <div>
          <label
            htmlFor="confirmPassword"
            className="block text-xs font-medium text-foreground"
          >
            Confirm New Password
          </label>
          <div className="relative mt-1.5">
            <Lock
              className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground"
              strokeWidth={1.75}
            />
            <input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              autoComplete="new-password"
              required
              placeholder="Re-enter your new password"
              className="w-full rounded-lg border border-border bg-background py-2.5 pr-3.5 pl-9 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={isPending}
          className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-60"
        >
          <span>{isPending ? "Updating password..." : "Update Password"}</span>
          <ArrowRight className="h-4 w-4" strokeWidth={1.75} />
        </button>
      </form>
    </div>
  );
}
