"use client";

import * as React from "react";
import Link from "next/link";
import {
  Mail,
  ArrowLeft,
  ArrowRight,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";
import { requestPasswordResetAction } from "@/app/actions/auth";

export default function ForgotPasswordPage() {
  const [error, setError] = React.useState<string | null>(null);
  const [success, setSuccess] = React.useState<string | null>(null);
  const [isPending, startTransition] = React.useTransition();

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setSuccess(null);
    const formData = new FormData(event.currentTarget);

    startTransition(async () => {
      const result = await requestPasswordResetAction(formData);
      if (result?.error) {
        setError(result.error);
      } else if (result?.success) {
        setSuccess(result.success);
      }
    });
  };

  return (
    <div>
      <div className="text-center">
        <h1 className="font-serif text-2xl font-semibold text-foreground sm:text-3xl">
          Reset your password
        </h1>
        <p className="mt-1.5 text-sm text-muted-foreground">
          Enter your email and we will send you a secure recovery link.
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

        {success && (
          <div
            role="status"
            className="flex items-start gap-2.5 rounded-lg border border-secondary-accent/40 bg-secondary-accent/10 p-3 text-xs text-secondary-accent"
          >
            <CheckCircle2
              className="mt-0.5 h-4 w-4 shrink-0"
              strokeWidth={1.75}
            />
            <span>{success}</span>
          </div>
        )}

        <div>
          <label
            htmlFor="email"
            className="block text-xs font-medium text-foreground"
          >
            Email Address
          </label>
          <div className="relative mt-1.5">
            <Mail
              className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground"
              strokeWidth={1.75}
            />
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              placeholder="chef@example.com"
              className="w-full rounded-lg border border-border bg-background py-2.5 pr-3.5 pl-9 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={isPending}
          className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-60"
        >
          <span>{isPending ? "Sending link..." : "Send Recovery Link"}</span>
          <ArrowRight className="h-4 w-4" strokeWidth={1.75} />
        </button>
      </form>

      <div className="mt-6 text-center">
        <Link
          href="/login"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-3.5 w-3.5" strokeWidth={1.75} />
          <span>Back to Sign In</span>
        </Link>
      </div>
    </div>
  );
}
