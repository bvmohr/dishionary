"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Clock,
  Users,
  Heart,
  Edit3,
  Trash2,
  Maximize2,
  Minimize2,
  Check,
  ArrowLeft,
  ChefHat,
} from "lucide-react";
import { formatDuration } from "@/lib/utils";
import {
  deleteRecipeAction,
  toggleFavoriteRecipeAction,
} from "@/app/actions/recipes";
import type { RecipeIngredientInput } from "@/lib/validations/recipe";
import { RecipeMarkdownRenderer } from "./recipe-markdown-renderer";

export interface RecipeDetailRecord {
  id: string;
  title: string;
  summary: string | null;
  imageUrl: string | null;
  prepTimeMinutes: number;
  cookTimeMinutes: number;
  servings: number;
  difficulty: string;
  category: string;
  tags: string[];
  ingredients: RecipeIngredientInput[];
  instructionsMarkdown: string;
  isFavorite: boolean;
}

export function RecipeDetailView({ recipe }: { recipe: RecipeDetailRecord }) {
  const router = useRouter();
  const [isFavorite, setIsFavorite] = React.useState(recipe.isFavorite);
  const [checkedIngredients, setCheckedIngredients] = React.useState<
    Record<string, boolean>
  >({});
  const [isFullscreen, setIsFullscreen] = React.useState(false);
  const [confirmDelete, setConfirmDelete] = React.useState(false);
  const [isPending, startTransition] = React.useTransition();

  const totalMinutes = recipe.prepTimeMinutes + recipe.cookTimeMinutes;

  const toggleIngredientCheck = (id: string) => {
    setCheckedIngredients((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const handleToggleFavorite = () => {
    const nextState = !isFavorite;
    setIsFavorite(nextState);
    startTransition(async () => {
      const res = await toggleFavoriteRecipeAction(recipe.id, nextState);
      if (res.error) {
        setIsFavorite(!nextState);
      }
    });
  };

  const handleDelete = () => {
    startTransition(async () => {
      const res = await deleteRecipeAction(recipe.id);
      if (!res.error) {
        router.push("/dashboard");
        router.refresh();
      }
    });
  };

  return (
    <article
      className={
        isFullscreen
          ? "fixed inset-0 z-50 overflow-y-auto bg-background p-4 sm:p-8 lg:p-12"
          : "mx-auto w-full max-w-5xl"
      }
    >
      {/* Top Action Bar */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" strokeWidth={1.75} />
          <span>Back to Cookbook Dashboard</span>
        </Link>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={handleToggleFavorite}
            aria-label={
              isFavorite ? "Remove from favorites" : "Add to favorites"
            }
            className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors ${
              isFavorite
                ? "border-primary bg-primary/10 text-primary"
                : "border-border bg-surface text-foreground hover:bg-surface-muted"
            }`}
          >
            <Heart
              className="h-3.5 w-3.5"
              strokeWidth={1.75}
              fill={isFavorite ? "currentColor" : "none"}
            />
            <span>{isFavorite ? "Favorited" : "Favorite"}</span>
          </button>

          <button
            type="button"
            onClick={() => setIsFullscreen((prev) => !prev)}
            className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-surface px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:bg-surface-muted"
          >
            {isFullscreen ? (
              <>
                <Minimize2 className="h-3.5 w-3.5" strokeWidth={1.75} />
                <span>Exit Fullscreen</span>
              </>
            ) : (
              <>
                <Maximize2 className="h-3.5 w-3.5" strokeWidth={1.75} />
                <span>Fullscreen Mode</span>
              </>
            )}
          </button>

          <Link
            href={`/cookbook/${recipe.id}/edit`}
            className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-surface px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:bg-surface-muted"
          >
            <Edit3 className="h-3.5 w-3.5" strokeWidth={1.75} />
            <span>Edit</span>
          </Link>

          {!confirmDelete ? (
            <button
              type="button"
              onClick={() => setConfirmDelete(true)}
              className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-surface px-3 py-1.5 text-xs font-medium text-destructive transition-colors hover:border-destructive/40 hover:bg-destructive/10"
            >
              <Trash2 className="h-3.5 w-3.5" strokeWidth={1.75} />
              <span>Delete</span>
            </button>
          ) : (
            <div className="inline-flex items-center gap-1.5 rounded-lg border border-destructive/40 bg-destructive/10 px-2.5 py-1 text-xs">
              <span className="font-medium text-destructive">Confirm?</span>
              <button
                type="button"
                disabled={isPending}
                onClick={handleDelete}
                className="rounded bg-destructive px-2 py-0.5 font-medium text-destructive-foreground"
              >
                Yes
              </button>
              <button
                type="button"
                onClick={() => setConfirmDelete(false)}
                className="rounded bg-surface px-2 py-0.5 text-foreground"
              >
                No
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Recipe Card Container */}
      <div className="overflow-hidden rounded-2xl border border-border bg-surface shadow-xs">
        {/* Optional Hero Image Banner */}
        {recipe.imageUrl && (
          <div className="relative h-64 w-full border-b border-border bg-surface-muted sm:h-80">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={recipe.imageUrl}
              alt={recipe.title}
              className="h-full w-full object-cover"
            />
          </div>
        )}

        <div className="p-6 sm:p-8 lg:p-10">
          {/* Header Metadata */}
          <div className="flex flex-wrap items-start justify-between gap-4 border-b border-border pb-6">
            <div className="max-w-2xl">
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center rounded-md bg-secondary-accent/15 px-2.5 py-1 text-xs font-medium text-secondary-accent">
                  {recipe.category}
                </span>
                <span className="inline-flex items-center gap-1 rounded-md border border-border bg-surface-muted px-2.5 py-1 text-xs capitalize text-muted-foreground">
                  <ChefHat className="h-3 w-3" strokeWidth={1.75} />
                  {recipe.difficulty}
                </span>
              </div>

              <h1 className="mt-3 font-serif text-3xl font-semibold text-foreground sm:text-4xl">
                {recipe.title}
              </h1>

              {recipe.summary && (
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground sm:text-base">
                  {recipe.summary}
                </p>
              )}

              {recipe.tags.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {recipe.tags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full border border-border bg-surface-muted px-2.5 py-0.5 font-mono text-xs text-muted-foreground"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Prep / Cook / Total / Servings Box */}
            <div className="flex w-full items-center justify-around gap-3 rounded-xl border border-border bg-surface-muted px-4 py-3 font-mono text-xs sm:w-auto sm:justify-start sm:gap-5">
              <div>
                <span className="block text-muted-foreground">PREP</span>
                <span className="font-semibold text-foreground">
                  {formatDuration(recipe.prepTimeMinutes)}
                </span>
              </div>
              <div className="h-7 w-px bg-border" />
              <div>
                <span className="block text-muted-foreground">COOK</span>
                <span className="font-semibold text-foreground">
                  {formatDuration(recipe.cookTimeMinutes)}
                </span>
              </div>
              <div className="h-7 w-px bg-border" />
              <div>
                <span className="block text-muted-foreground">TOTAL</span>
                <span className="inline-flex items-center gap-1 font-semibold text-primary">
                  <Clock className="h-3 w-3" strokeWidth={1.75} />
                  {formatDuration(totalMinutes)}
                </span>
              </div>
              <div className="h-7 w-px bg-border" />
              <div>
                <span className="block text-muted-foreground">SERVES</span>
                <span className="inline-flex items-center gap-1 font-semibold text-foreground">
                  <Users className="h-3 w-3" strokeWidth={1.75} />
                  {recipe.servings}
                </span>
              </div>
            </div>
          </div>

          {/* Two-Column Split: Interactive Ingredients + Sanitized Markdown Instructions */}
          <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-12">
            {/* Left Column: Interactive Ingredient Checklist */}
            <div className="lg:col-span-4">
              <h2 className="font-serif text-xl font-semibold text-foreground">
                Ingredients
              </h2>
              <p className="mt-0.5 text-xs text-muted-foreground">
                Click any ingredient to check it off as you prep.
              </p>

              <ul className="mt-4 space-y-2.5 text-sm">
                {recipe.ingredients.map((ing) => {
                  const isChecked = !!checkedIngredients[ing.id];
                  const label = [ing.amount, ing.unit, ing.item]
                    .filter(Boolean)
                    .join(" ");

                  return (
                    <li key={ing.id}>
                      <button
                        type="button"
                        onClick={() => toggleIngredientCheck(ing.id)}
                        className="flex w-full items-start gap-2.5 rounded-xl border border-border bg-surface-muted/40 px-3.5 py-2.5 text-left transition-colors hover:bg-surface-muted"
                      >
                        <span
                          className={`mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded border ${
                            isChecked
                              ? "border-primary bg-primary text-primary-foreground"
                              : "border-border bg-surface"
                          }`}
                        >
                          {isChecked && (
                            <Check className="h-3 w-3" strokeWidth={2.25} />
                          )}
                        </span>
                        <span
                          className={
                            isChecked
                              ? "text-muted-foreground line-through"
                              : "text-foreground"
                          }
                        >
                          {label}
                          {ing.notes ? (
                            <span className="text-muted-foreground">
                              {" "}
                              ({ing.notes})
                            </span>
                          ) : null}
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>

            {/* Right Column: Sanitized Markdown Instructions */}
            <div className="lg:col-span-8">
              <div className="flex items-center justify-between border-b border-border pb-2">
                <h2 className="font-serif text-xl font-semibold text-foreground">
                  Instructions
                </h2>
                <span className="font-mono text-xs text-muted-foreground">
                  Markdown
                </span>
              </div>

              <div className="mt-4">
                <RecipeMarkdownRenderer
                  markdown={recipe.instructionsMarkdown}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}
