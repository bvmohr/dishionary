import { z } from "zod";

export const RECIPE_CATEGORIES = [
  "Breakfast",
  "Appetizer",
  "Soup & Salad",
  "Main Course",
  "Side Dish",
  "Pasta & Grains",
  "Baking & Bread",
  "Dessert",
  "Sauce & Condiment",
  "Beverage",
] as const;

export const RECIPE_DIFFICULTIES = ["easy", "medium", "hard"] as const;

/**
 * Blocks private/loopback/metadata IP ranges in external image URLs to prevent SSRF.
 */
export function isSafeExternalHttpsUrl(rawUrl: string): boolean {
  try {
    const parsed = new URL(rawUrl);
    if (parsed.protocol !== "https:") {
      return false;
    }

    const host = parsed.hostname.toLowerCase();
    if (
      host === "localhost" ||
      host === "127.0.0.1" ||
      host === "0.0.0.0" ||
      host === "::1" ||
      host === "[::1]" ||
      host.endsWith(".local") ||
      host.endsWith(".internal")
    ) {
      return false;
    }

    // Block RFC 1918 & cloud metadata IPv4 ranges
    if (
      /^127\./.test(host) ||
      /^10\./.test(host) ||
      /^192\.168\./.test(host) ||
      /^169\.254\./.test(host) ||
      /^172\.(1[6-9]|2[0-9]|3[0-1])\./.test(host)
    ) {
      return false;
    }

    return true;
  } catch {
    return false;
  }
}

export const recipeIngredientSchema = z.object({
  id: z.string().trim().min(1, "Ingredient ID is required."),
  amount: z
    .string()
    .trim()
    .max(30, "Amount must not exceed 30 characters.")
    .default(""),
  unit: z
    .string()
    .trim()
    .max(30, "Unit must not exceed 30 characters.")
    .default(""),
  item: z
    .string()
    .trim()
    .min(1, "Ingredient name is required.")
    .max(140, "Ingredient name must not exceed 140 characters."),
  notes: z
    .string()
    .trim()
    .max(140, "Ingredient note must not exceed 140 characters.")
    .optional()
    .default(""),
});

export const recipeFormSchema = z.object({
  title: z
    .string()
    .trim()
    .min(2, "Recipe title must be at least 2 characters.")
    .max(140, "Recipe title must not exceed 140 characters."),
  summary: z
    .string()
    .trim()
    .max(400, "Summary must not exceed 400 characters.")
    .optional()
    .default(""),
  imageUrl: z
    .string()
    .trim()
    .optional()
    .default("")
    .refine((val) => !val || isSafeExternalHttpsUrl(val), {
      message: "Recipe image URL must be a valid public https:// URL.",
    }),
  imageStoragePath: z
    .string()
    .trim()
    .max(300, "Storage path too long.")
    .optional()
    .default(""),
  prepTimeMinutes: z.coerce
    .number()
    .int("Prep time must be a whole number of minutes.")
    .min(0, "Prep time cannot be negative.")
    .max(10080, "Prep time cannot exceed 7 days."),
  cookTimeMinutes: z.coerce
    .number()
    .int("Cook time must be a whole number of minutes.")
    .min(0, "Cook time cannot be negative.")
    .max(10080, "Cook time cannot exceed 7 days."),
  servings: z.coerce
    .number()
    .int("Servings must be a whole number.")
    .min(1, "Servings must be at least 1.")
    .max(200, "Servings cannot exceed 200."),
  difficulty: z.enum(RECIPE_DIFFICULTIES).default("medium"),
  category: z
    .string()
    .trim()
    .min(2, "Category is required.")
    .max(60, "Category must not exceed 60 characters.")
    .default("Main Course"),
  tags: z
    .array(
      z
        .string()
        .trim()
        .min(1)
        .max(35, "Each tag must be 35 characters or fewer.")
    )
    .max(20, "You can add up to 20 tags per recipe.")
    .default([]),
  ingredients: z
    .array(recipeIngredientSchema)
    .min(1, "Please include at least one ingredient.")
    .max(150, "A recipe cannot exceed 150 ingredients."),
  instructionsMarkdown: z
    .string()
    .trim()
    .min(10, "Please write at least 10 characters of cooking instructions.")
    .max(50000, "Instructions cannot exceed 50,000 characters."),
  isFavorite: z.boolean().optional().default(false),
});

export type RecipeFormInput = z.infer<typeof recipeFormSchema>;
export type RecipeIngredientInput = z.infer<typeof recipeIngredientSchema>;

/**
 * Generates a URL-safe slug from a recipe title.
 */
export function generateRecipeSlug(title: string): string {
  const base = title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");

  return base || "recipe";
}

/**
 * Parses comma-separated or array tags into a deduplicated lowercase string array.
 */
export function parseRecipeTags(raw: string | string[]): string[] {
  const list = Array.isArray(raw) ? raw : raw.split(",");
  const seen = new Set<string>();
  const result: string[] = [];

  for (const entry of list) {
    const cleaned = entry.trim().toLowerCase();
    if (cleaned && !seen.has(cleaned) && result.length < 20) {
      seen.add(cleaned);
      result.push(cleaned);
    }
  }

  return result;
}
