"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  Plus,
  Trash2,
  Upload,
  Link2,
  Bold,
  Italic,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Quote,
  Eye,
  Edit3,
  Save,
  AlertCircle,
  CheckCircle2,
  Clock,
  Users,
  Tag,
  Image as ImageIcon,
} from "lucide-react";
import {
  RECIPE_CATEGORIES,
  RECIPE_DIFFICULTIES,
  parseRecipeTags,
  recipeFormSchema,
  type RecipeFormInput,
  type RecipeIngredientInput,
} from "@/lib/validations/recipe";
import {
  uploadRecipeImageToStorage,
  validateRecipeImageFile,
} from "@/lib/supabase/storage";
import { createRecipeAction, updateRecipeAction } from "@/app/actions/recipes";
import { RecipeMarkdownRenderer } from "./recipe-markdown-renderer";

export interface HybridRecipeFormProps {
  mode: "create" | "edit";
  userId: string;
  recipeId?: string;
  initialValues?: Partial<RecipeFormInput>;
}

function createEmptyIngredient(index: number): RecipeIngredientInput {
  return {
    id: `ing-${Date.now()}-${index}`,
    amount: "",
    unit: "",
    item: "",
    notes: "",
  };
}

export function HybridRecipeForm({
  mode,
  userId,
  recipeId,
  initialValues,
}: HybridRecipeFormProps) {
  const router = useRouter();
  const textareaRef = React.useRef<HTMLTextAreaElement | null>(null);

  const [title, setTitle] = React.useState(initialValues?.title ?? "");
  const [summary, setSummary] = React.useState(initialValues?.summary ?? "");
  const [category, setCategory] = React.useState(
    initialValues?.category ?? "Main Course"
  );
  const [difficulty, setDifficulty] = React.useState<
    (typeof RECIPE_DIFFICULTIES)[number]
  >(initialValues?.difficulty ?? "medium");
  const [prepTimeMinutes, setPrepTimeMinutes] = React.useState<number>(
    initialValues?.prepTimeMinutes ?? 15
  );
  const [cookTimeMinutes, setCookTimeMinutes] = React.useState<number>(
    initialValues?.cookTimeMinutes ?? 30
  );
  const [servings, setServings] = React.useState<number>(
    initialValues?.servings ?? 4
  );
  const [tagsInput, setTagsInput] = React.useState(
    (initialValues?.tags ?? []).join(", ")
  );
  const [isFavorite, setIsFavorite] = React.useState<boolean>(
    initialValues?.isFavorite ?? false
  );

  // Image state (supports either file upload to Supabase Storage OR external HTTPS URL)
  const [imageTab, setImageTab] = React.useState<"upload" | "url">("url");
  const [imageUrl, setImageUrl] = React.useState(initialValues?.imageUrl ?? "");
  const [imageStoragePath, setImageStoragePath] = React.useState(
    initialValues?.imageStoragePath ?? ""
  );
  const [isUploadingImage, setIsUploadingImage] = React.useState(false);
  const [imageFeedback, setImageFeedback] = React.useState<string | null>(null);

  // Dynamic Ingredient Rows
  const [ingredients, setIngredients] = React.useState<RecipeIngredientInput[]>(
    initialValues?.ingredients && initialValues.ingredients.length > 0
      ? initialValues.ingredients
      : [createEmptyIngredient(0), createEmptyIngredient(1)]
  );

  // Markdown Instructions + Write/Preview Tabs
  const [instructionsMarkdown, setInstructionsMarkdown] = React.useState(
    initialValues?.instructionsMarkdown ??
      "## Preparation\n1. Gather and measure all ingredients.\n2. Follow the steps below to prepare your dish."
  );
  const [editorTab, setEditorTab] = React.useState<
    "write" | "preview" | "split"
  >("write");

  const [error, setError] = React.useState<string | null>(null);
  const [isPending, startTransition] = React.useTransition();

  const handleAddIngredient = () => {
    setIngredients((prev) => [...prev, createEmptyIngredient(prev.length)]);
  };

  const handleRemoveIngredient = (id: string) => {
    setIngredients((prev) =>
      prev.length > 1 ? prev.filter((item) => item.id !== id) : prev
    );
  };

  const handleIngredientChange = (
    id: string,
    field: keyof RecipeIngredientInput,
    value: string
  ) => {
    setIngredients((prev) =>
      prev.map((row) => (row.id === id ? { ...row, [field]: value } : row))
    );
  };

  /**
   * Inserts Markdown syntax snippets around the current selection in the instructions textarea.
   */
  const insertMarkdownSnippet = (
    prefix: string,
    suffix = "",
    placeholder = "text"
  ) => {
    const textarea = textareaRef.current;
    if (!textarea) {
      setInstructionsMarkdown(
        (prev) => `${prev}\n${prefix}${placeholder}${suffix}`
      );
      return;
    }

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selected = instructionsMarkdown.slice(start, end) || placeholder;
    const updated =
      instructionsMarkdown.slice(0, start) +
      prefix +
      selected +
      suffix +
      instructionsMarkdown.slice(end);

    setInstructionsMarkdown(updated);
    requestAnimationFrame(() => {
      textarea.focus();
      const cursorPos = start + prefix.length + selected.length + suffix.length;
      textarea.setSelectionRange(cursorPos, cursorPos);
    });
  };

  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setError(null);
    setImageFeedback(null);

    const validation = validateRecipeImageFile(file);
    if (!validation.valid) {
      setError(validation.error ?? "Invalid image file.");
      return;
    }

    setIsUploadingImage(true);
    try {
      const uploaded = await uploadRecipeImageToStorage(file, userId);
      if (uploaded.error) {
        setError(uploaded.error);
      } else if (uploaded.publicUrl) {
        setImageUrl(uploaded.publicUrl);
        setImageStoragePath(uploaded.storagePath ?? "");
        setImageFeedback("Recipe photo uploaded to Supabase Storage.");
      }
    } finally {
      setIsUploadingImage(false);
    }
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    const nonEmptyIngredients = ingredients.filter(
      (ing) => ing.item.trim().length > 0
    );

    const payload: RecipeFormInput = {
      title,
      summary,
      imageUrl,
      imageStoragePath,
      prepTimeMinutes: Number(prepTimeMinutes),
      cookTimeMinutes: Number(cookTimeMinutes),
      servings: Number(servings),
      difficulty,
      category,
      tags: parseRecipeTags(tagsInput),
      ingredients: nonEmptyIngredients,
      instructionsMarkdown,
      isFavorite,
    };

    const validated = recipeFormSchema.safeParse(payload);
    if (!validated.success) {
      setError(
        validated.error.issues[0]?.message ||
          "Please review all required fields."
      );
      return;
    }

    startTransition(async () => {
      const result =
        mode === "edit" && recipeId
          ? await updateRecipeAction(recipeId, validated.data)
          : await createRecipeAction(validated.data);

      if (result.error) {
        setError(result.error);
        return;
      }

      if (result.recipeId) {
        router.push(`/cookbook/${result.recipeId}`);
        router.refresh();
      }
    });
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-8"
      aria-label={mode === "edit" ? "Edit Recipe Form" : "Create Recipe Form"}
      noValidate
    >
      {error && (
        <div
          role="alert"
          className="flex items-start gap-2.5 rounded-xl border border-destructive/40 bg-destructive/10 p-4 text-sm text-destructive"
        >
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" strokeWidth={1.75} />
          <span>{error}</span>
        </div>
      )}

      {/* Section 1: Recipe Metadata & Timing */}
      <section className="rounded-2xl border border-border bg-surface p-6 shadow-xs sm:p-8">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border pb-4">
          <div>
            <h2 className="font-serif text-xl font-semibold text-foreground">
              1. Recipe Details &amp; Timing
            </h2>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Structured metadata makes your cookbook searchable and easy to
              scan.
            </p>
          </div>
          <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-border bg-surface-muted px-3 py-1.5 text-xs font-medium text-foreground">
            <input
              type="checkbox"
              checked={isFavorite}
              onChange={(e) => setIsFavorite(e.target.checked)}
              className="h-3.5 w-3.5 accent-primary"
            />
            <span>Mark as Favorite</span>
          </label>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-12">
          <div className="sm:col-span-8">
            <label
              htmlFor="recipe-title"
              className="block text-xs font-medium text-foreground"
            >
              Recipe Title <span className="text-primary">*</span>
            </label>
            <input
              id="recipe-title"
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Herb-Crusted Rack of Lamb"
              className="mt-1.5 w-full rounded-lg border border-border bg-background px-3.5 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
            />
          </div>

          <div className="sm:col-span-4">
            <label
              htmlFor="recipe-category"
              className="block text-xs font-medium text-foreground"
            >
              Category
            </label>
            <select
              id="recipe-category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="mt-1.5 w-full rounded-lg border border-border bg-background px-3.5 py-2.5 text-sm text-foreground focus:border-primary focus:outline-none"
            >
              {RECIPE_CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          <div className="sm:col-span-12">
            <label
              htmlFor="recipe-summary"
              className="block text-xs font-medium text-foreground"
            >
              Short Summary
            </label>
            <input
              id="recipe-summary"
              type="text"
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              placeholder="A brief one-sentence description shown on your recipe cards..."
              className="mt-1.5 w-full rounded-lg border border-border bg-background px-3.5 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
            />
          </div>

          {/* Prep Time, Cook Time, Servings, Difficulty */}
          <div className="sm:col-span-3">
            <label
              htmlFor="prep-time"
              className="flex items-center gap-1.5 text-xs font-medium text-foreground"
            >
              <Clock className="h-3.5 w-3.5 text-primary" strokeWidth={1.75} />
              <span>Prep Time (mins)</span>
            </label>
            <input
              id="prep-time"
              type="number"
              min={0}
              max={10080}
              value={prepTimeMinutes}
              onChange={(e) => setPrepTimeMinutes(Number(e.target.value))}
              className="mt-1.5 w-full rounded-lg border border-border bg-background px-3.5 py-2.5 font-mono text-sm text-foreground focus:border-primary focus:outline-none"
            />
          </div>

          <div className="sm:col-span-3">
            <label
              htmlFor="cook-time"
              className="flex items-center gap-1.5 text-xs font-medium text-foreground"
            >
              <Clock className="h-3.5 w-3.5 text-primary" strokeWidth={1.75} />
              <span>Cook Time (mins)</span>
            </label>
            <input
              id="cook-time"
              type="number"
              min={0}
              max={10080}
              value={cookTimeMinutes}
              onChange={(e) => setCookTimeMinutes(Number(e.target.value))}
              className="mt-1.5 w-full rounded-lg border border-border bg-background px-3.5 py-2.5 font-mono text-sm text-foreground focus:border-primary focus:outline-none"
            />
          </div>

          <div className="sm:col-span-3">
            <label
              htmlFor="recipe-servings"
              className="flex items-center gap-1.5 text-xs font-medium text-foreground"
            >
              <Users className="h-3.5 w-3.5 text-primary" strokeWidth={1.75} />
              <span>Servings</span>
            </label>
            <input
              id="recipe-servings"
              type="number"
              min={1}
              max={200}
              value={servings}
              onChange={(e) => setServings(Number(e.target.value))}
              className="mt-1.5 w-full rounded-lg border border-border bg-background px-3.5 py-2.5 font-mono text-sm text-foreground focus:border-primary focus:outline-none"
            />
          </div>

          <div className="sm:col-span-3">
            <label
              htmlFor="recipe-difficulty"
              className="block text-xs font-medium text-foreground"
            >
              Difficulty
            </label>
            <select
              id="recipe-difficulty"
              value={difficulty}
              onChange={(e) =>
                setDifficulty(
                  e.target.value as (typeof RECIPE_DIFFICULTIES)[number]
                )
              }
              className="mt-1.5 w-full rounded-lg border border-border bg-background px-3.5 py-2.5 text-sm capitalize text-foreground focus:border-primary focus:outline-none"
            >
              {RECIPE_DIFFICULTIES.map((level) => (
                <option key={level} value={level}>
                  {level.charAt(0).toUpperCase() + level.slice(1)}
                </option>
              ))}
            </select>
          </div>

          <div className="sm:col-span-12">
            <label
              htmlFor="recipe-tags"
              className="flex items-center gap-1.5 text-xs font-medium text-foreground"
            >
              <Tag className="h-3.5 w-3.5 text-primary" strokeWidth={1.75} />
              <span>Tags (comma-separated)</span>
            </label>
            <input
              id="recipe-tags"
              type="text"
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
              placeholder="dinner, roast, Mediterranean, gluten-free"
              className="mt-1.5 w-full rounded-lg border border-border bg-background px-3.5 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
            />
          </div>
        </div>
      </section>

      {/* Section 2: Dish Photography (Upload to Supabase Storage OR External HTTPS URL) */}
      <section className="rounded-2xl border border-border bg-surface p-6 shadow-xs sm:p-8">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border pb-4">
          <div>
            <h2 className="font-serif text-xl font-semibold text-foreground">
              2. Dish Photography
            </h2>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Provide an image URL or upload a photo (stored as a portable URL
              for seamless export/import).
            </p>
          </div>

          <div className="inline-flex rounded-lg border border-border bg-surface-muted p-1 text-xs">
            <button
              type="button"
              onClick={() => setImageTab("url")}
              className={`inline-flex items-center gap-1.5 rounded-md px-3 py-1 font-medium transition-colors ${
                imageTab === "url"
                  ? "bg-surface text-foreground shadow-2xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Link2 className="h-3.5 w-3.5" strokeWidth={1.75} />
              <span>Image URL</span>
            </button>
            <button
              type="button"
              onClick={() => setImageTab("upload")}
              className={`inline-flex items-center gap-1.5 rounded-md px-3 py-1 font-medium transition-colors ${
                imageTab === "upload"
                  ? "bg-surface text-foreground shadow-2xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Upload className="h-3.5 w-3.5" strokeWidth={1.75} />
              <span>Upload Photo</span>
            </button>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-12">
          <div className="md:col-span-7">
            {imageTab === "url" ? (
              <div>
                <label
                  htmlFor="recipe-image-url"
                  className="block text-xs font-medium text-foreground"
                >
                  HTTPS Image URL
                </label>
                <input
                  id="recipe-image-url"
                  type="url"
                  value={imageUrl}
                  onChange={(e) => {
                    setImageUrl(e.target.value);
                    setImageStoragePath("");
                  }}
                  placeholder="https://images.unsplash.com/photo-..."
                  className="mt-1.5 w-full rounded-lg border border-border bg-background px-3.5 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
                />
                <p className="mt-1.5 text-xs text-muted-foreground">
                  Paste any direct{" "}
                  <code className="font-mono text-foreground">https://</code>{" "}
                  dish photo URL.
                </p>
              </div>
            ) : (
              <div>
                <label
                  htmlFor="recipe-image-file"
                  className="block text-xs font-medium text-foreground"
                >
                  Upload Image File (JPEG, PNG, WebP, AVIF up to 5 MB)
                </label>
                <input
                  id="recipe-image-file"
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/avif"
                  disabled={isUploadingImage}
                  onChange={handleFileUpload}
                  className="mt-1.5 block w-full cursor-pointer rounded-lg border border-dashed border-border bg-background p-3 text-xs text-muted-foreground file:mr-3 file:rounded-md file:border-0 file:bg-primary file:px-3 file:py-1.5 file:text-xs file:font-medium file:text-primary-foreground hover:file:bg-primary-hover"
                />
                {isUploadingImage && (
                  <p className="mt-2 text-xs text-primary">
                    Uploading photo to Supabase Storage...
                  </p>
                )}
                {imageFeedback && (
                  <p className="mt-2 inline-flex items-center gap-1.5 text-xs text-secondary-accent">
                    <CheckCircle2 className="h-3.5 w-3.5" strokeWidth={1.75} />
                    <span>{imageFeedback}</span>
                  </p>
                )}
              </div>
            )}
          </div>

          <div className="md:col-span-5">
            {imageUrl ? (
              <div className="relative overflow-hidden rounded-xl border border-border bg-surface-muted">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={imageUrl}
                  alt={title || "Recipe preview"}
                  className="h-40 w-full object-cover"
                />
                <button
                  type="button"
                  onClick={() => {
                    setImageUrl("");
                    setImageStoragePath("");
                    setImageFeedback(null);
                  }}
                  className="absolute top-2 right-2 rounded-lg border border-border bg-surface/90 px-2.5 py-1 text-xs font-medium text-foreground hover:bg-surface"
                >
                  Remove
                </button>
              </div>
            ) : (
              <div className="flex h-40 flex-col items-center justify-center rounded-xl border border-dashed border-border bg-surface-muted/40 p-4 text-center">
                <ImageIcon
                  className="h-6 w-6 text-muted-foreground"
                  strokeWidth={1.75}
                />
                <p className="mt-2 text-xs text-muted-foreground">
                  No dish photo selected yet
                </p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Section 3: Structured Ingredients Builder */}
      <section className="rounded-2xl border border-border bg-surface p-6 shadow-xs sm:p-8">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border pb-4">
          <div>
            <h2 className="font-serif text-xl font-semibold text-foreground">
              3. Structured Ingredients <span className="text-primary">*</span>
            </h2>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Add each ingredient row so you can check items off while cooking.
            </p>
          </div>
          <button
            type="button"
            onClick={handleAddIngredient}
            className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-surface-muted px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:bg-background"
          >
            <Plus className="h-3.5 w-3.5 text-primary" strokeWidth={1.75} />
            <span>Add Ingredient</span>
          </button>
        </div>

        <div className="mt-5 space-y-3">
          {ingredients.map((row, idx) => (
            <div
              key={row.id}
              className="grid grid-cols-1 gap-2.5 rounded-xl border border-border bg-surface-muted/30 p-3 sm:grid-cols-12 sm:items-center"
            >
              <div className="sm:col-span-2">
                <input
                  type="text"
                  aria-label={`Ingredient ${idx + 1} amount`}
                  value={row.amount}
                  onChange={(e) =>
                    handleIngredientChange(row.id, "amount", e.target.value)
                  }
                  placeholder="Amount (e.g. 2)"
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 font-mono text-xs text-foreground placeholder:font-sans placeholder:text-muted-foreground focus:border-primary focus:outline-none"
                />
              </div>

              <div className="sm:col-span-2">
                <input
                  type="text"
                  aria-label={`Ingredient ${idx + 1} unit`}
                  value={row.unit}
                  onChange={(e) =>
                    handleIngredientChange(row.id, "unit", e.target.value)
                  }
                  placeholder="Unit (tbsp, cup)"
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-xs text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
                />
              </div>

              <div className="sm:col-span-4">
                <input
                  type="text"
                  aria-label={`Ingredient ${idx + 1} name`}
                  value={row.item}
                  onChange={(e) =>
                    handleIngredientChange(row.id, "item", e.target.value)
                  }
                  placeholder="Ingredient name (e.g. fresh rosemary)"
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-xs text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
                />
              </div>

              <div className="sm:col-span-3">
                <input
                  type="text"
                  aria-label={`Ingredient ${idx + 1} notes`}
                  value={row.notes ?? ""}
                  onChange={(e) =>
                    handleIngredientChange(row.id, "notes", e.target.value)
                  }
                  placeholder="Prep note (minced, divided)"
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-xs text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
                />
              </div>

              <div className="flex justify-end sm:col-span-1">
                <button
                  type="button"
                  onClick={() => handleRemoveIngredient(row.id)}
                  disabled={ingredients.length <= 1}
                  aria-label={`Remove ingredient ${idx + 1}`}
                  className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-border bg-background text-muted-foreground transition-colors hover:border-destructive/40 hover:text-destructive disabled:opacity-40"
                >
                  <Trash2 className="h-3.5 w-3.5" strokeWidth={1.75} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Section 4: Hybrid Markdown Instructions Editor & Live Sanitized Preview */}
      <section className="rounded-2xl border border-border bg-surface p-6 shadow-xs sm:p-8">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border pb-4">
          <div>
            <h2 className="font-serif text-xl font-semibold text-foreground">
              4. Cooking Instructions (Markdown){" "}
              <span className="text-primary">*</span>
            </h2>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Use the formatting toolbar or write Markdown directly. Switch to
              Preview or Split view at any time.
            </p>
          </div>

          <div className="inline-flex rounded-lg border border-border bg-surface-muted p-1 text-xs">
            <button
              type="button"
              onClick={() => setEditorTab("write")}
              className={`inline-flex items-center gap-1.5 rounded-md px-3 py-1 font-medium transition-colors ${
                editorTab === "write"
                  ? "bg-surface text-foreground shadow-2xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Edit3 className="h-3.5 w-3.5" strokeWidth={1.75} />
              <span>Write</span>
            </button>
            <button
              type="button"
              onClick={() => setEditorTab("preview")}
              className={`inline-flex items-center gap-1.5 rounded-md px-3 py-1 font-medium transition-colors ${
                editorTab === "preview"
                  ? "bg-surface text-foreground shadow-2xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Eye className="h-3.5 w-3.5" strokeWidth={1.75} />
              <span>Live Preview</span>
            </button>
            <button
              type="button"
              onClick={() => setEditorTab("split")}
              className={`hidden items-center gap-1.5 rounded-md px-3 py-1 font-medium transition-colors md:inline-flex ${
                editorTab === "split"
                  ? "bg-surface text-foreground shadow-2xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <span>Split View</span>
            </button>
          </div>
        </div>

        {/* Markdown Formatting Toolbar */}
        {editorTab !== "preview" && (
          <div
            role="toolbar"
            aria-label="Markdown formatting toolbar"
            className="mt-4 flex flex-wrap items-center gap-1.5 rounded-t-xl border border-b-0 border-border bg-surface-muted px-3 py-2"
          >
            <button
              type="button"
              onClick={() => insertMarkdownSnippet("## ", "", "Step Heading")}
              title="Section Heading (H2)"
              aria-label="Insert H2 Heading"
              className="inline-flex h-8 items-center gap-1 rounded-md border border-transparent px-2 text-xs font-medium text-foreground hover:border-border hover:bg-surface"
            >
              <Heading2 className="h-3.5 w-3.5" strokeWidth={1.75} />
              <span>H2</span>
            </button>
            <button
              type="button"
              onClick={() => insertMarkdownSnippet("### ", "", "Sub-step")}
              title="Subheading (H3)"
              aria-label="Insert H3 Heading"
              className="inline-flex h-8 items-center gap-1 rounded-md border border-transparent px-2 text-xs font-medium text-foreground hover:border-border hover:bg-surface"
            >
              <Heading3 className="h-3.5 w-3.5" strokeWidth={1.75} />
              <span>H3</span>
            </button>
            <button
              type="button"
              onClick={() => insertMarkdownSnippet("**", "**", "bold text")}
              title="Bold"
              aria-label="Insert Bold"
              className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-transparent text-foreground hover:border-border hover:bg-surface"
            >
              <Bold className="h-3.5 w-3.5" strokeWidth={1.75} />
            </button>
            <button
              type="button"
              onClick={() => insertMarkdownSnippet("*", "*", "italic text")}
              title="Italic"
              aria-label="Insert Italic"
              className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-transparent text-foreground hover:border-border hover:bg-surface"
            >
              <Italic className="h-3.5 w-3.5" strokeWidth={1.75} />
            </button>
            <button
              type="button"
              onClick={() => insertMarkdownSnippet("1. ", "", "First step")}
              title="Numbered Step List"
              aria-label="Insert Numbered List"
              className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-transparent text-foreground hover:border-border hover:bg-surface"
            >
              <ListOrdered className="h-3.5 w-3.5" strokeWidth={1.75} />
            </button>
            <button
              type="button"
              onClick={() => insertMarkdownSnippet("- ", "", "Bullet point")}
              title="Bullet List"
              aria-label="Insert Bullet List"
              className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-transparent text-foreground hover:border-border hover:bg-surface"
            >
              <List className="h-3.5 w-3.5" strokeWidth={1.75} />
            </button>
            <button
              type="button"
              onClick={() =>
                insertMarkdownSnippet(
                  "> **Chef Tip:** ",
                  "",
                  "Rest for 10 mins"
                )
              }
              title="Chef Note / Callout"
              aria-label="Insert Chef Tip Blockquote"
              className="inline-flex h-8 items-center gap-1 rounded-md border border-transparent px-2 text-xs font-medium text-foreground hover:border-border hover:bg-surface"
            >
              <Quote className="h-3.5 w-3.5" strokeWidth={1.75} />
              <span>Chef Tip</span>
            </button>
          </div>
        )}

        <div
          className={
            editorTab === "split"
              ? "grid grid-cols-1 gap-4 md:grid-cols-2"
              : "block"
          }
        >
          {(editorTab === "write" || editorTab === "split") && (
            <textarea
              ref={textareaRef}
              id="recipe-instructions-markdown"
              aria-label="Cooking Instructions Markdown"
              rows={12}
              value={instructionsMarkdown}
              onChange={(e) => setInstructionsMarkdown(e.target.value)}
              placeholder="Write your step-by-step cooking instructions in Markdown..."
              className="w-full rounded-b-xl border border-border bg-background p-4 font-mono text-sm leading-relaxed text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
            />
          )}

          {(editorTab === "preview" || editorTab === "split") && (
            <div
              className={`min-h-64 rounded-xl border border-border bg-surface-muted/30 p-5 ${
                editorTab === "preview" ? "mt-4" : ""
              }`}
            >
              <RecipeMarkdownRenderer markdown={instructionsMarkdown} />
            </div>
          )}
        </div>
      </section>

      {/* Form Action Footer */}
      <div className="flex flex-col-reverse items-center justify-end gap-3 sm:flex-row">
        <button
          type="button"
          onClick={() => router.back()}
          className="inline-flex w-full items-center justify-center rounded-lg border border-border bg-surface px-5 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-surface-muted sm:w-auto"
        >
          Cancel
        </button>

        <button
          type="submit"
          disabled={isPending || isUploadingImage}
          className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
        >
          <Save className="h-4 w-4" strokeWidth={1.75} />
          <span>
            {isPending
              ? mode === "edit"
                ? "Saving Changes..."
                : "Creating Recipe..."
              : mode === "edit"
                ? "Save Recipe Changes"
                : "Save Recipe to Cookbook"}
          </span>
        </button>
      </div>
    </form>
  );
}
