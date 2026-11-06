"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getAppBaseUrl } from "@/lib/supabase/config";
import {
  loginSchema,
  registerSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
} from "@/lib/validations/auth";
import { sendAccountNotificationEmail } from "@/lib/email/notifications";

export interface AuthActionResult {
  error?: string;
  success?: string;
}

/**
 * Authenticates a user with Email & Password on the server.
 * Session tokens are stored strictly in HTTP-only cookies via @supabase/ssr.
 */
export async function signInWithPasswordAction(
  formData: FormData
): Promise<AuthActionResult> {
  const raw = {
    email: String(formData.get("email") ?? ""),
    password: String(formData.get("password") ?? ""),
  };

  const parsed = loginSchema.safeParse(raw);
  if (!parsed.success) {
    return {
      error: parsed.error.issues[0]?.message || "Invalid login credentials.",
    };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({
    email: parsed.data.email,
    password: parsed.data.password,
  });

  if (error) {
    return { error: error.message };
  }

  redirect("/dashboard");
}

/**
 * Registers a new user account with Email, Password, and Display Name.
 * Triggers email verification via Supabase Auth + Resend SMTP.
 */
export async function registerWithEmailAction(
  formData: FormData
): Promise<AuthActionResult> {
  const raw = {
    displayName: String(formData.get("displayName") ?? ""),
    email: String(formData.get("email") ?? ""),
    password: String(formData.get("password") ?? ""),
    confirmPassword: String(formData.get("confirmPassword") ?? ""),
  };

  const parsed = registerSchema.safeParse(raw);
  if (!parsed.success) {
    return {
      error:
        parsed.error.issues[0]?.message ||
        "Please check your registration details.",
    };
  }

  const supabase = await createClient();
  const baseUrl = getAppBaseUrl();

  const { error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: {
      emailRedirectTo: `${baseUrl}/auth/callback?next=/dashboard`,
      data: {
        display_name: parsed.data.displayName,
        full_name: parsed.data.displayName,
      },
    },
  });

  if (error) {
    return { error: error.message };
  }

  redirect(`/verify-email?email=${encodeURIComponent(parsed.data.email)}`);
}

/**
 * Initiates the Google OIDC PKCE sign-in flow.
 */
export async function signInWithGoogleAction(): Promise<AuthActionResult> {
  const supabase = await createClient();
  const baseUrl = getAppBaseUrl();

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${baseUrl}/auth/callback?next=/dashboard`,
    },
  });

  if (error) {
    return { error: error.message };
  }

  if (data.url) {
    redirect(data.url);
  }

  return { error: "Unable to initiate Google sign-in." };
}

/**
 * Sends a password reset link to the user's email address.
 */
export async function requestPasswordResetAction(
  formData: FormData
): Promise<AuthActionResult> {
  const raw = {
    email: String(formData.get("email") ?? ""),
  };

  const parsed = forgotPasswordSchema.safeParse(raw);
  if (!parsed.success) {
    return {
      error: parsed.error.issues[0]?.message || "Please enter a valid email.",
    };
  }

  const supabase = await createClient();
  const baseUrl = getAppBaseUrl();

  const { error } = await supabase.auth.resetPasswordForEmail(
    parsed.data.email,
    {
      redirectTo: `${baseUrl}/auth/callback?next=/reset-password`,
    }
  );

  if (error) {
    return { error: error.message };
  }

  return {
    success:
      "If an account exists for that email, a password reset link has been sent to your inbox.",
  };
}

/**
 * Updates the authenticated user's password and dispatches a Resend security alert email.
 */
export async function updatePasswordAction(
  formData: FormData
): Promise<AuthActionResult> {
  const raw = {
    password: String(formData.get("password") ?? ""),
    confirmPassword: String(formData.get("confirmPassword") ?? ""),
  };

  const parsed = resetPasswordSchema.safeParse(raw);
  if (!parsed.success) {
    return {
      error: parsed.error.issues[0]?.message || "Invalid password input.",
    };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      error: "Your reset session has expired. Please request a new link.",
    };
  }

  const { error } = await supabase.auth.updateUser({
    password: parsed.data.password,
  });

  if (error) {
    return { error: error.message };
  }

  if (user.email) {
    await sendAccountNotificationEmail({
      to: user.email,
      displayName:
        user.user_metadata?.display_name ||
        user.user_metadata?.full_name ||
        "Home Chef",
      type: "password_updated",
    });
  }

  redirect("/dashboard");
}

/**
 * Signs out the current user and clears HTTP-only session cookies.
 */
export async function signOutAction() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}
