import Link from "next/link";
import { redirect } from "next/navigation";
import { BookOpen, LogOut, ShieldCheck } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { signOutAction } from "@/app/actions/auth";
import { DishionaryLogo } from "@/components/brand/dishionary-logo";
import { ThemeToggle } from "@/components/layout/theme-toggle";

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const displayName =
    user.user_metadata?.display_name ||
    user.user_metadata?.full_name ||
    user.user_metadata?.name ||
    user.email?.split("@")[0] ||
    "Home Chef";

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <header className="sticky top-0 z-30 border-b border-border bg-background/95 backdrop-blur-xs">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link href="/dashboard" aria-label="Dishionary Dashboard">
            <DishionaryLogo size="sm" />
          </Link>

          <div className="flex items-center gap-3">
            <ThemeToggle />
            <form action={signOutAction}>
              <button
                type="submit"
                className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-surface px-3.5 py-2 text-xs font-medium text-foreground transition-colors hover:bg-surface-muted"
              >
                <LogOut className="h-3.5 w-3.5" strokeWidth={1.75} />
                <span>Sign Out</span>
              </button>
            </form>
          </div>
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-7xl flex-1 flex-col px-4 py-10 sm:px-6 lg:px-8">
        <div className="rounded-2xl border border-border bg-surface p-6 shadow-xs sm:p-8">
          <div className="inline-flex items-center gap-2 rounded-full border border-border bg-surface-muted px-3 py-1 text-xs font-medium text-secondary-accent">
            <ShieldCheck className="h-3.5 w-3.5" strokeWidth={1.75} />
            <span>Authenticated Cookbook Session</span>
          </div>

          <h1 className="mt-4 font-serif text-2xl font-semibold text-foreground sm:text-3xl">
            Welcome to your cookbook, {displayName}
          </h1>

          <p className="mt-2 text-sm text-muted-foreground">
            Signed in as{" "}
            <span className="font-mono text-foreground">{user.email}</span>.
            Your private PostgreSQL cookbook workspace is active and isolated
            with Row-Level Security.
          </p>

          <div className="mt-8 rounded-xl border border-dashed border-border bg-surface-muted/40 p-8 text-center">
            <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-xl border border-border bg-surface text-primary">
              <BookOpen className="h-5 w-5" strokeWidth={1.75} />
            </div>
            <h2 className="mt-3 font-serif text-lg font-medium text-foreground">
              Your Recipe Collection
            </h2>
            <p className="mx-auto mt-1 max-w-md text-xs leading-relaxed text-muted-foreground">
              Recipe creation, Markdown authoring, and Grid/List card views
              unlock in Phase 3 &amp; Phase 4.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
