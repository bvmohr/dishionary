import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { Plus } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { DishionaryLogo } from "@/components/brand/dishionary-logo";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import {
  RecipeDetailView,
  type RecipeDetailRecord,
} from "@/components/cookbook/recipe-detail-view";
import type { RecipeIngredientInput } from "@/lib/validations/recipe";

export default async function RecipeDetailPage({
  params,
}: {
  params: Promise<{ recipeId: string }>;
}) {
  const { recipeId } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: row, error } = await supabase
    .from("recipes")
    .select("*")
    .eq("id", recipeId)
    .eq("user_id", user.id)
    .single();

  if (error || !row) {
    notFound();
  }

  const recipe: RecipeDetailRecord = {
    id: row.id,
    title: row.title,
    summary: row.summary,
    imageUrl: row.image_url,
    prepTimeMinutes: row.prep_time_minutes ?? 0,
    cookTimeMinutes: row.cook_time_minutes ?? 0,
    servings: row.servings ?? 2,
    difficulty: (row.difficulty ?? "medium") as "easy" | "medium" | "hard",
    category: row.category ?? "Main Course",
    tags: Array.isArray(row.tags) ? row.tags : [],
    ingredients: Array.isArray(row.ingredients)
      ? (row.ingredients as RecipeIngredientInput[])
      : [],
    instructionsMarkdown: row.instructions_markdown ?? "",
    isFavorite: Boolean(row.is_favorite),
  };

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <header className="sticky top-0 z-30 border-b border-border bg-background/95 backdrop-blur-xs">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link href="/dashboard" aria-label="Dishionary Dashboard">
            <DishionaryLogo size="sm" />
          </Link>

          <div className="flex items-center gap-3">
            <ThemeToggle />
            <Link
              href="/cookbook/new"
              className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3.5 py-2 text-xs font-medium text-primary-foreground transition-colors hover:bg-primary-hover"
            >
              <Plus className="h-3.5 w-3.5" strokeWidth={1.75} />
              <span>New Recipe</span>
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:px-6 lg:px-8">
        <RecipeDetailView recipe={recipe} />
      </main>
    </div>
  );
}
