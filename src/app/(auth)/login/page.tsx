"use client";

import * as React from "react";
import Link from "next/link";
import { Mail, Lock, ArrowRight, AlertCircle } from "lucide-react";
import { signInWithPasswordAction } from "@/app/actions/auth";
import { GoogleOidcButton } from "@/components/auth/google-oidc-button";

export default function LoginPage() {
  const [error, setError] = React.useState<string | null>(null);
  const [isPending, startTransition] = React.useTransition();

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    const formData = new FormData(event.currentTarget);

    startTransition(async () => {
      const result = await signInWithPasswordAction(formData);
      if (result?.error) {
        setError(result.error);
      }
    });
  };

  return (
    <div>
      <div className="text-center">
        <h1 className="font-serif text-2xl font-semibold text-foreground sm:text-3xl">
          Welcome back
        </h1>
        <p className="mt-1.5 text-sm text-muted-foreground">
          Sign in to open your personal cookbook.
        </p>
      </div>

      <div className="mt-6">
        <GoogleOidcButton label="Sign in with Google" />
      </div>

      <div className="my-6 flex items-center gap-3">
        <div className="h-px flex-1 bg-border" />
        <span className="font-mono text-xs text-muted-foreground uppercase">
          or with email
        </span>
        <div className="h-px flex-1 bg-border" />
      </div>

      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
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

        <div>
          <div className="flex items-center justify-between">
            <label
              htmlFor="password"
              className="block text-xs font-medium text-foreground"
            >
              Password
            </label>
            <Link
              href="/forgot-password"
              className="text-xs font-medium text-primary hover:text-primary-hover"
            >
              Forgot password?
            </Link>
          </div>
          <div className="relative mt-1.5">
            <Lock
              className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground"
              strokeWidth={1.75}
            />
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              placeholder="Enter your password"
              className="w-full rounded-lg border border-border bg-background py-2.5 pr-3.5 pl-9 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={isPending}
          className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-60"
        >
          <span>{isPending ? "Signing in..." : "Sign In"}</span>
          <ArrowRight className="h-4 w-4" strokeWidth={1.75} />
        </button>
      </form>

      <p className="mt-6 text-center text-xs text-muted-foreground">
        Don&apos;t have a cookbook yet?{" "}
        <Link
          href="/register"
          className="font-medium text-primary hover:text-primary-hover"
        >
          Create a free account
        </Link>
      </p>
    </div>
  );
}
