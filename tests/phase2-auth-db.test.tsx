import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import React from "react";
import {
  loginSchema,
  registerSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
} from "@/lib/validations/auth";
import {
  isProtectedRoute,
  isGuestOnlyAuthPage,
} from "@/lib/supabase/middleware";
import { buildAccountEmailHtml } from "@/lib/email/notifications";
import {
  profiles,
  recipes,
  collections,
  recipeCollections,
  sharedRecipeLinks,
} from "@/db/schema";
import LoginPage from "@/app/(auth)/login/page";
import RegisterPage from "@/app/(auth)/register/page";
import ForgotPasswordPage from "@/app/(auth)/forgot-password/page";

describe("Phase 2: Database Schema, Supabase Auth, Google OIDC & Transactional Emails", () => {
  describe("Zod Authentication Validation Schemas", () => {
    it("validates a correct login payload", () => {
      const result = loginSchema.safeParse({
        email: "chef@dishionary.com",
        password: "SecretPassword123!",
      });
      expect(result.success).toBe(true);
    });

    it("rejects weak passwords during registration", () => {
      const weakResult = registerSchema.safeParse({
        displayName: "Chef Julia",
        email: "julia@dishionary.com",
        password: "weakpassword",
        confirmPassword: "weakpassword",
      });
      expect(weakResult.success).toBe(false);
    });

    it("rejects mismatched confirmPassword during registration", () => {
      const mismatchResult = registerSchema.safeParse({
        displayName: "Chef Julia",
        email: "julia@dishionary.com",
        password: "StrongPassword1!",
        confirmPassword: "DifferentPassword2!",
      });
      expect(mismatchResult.success).toBe(false);
    });

    it("accepts strong matching passwords in registration and password reset", () => {
      const validRegister = registerSchema.safeParse({
        displayName: "Chef Julia",
        email: "julia@dishionary.com",
        password: "StrongPassword1!",
        confirmPassword: "StrongPassword1!",
      });
      expect(validRegister.success).toBe(true);

      const validReset = resetPasswordSchema.safeParse({
        password: "NewStrongPassword9#",
        confirmPassword: "NewStrongPassword9#",
      });
      expect(validReset.success).toBe(true);

      const validForgot = forgotPasswordSchema.safeParse({
        email: "julia@dishionary.com",
      });
      expect(validForgot.success).toBe(true);
    });
  });

  describe("Route Protection Middleware Matchers", () => {
    it("identifies protected cookbook, dashboard, and settings routes", () => {
      expect(isProtectedRoute("/dashboard")).toBe(true);
      expect(isProtectedRoute("/cookbook")).toBe(true);
      expect(isProtectedRoute("/cookbook/new")).toBe(true);
      expect(isProtectedRoute("/settings")).toBe(true);
      expect(isProtectedRoute("/")).toBe(false);
      expect(isProtectedRoute("/login")).toBe(false);
      expect(isProtectedRoute("/share/token-123")).toBe(false);
    });

    it("identifies guest-only authentication pages", () => {
      expect(isGuestOnlyAuthPage("/login")).toBe(true);
      expect(isGuestOnlyAuthPage("/register")).toBe(true);
      expect(isGuestOnlyAuthPage("/forgot-password")).toBe(true);
      expect(isGuestOnlyAuthPage("/dashboard")).toBe(false);
    });
  });

  describe("Drizzle PostgreSQL Schema Definitions", () => {
    it("defines all 5 core tables for multi-tenant cookbooks", () => {
      expect(profiles).toBeDefined();
      expect(recipes).toBeDefined();
      expect(collections).toBeDefined();
      expect(recipeCollections).toBeDefined();
      expect(sharedRecipeLinks).toBeDefined();
    });
  });

  describe("Transactional Email HTML Builder", () => {
    it("generates warm-toned HTML emails with zero emojis", () => {
      const html = buildAccountEmailHtml({
        displayName: "Chef Brian",
        heading: "Your password has been changed",
        body: "Security notification test body.",
      });
      expect(html).toContain("Chef Brian");
      expect(html).toContain("Your password has been changed");
      const emojiRegex = /\p{Extended_Pictographic}/u;
      expect(emojiRegex.test(html)).toBe(false);
    });
  });

  describe("Authentication UI Pages (/login, /register, /forgot-password)", () => {
    it("renders the Login page with Email/Password inputs, Google OIDC button, and zero emojis", () => {
      const { container } = render(<LoginPage />);
      expect(
        screen.getByRole("heading", { name: /welcome back/i })
      ).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: /sign in with google/i })
      ).toBeInTheDocument();
      expect(screen.getByLabelText(/email address/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/password/i)).toBeInTheDocument();

      const emojiRegex = /\p{Extended_Pictographic}/u;
      expect(emojiRegex.test(container.textContent || "")).toBe(false);
    });

    it("renders the Register page with Display Name, Email, Password, and Google OIDC button", () => {
      render(<RegisterPage />);
      expect(
        screen.getByRole("heading", { name: /start your cookbook/i })
      ).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: /sign up with google/i })
      ).toBeInTheDocument();
      expect(screen.getByLabelText(/display name/i)).toBeInTheDocument();
    });

    it("renders the Forgot Password page cleanly", () => {
      render(<ForgotPasswordPage />);
      expect(
        screen.getByRole("heading", { name: /reset your password/i })
      ).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: /send recovery link/i })
      ).toBeInTheDocument();
    });
  });
});
