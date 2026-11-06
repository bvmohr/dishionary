"use client";

import * as React from "react";
import Link from "next/link";
import { User, Mail, Lock, ArrowRight, AlertCircle } from "lucide-react";
import { registerWithEmailAction } from "@/app/actions/auth";
import { GoogleOidcButton } from "@/components/auth/google-oidc-button";

export default function RegisterPage() {
  const [error, setError] = React.useState<string | null>(null);
  const [isPending, startTransition] = React.useTransition();

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    const formData = new FormData(event.currentTarget);

    startTransition(async () => {
      const result = await registerWithEmailAction(formData);
      if (result?.error) {
        setError(result.error);
      }
    });
  };

  return (
    <div>
      <div className="text-center">
        <h1 className="font-serif text-2xl font-semibold text-foreground sm:text-3xl">
          Start your cookbook
        </h1>
        <p className="mt-1.5 text-sm text-muted-foreground">
          Create a private account to curate and share your recipes.
        </p>
      </div>

      <div className="mt-6">
        <GoogleOidcButton label="Sign up with Google" />
      </div>

      <div className="my-6 flex items-center gap-3">
        <div className="h-px flex-1 bg-border" />
        <span className="font-mono text-xs text-muted-foreground uppercase">
          or register with email
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
            htmlFor="displayName"
            className="block text-xs font-medium text-foreground"
          >
            Display Name
          </label>
          <div className="relative mt-1.5">
            <User
              className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground"
              strokeWidth={1.75}
            />
            <input
              id="displayName"
              name="displayName"
              type="text"
              autoComplete="name"
              required
              placeholder="Chef Julia"
              className="w-full rounded-lg border border-border bg-background py-2.5 pr-3.5 pl-9 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
            />
          </div>
        </div>

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
          <label
            htmlFor="password"
            className="block text-xs font-medium text-foreground"
          >
            Password
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
            Confirm Password
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
              placeholder="Re-enter your password"
              className="w-full rounded-lg border border-border bg-background py-2.5 pr-3.5 pl-9 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={isPending}
          className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-60"
        >
          <span>{isPending ? "Creating account..." : "Create Account"}</span>
          <ArrowRight className="h-4 w-4" strokeWidth={1.75} />
        </button>
      </form>

      <p className="mt-6 text-center text-xs text-muted-foreground">
        Already have an account?{" "}
        <Link
          href="/login"
          className="font-medium text-primary hover:text-primary-hover"
        >
          Sign in
        </Link>
      </p>
    </div>
  );
}
