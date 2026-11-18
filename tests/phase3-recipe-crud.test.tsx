import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import React from "react";
import {
  recipeFormSchema,
  generateRecipeSlug,
  parseRecipeTags,
  isSafeExternalHttpsUrl,
} from "@/lib/validations/recipe";
import { validateRecipeImageFile } from "@/lib/supabase/storage";
import { RecipeMarkdownRenderer } from "@/components/cookbook/recipe-markdown-renderer";
import { HybridRecipeForm } from "@/components/cookbook/hybrid-recipe-form";

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
    back: vi.fn(),
    refresh: vi.fn(),
  }),
}));

describe("Phase 3: Recipe CRUD Engine, Image Storage & Hybrid Markdown Form", () => {
  describe("Recipe Zod Validation Schema (recipeFormSchema)", () => {
    it("accepts a valid structured recipe payload with Markdown instructions", () => {
      const parsed = recipeFormSchema.safeParse({
        title: "Braised Beef Short Ribs",
        summary: "Slow-braised red wine short ribs over creamy polenta.",
        imageUrl: "https://images.unsplash.com/photo-1544025162-d76694265947",
        prepTimeMinutes: 25,
        cookTimeMinutes: 180,
        servings: 4,
        difficulty: "medium",
        category: "Main Course",
        tags: ["beef", "braise", "winter"],
        ingredients: [
          {
            id: "ing-1",
            amount: "4",
            unit: "lbs",
            item: "bone-in beef short ribs",
            notes: "trimmed",
          },
        ],
        instructionsMarkdown:
          "## Sear the Short Ribs\n1. Season generously with kosher salt.\n2. Sear in Dutch oven until deeply browned.",
        isFavorite: true,
      });

      expect(parsed.success).toBe(true);
    });

    it("rejects recipes with empty ingredients or short instructions", () => {
      const invalid = recipeFormSchema.safeParse({
        title: "Toast",
        prepTimeMinutes: 2,
        cookTimeMinutes: 2,
        servings: 1,
        difficulty: "easy",
        category: "Breakfast",
        ingredients: [],
        instructionsMarkdown: "Too short",
      });

      expect(invalid.success).toBe(false);
    });

    it("blocks non-HTTPS and SSRF private IP image URLs", () => {
      expect(
        isSafeExternalHttpsUrl("https://images.unsplash.com/photo-123")
      ).toBe(true);
      expect(isSafeExternalHttpsUrl("http://images.unsplash.com/photo")).toBe(
        false
      );
      expect(isSafeExternalHttpsUrl("https://localhost:3000/img.png")).toBe(
        false
      );
      expect(isSafeExternalHttpsUrl("https://127.0.0.1/secret.png")).toBe(
        false
      );
      expect(isSafeExternalHttpsUrl("https://192.168.1.1/router.png")).toBe(
        false
      );
      expect(
        isSafeExternalHttpsUrl("https://169.254.169.254/latest/meta-data")
      ).toBe(false);
    });

    it("generates clean slugs and deduplicates tags", () => {
      expect(generateRecipeSlug("Herb-Crusted Rack of Lamb!")).toBe(
        "herb-crusted-rack-of-lamb"
      );
      expect(parseRecipeTags("Dinner, Roast, dinner,  Lamb ")).toEqual([
        "dinner",
        "roast",
        "lamb",
      ]);
    });
  });

  describe("Supabase Storage Image File Validation", () => {
    it("accepts valid WebP, JPEG, PNG, and AVIF images under 5 MB", () => {
      expect(
        validateRecipeImageFile({
          type: "image/webp",
          size: 800 * 1024,
          name: "dish.webp",
        }).valid
      ).toBe(true);
    });

    it("rejects SVG uploads and files exceeding 5 MB", () => {
      const svgResult = validateRecipeImageFile({
        type: "image/svg+xml",
        size: 12 * 1024,
        name: "xss.svg",
      });
      expect(svgResult.valid).toBe(false);

      const oversizedResult = validateRecipeImageFile({
        type: "image/jpeg",
        size: 6 * 1024 * 1024,
        name: "huge.jpg",
      });
      expect(oversizedResult.valid).toBe(false);
    });
  });

  describe("<RecipeMarkdownRenderer /> XSS Sanitization & GFM Rendering", () => {
    it("renders headings, lists, and blockquotes while stripping <script>, <iframe>, and javascript: links", () => {
      const maliciousMarkdown = [
        "## Step 1: Sear",
        "",
        "- Season with **kosher salt**",
        "",
        "<script>window.__xssExecuted = true;</script>",
        "",
        '<iframe src="https://evil.example.com"></iframe>',
        "",
        "[Malicious Link](javascript:alert('xss'))",
      ].join("\n");

      const { container } = render(
        <RecipeMarkdownRenderer markdown={maliciousMarkdown} />
      );

      expect(
        screen.getByRole("heading", { name: /step 1: sear/i })
      ).toBeInTheDocument();
      expect(screen.getByText(/kosher salt/i)).toBeInTheDocument();

      // Verify malicious elements and javascript: URIs are completely stripped
      expect(container.querySelector("script")).toBeNull();
      expect(container.querySelector("iframe")).toBeNull();
      expect(container.innerHTML).not.toContain("javascript:");
      const link = screen.getByText(/malicious link/i).closest("a");
      expect(link?.getAttribute("href")).toBe("#");
    });
  });

  describe("<HybridRecipeForm /> Interactive Authoring UI", () => {
    it("renders structured inputs, adds/removes ingredient rows, switches to Live Preview, and contains zero emojis", () => {
      const { container } = render(
        <HybridRecipeForm mode="create" userId="test-user-uuid" />
      );

      expect(screen.getByLabelText(/recipe title/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/prep time/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/cook time/i)).toBeInTheDocument();

      // Starts with 2 ingredient rows; clicking Add Ingredient creates a 3rd
      expect(screen.getAllByLabelText(/ingredient \d+ name/i)).toHaveLength(2);
      fireEvent.click(screen.getByRole("button", { name: /add ingredient/i }));
      expect(screen.getAllByLabelText(/ingredient \d+ name/i)).toHaveLength(3);

      // Switch Markdown editor to Live Preview tab
      fireEvent.click(screen.getByRole("button", { name: /live preview/i }));
      expect(
        screen.getByTestId("recipe-markdown-renderer")
      ).toBeInTheDocument();

      // Strict guardrail: zero emojis in the entire form
      const emojiRegex = /\p{Extended_Pictographic}/u;
      expect(emojiRegex.test(container.textContent || "")).toBe(false);
    });
  });
});
