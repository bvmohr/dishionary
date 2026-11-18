import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { DishionaryLogo } from "@/components/brand/dishionary-logo";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { HybridRecipeForm } from "@/components/cookbook/hybrid-recipe-form";

export default async function NewRecipePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <header className="sticky top-0 z-30 border-b border-border bg-background/95 backdrop-blur-xs">
        <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link href="/dashboard" aria-label="Dishionary Dashboard">
            <DishionaryLogo size="sm" />
          </Link>
          <ThemeToggle />
        </div>
      </header>

      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-6">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" strokeWidth={1.75} />
            <span>Back to Cookbook Dashboard</span>
          </Link>
          <h1 className="mt-3 font-serif text-3xl font-semibold text-foreground">
            Create New Recipe
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Enter your recipe metadata, dish photo, and structured ingredients,
            then format your cooking instructions in Markdown.
          </p>
        </div>

        <HybridRecipeForm mode="create" userId={user.id} />
      </main>
    </div>
  );
}
