import Link from "next/link";
import { redirect } from "next/navigation";
import {
  BookOpen,
  LogOut,
  Plus,
  Clock,
  Heart,
  Edit3,
  ArrowRight,
} from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { signOutAction } from "@/app/actions/auth";
import { DishionaryLogo } from "@/components/brand/dishionary-logo";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { formatDuration } from "@/lib/utils";

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

  const { data: userRecipes } = await supabase
    .from("recipes")
    .select(
      "id, title, summary, image_url, prep_time_minutes, cook_time_minutes, category, is_favorite, updated_at"
    )
    .eq("user_id", user.id)
    .order("updated_at", { ascending: false });

  const recipesList = userRecipes ?? [];

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <header className="sticky top-0 z-30 border-b border-border bg-background/95 backdrop-blur-xs">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link href="/dashboard" aria-label="Dishionary Dashboard">
            <DishionaryLogo size="sm" />
          </Link>

          <div className="flex items-center gap-2.5 sm:gap-3">
            <ThemeToggle />
            <Link
              href="/cookbook/new"
              className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3.5 py-2 text-xs font-medium text-primary-foreground transition-colors hover:bg-primary-hover"
            >
              <Plus className="h-3.5 w-3.5" strokeWidth={1.75} />
              <span>New Recipe</span>
            </Link>
            <form action={signOutAction}>
              <button
                type="submit"
                className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-surface px-3.5 py-2 text-xs font-medium text-foreground transition-colors hover:bg-surface-muted"
              >
                <LogOut className="h-3.5 w-3.5" strokeWidth={1.75} />
                <span className="hidden sm:inline">Sign Out</span>
              </button>
            </form>
          </div>
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-7xl flex-1 flex-col px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border pb-6">
          <div>
            <h1 className="font-serif text-2xl font-semibold text-foreground sm:text-3xl">
              {displayName}&apos;s Cookbook
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              {recipesList.length}{" "}
              {recipesList.length === 1 ? "recipe" : "recipes"} saved in your
              private collection.
            </p>
          </div>

          <Link
            href="/cookbook/new"
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary-hover"
          >
            <Plus className="h-4 w-4" strokeWidth={1.75} />
            <span>Create Recipe</span>
          </Link>
        </div>

        {recipesList.length === 0 ? (
          <div className="mt-8 rounded-2xl border border-dashed border-border bg-surface p-10 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl border border-border bg-surface-muted text-primary">
              <BookOpen className="h-6 w-6" strokeWidth={1.75} />
            </div>
            <h2 className="mt-4 font-serif text-xl font-semibold text-foreground">
              Your cookbook is ready for your first dish
            </h2>
            <p className="mx-auto mt-1.5 max-w-md text-sm leading-relaxed text-muted-foreground">
              Create your first recipe with structured ingredients, cook times,
              dish photography, and clean Markdown instructions.
            </p>
            <div className="mt-6">
              <Link
                href="/cookbook/new"
                className="inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary-hover"
              >
                <Plus className="h-4 w-4" strokeWidth={1.75} />
                <span>Add Your First Recipe</span>
              </Link>
            </div>
          </div>
        ) : (
          <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {recipesList.map((recipe) => {
              const totalTime =
                (recipe.prep_time_minutes ?? 0) +
                (recipe.cook_time_minutes ?? 0);

              return (
                <article
                  key={recipe.id}
                  className="group flex flex-col justify-between overflow-hidden rounded-2xl border border-border bg-surface shadow-2xs transition-colors hover:border-primary/50"
                >
                  <div>
                    {recipe.image_url ? (
                      <div className="relative h-44 w-full border-b border-border bg-surface-muted">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={recipe.image_url}
                          alt={recipe.title}
                          className="h-full w-full object-cover"
                        />
                        {recipe.is_favorite && (
                          <span className="absolute top-3 right-3 inline-flex h-8 w-8 items-center justify-center rounded-full border border-border bg-surface/90 text-primary">
                            <Heart
                              className="h-4 w-4"
                              strokeWidth={1.75}
                              fill="currentColor"
                            />
                          </span>
                        )}
                      </div>
                    ) : (
                      <div className="flex h-32 items-center justify-between border-b border-border bg-surface-muted/50 px-5">
                        <span className="rounded-md bg-secondary-accent/15 px-2.5 py-1 text-xs font-medium text-secondary-accent">
                          {recipe.category}
                        </span>
                        {recipe.is_favorite && (
                          <Heart
                            className="h-4 w-4 text-primary"
                            strokeWidth={1.75}
                            fill="currentColor"
                          />
                        )}
                      </div>
                    )}

                    <div className="p-5">
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span className="font-medium text-secondary-accent">
                          {recipe.category}
                        </span>
                        <span className="inline-flex items-center gap-1 font-mono">
                          <Clock className="h-3.5 w-3.5" strokeWidth={1.75} />
                          {formatDuration(totalTime)}
                        </span>
                      </div>

                      <h2 className="mt-2 font-serif text-xl font-semibold text-foreground">
                        <Link
                          href={`/cookbook/${recipe.id}`}
                          className="hover:text-primary"
                        >
                          {recipe.title}
                        </Link>
                      </h2>

                      {recipe.summary && (
                        <p className="mt-1.5 line-clamp-2 text-xs leading-relaxed text-muted-foreground">
                          {recipe.summary}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-between border-t border-border bg-surface-muted/30 px-5 py-3 text-xs">
                    <Link
                      href={`/cookbook/${recipe.id}/edit`}
                      className="inline-flex items-center gap-1 font-medium text-muted-foreground hover:text-foreground"
                    >
                      <Edit3 className="h-3.5 w-3.5" strokeWidth={1.75} />
                      <span>Edit</span>
                    </Link>

                    <Link
                      href={`/cookbook/${recipe.id}`}
                      className="inline-flex items-center gap-1 font-medium text-primary hover:text-primary-hover"
                    >
                      <span>Open Recipe</span>
                      <ArrowRight className="h-3.5 w-3.5" strokeWidth={1.75} />
                    </Link>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
