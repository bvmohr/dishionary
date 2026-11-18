import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { DishionaryLogo } from "@/components/brand/dishionary-logo";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { HybridRecipeForm } from "@/components/cookbook/hybrid-recipe-form";
import type { RecipeIngredientInput } from "@/lib/validations/recipe";

export default async function EditRecipePage({
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
            href={`/cookbook/${recipeId}`}
            className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" strokeWidth={1.75} />
            <span>Back to Recipe</span>
          </Link>
          <h1 className="mt-3 font-serif text-3xl font-semibold text-foreground">
            Edit Recipe: {row.title}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Update any field below and save your changes.
          </p>
        </div>

        <HybridRecipeForm
          mode="edit"
          userId={user.id}
          recipeId={row.id}
          initialValues={{
            title: row.title,
            summary: row.summary ?? "",
            imageUrl: row.image_url ?? "",
            imageStoragePath: row.image_storage_path ?? "",
            prepTimeMinutes: row.prep_time_minutes ?? 0,
            cookTimeMinutes: row.cook_time_minutes ?? 0,
            servings: row.servings ?? 2,
            difficulty: (row.difficulty ?? "medium") as
              "easy" | "medium" | "hard",
            category: row.category ?? "Main Course",
            tags: Array.isArray(row.tags) ? row.tags : [],
            ingredients: Array.isArray(row.ingredients)
              ? (row.ingredients as RecipeIngredientInput[])
              : [],
            instructionsMarkdown: row.instructions_markdown ?? "",
            isFavorite: Boolean(row.is_favorite),
          }}
        />
      </main>
    </div>
  );
}
