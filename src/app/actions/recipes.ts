"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { RECIPE_IMAGES_BUCKET } from "@/lib/supabase/storage";
import {
  recipeFormSchema,
  generateRecipeSlug,
  type RecipeFormInput,
} from "@/lib/validations/recipe";

export interface RecipeActionResult {
  error?: string;
  recipeId?: string;
  isFavorite?: boolean;
}

/**
 * Creates a new recipe in the authenticated user's private cookbook.
 * Enforces both server-side user_id assignment and Supabase PostgreSQL RLS.
 */
export async function createRecipeAction(
  input: RecipeFormInput
): Promise<RecipeActionResult> {
  const parsed = recipeFormSchema.safeParse(input);
  if (!parsed.success) {
    return {
      error:
        parsed.error.issues[0]?.message ||
        "Please check the recipe form fields and try again.",
    };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "You must be signed in to create a recipe." };
  }

  const data = parsed.data;
  const slug = generateRecipeSlug(data.title);

  // Ensure the user's profile row exists before inserting into recipes
  await supabase.from("profiles").upsert(
    {
      id: user.id,
      display_name:
        user.user_metadata?.display_name ||
        user.user_metadata?.full_name ||
        user.email?.split("@")[0] ||
        "Home Chef",
    },
    { onConflict: "id", ignoreDuplicates: true }
  );

  const { data: created, error } = await supabase
    .from("recipes")
    .insert({
      user_id: user.id,
      title: data.title,
      slug,
      summary: data.summary || null,
      image_url: data.imageUrl || null,
      image_storage_path: data.imageStoragePath || null,
      prep_time_minutes: data.prepTimeMinutes,
      cook_time_minutes: data.cookTimeMinutes,
      servings: data.servings,
      difficulty: data.difficulty,
      category: data.category,
      tags: data.tags,
      ingredients: data.ingredients,
      instructions_markdown: data.instructionsMarkdown,
      is_favorite: data.isFavorite ?? false,
    })
    .select("id")
    .single();

  if (error || !created) {
    return {
      error: error?.message || "Failed to save recipe to your cookbook.",
    };
  }

  revalidatePath("/dashboard");
  revalidatePath("/cookbook");

  return { recipeId: created.id };
}

/**
 * Updates an existing recipe owned by the authenticated user.
 */
export async function updateRecipeAction(
  recipeId: string,
  input: RecipeFormInput
): Promise<RecipeActionResult> {
  if (!recipeId) {
    return { error: "Recipe ID is required." };
  }

  const parsed = recipeFormSchema.safeParse(input);
  if (!parsed.success) {
    return {
      error:
        parsed.error.issues[0]?.message ||
        "Please check the recipe form fields and try again.",
    };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "You must be signed in to edit a recipe." };
  }

  const data = parsed.data;
  const slug = generateRecipeSlug(data.title);

  const { data: updated, error } = await supabase
    .from("recipes")
    .update({
      title: data.title,
      slug,
      summary: data.summary || null,
      image_url: data.imageUrl || null,
      image_storage_path: data.imageStoragePath || null,
      prep_time_minutes: data.prepTimeMinutes,
      cook_time_minutes: data.cookTimeMinutes,
      servings: data.servings,
      difficulty: data.difficulty,
      category: data.category,
      tags: data.tags,
      ingredients: data.ingredients,
      instructions_markdown: data.instructionsMarkdown,
      is_favorite: data.isFavorite ?? false,
      updated_at: new Date().toISOString(),
    })
    .eq("id", recipeId)
    .eq("user_id", user.id)
    .select("id")
    .single();

  if (error || !updated) {
    return {
      error:
        error?.message ||
        "Unable to update recipe. Ensure you own this recipe.",
    };
  }

  revalidatePath("/dashboard");
  revalidatePath("/cookbook");
  revalidatePath(`/cookbook/${recipeId}`);

  return { recipeId: updated.id };
}

/**
 * Deletes a recipe owned by the authenticated user and removes its uploaded
 * image from the `recipe-images` storage bucket if present.
 */
export async function deleteRecipeAction(
  recipeId: string
): Promise<RecipeActionResult> {
  if (!recipeId) {
    return { error: "Recipe ID is required." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "You must be signed in to delete a recipe." };
  }

  const { data: existing } = await supabase
    .from("recipes")
    .select("id, image_storage_path")
    .eq("id", recipeId)
    .eq("user_id", user.id)
    .single();

  if (!existing) {
    return { error: "Recipe not found or unauthorized." };
  }

  const { error } = await supabase
    .from("recipes")
    .delete()
    .eq("id", recipeId)
    .eq("user_id", user.id);

  if (error) {
    return { error: error.message };
  }

  if (
    existing.image_storage_path &&
    existing.image_storage_path.startsWith(`${user.id}/`)
  ) {
    await supabase.storage
      .from(RECIPE_IMAGES_BUCKET)
      .remove([existing.image_storage_path]);
  }

  revalidatePath("/dashboard");
  revalidatePath("/cookbook");

  return { recipeId };
}

/**
 * Toggles the `is_favorite` status on a recipe owned by the authenticated user.
 */
export async function toggleFavoriteRecipeAction(
  recipeId: string,
  nextFavoriteState: boolean
): Promise<RecipeActionResult> {
  if (!recipeId) {
    return { error: "Recipe ID is required." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "You must be signed in to favorite a recipe." };
  }

  const { data: updated, error } = await supabase
    .from("recipes")
    .update({
      is_favorite: nextFavoriteState,
      updated_at: new Date().toISOString(),
    })
    .eq("id", recipeId)
    .eq("user_id", user.id)
    .select("id, is_favorite")
    .single();

  if (error || !updated) {
    return { error: error?.message || "Failed to update favorite status." };
  }

  revalidatePath("/dashboard");
  revalidatePath("/cookbook");
  revalidatePath(`/cookbook/${recipeId}`);

  return {
    recipeId: updated.id,
    isFavorite: updated.is_favorite,
  };
}
