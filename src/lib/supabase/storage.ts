import { createClient } from "@/lib/supabase/client";

export const RECIPE_IMAGES_BUCKET = "recipe-images";
export const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB
export const ALLOWED_IMAGE_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/avif",
] as const;

export interface ImageValidationResult {
  valid: boolean;
  error?: string;
}

/**
 * Validates an image file before uploading to Supabase Storage.
 * Blocks SVGs and files over 5 MB as specified in security.md.
 */
export function validateRecipeImageFile(file: {
  type: string;
  size: number;
  name?: string;
}): ImageValidationResult {
  if (
    !ALLOWED_IMAGE_MIME_TYPES.includes(
      file.type as (typeof ALLOWED_IMAGE_MIME_TYPES)[number]
    )
  ) {
    return {
      valid: false,
      error: "Only JPEG, PNG, WebP, and AVIF images are allowed (no SVGs).",
    };
  }

  if (file.size <= 0) {
    return {
      valid: false,
      error: "Selected image file is empty.",
    };
  }

  if (file.size > MAX_IMAGE_SIZE_BYTES) {
    return {
      valid: false,
      error: "Image file size must be 5 MB or smaller.",
    };
  }

  return { valid: true };
}

/**
 * Uploads a validated recipe photo to the authenticated user's folder inside
 * the `recipe-images` Supabase Storage bucket and returns its public CDN URL.
 */
export async function uploadRecipeImageToStorage(
  file: File,
  userId: string
): Promise<{
  publicUrl?: string;
  storagePath?: string;
  error?: string;
}> {
  const validation = validateRecipeImageFile(file);
  if (!validation.valid) {
    return { error: validation.error };
  }

  const ext = (file.name.split(".").pop() || "webp")
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");
  const uniqueId =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

  const storagePath = `${userId}/${uniqueId}.${ext || "webp"}`;
  const supabase = createClient();

  const { error: uploadError } = await supabase.storage
    .from(RECIPE_IMAGES_BUCKET)
    .upload(storagePath, file, {
      cacheControl: "3600",
      upsert: false,
      contentType: file.type,
    });

  if (uploadError) {
    return { error: uploadError.message };
  }

  const { data } = supabase.storage
    .from(RECIPE_IMAGES_BUCKET)
    .getPublicUrl(storagePath);

  return {
    publicUrl: data.publicUrl,
    storagePath,
  };
}
