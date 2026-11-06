import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { sendAccountNotificationEmail } from "@/lib/email/notifications";
import { db, profiles } from "@/db";

/**
 * Handles the OAuth 2.0 / Google OIDC PKCE code exchange and email verification callbacks.
 * Sets secure HTTP-only cookies and provisions the user's profile row if needed.
 */
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const nextParam = searchParams.get("next") ?? "/dashboard";
  const safeNext = nextParam.startsWith("/") ? nextParam : "/dashboard";

  if (code) {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error && data.user) {
      const user = data.user;
      const displayName =
        user.user_metadata?.display_name ||
        user.user_metadata?.full_name ||
        user.user_metadata?.name ||
        user.email?.split("@")[0] ||
        "Home Chef";

      // Ensure a corresponding profile exists in PostgreSQL if Drizzle DB is connected
      if (db) {
        try {
          await db
            .insert(profiles)
            .values({
              id: user.id,
              displayName,
              avatarUrl: user.user_metadata?.avatar_url ?? null,
            })
            .onConflictDoNothing();
        } catch (dbErr) {
          console.error("Profile upsert note:", dbErr);
        }
      }

      // Send welcome confirmation email on initial verification
      if (user.email && safeNext === "/dashboard") {
        await sendAccountNotificationEmail({
          to: user.email,
          displayName,
          type: "welcome_verified",
        });
      }

      return NextResponse.redirect(`${origin}${safeNext}`);
    }
  }

  return NextResponse.redirect(
    `${origin}/login?error=Unable+to+verify+authentication+code`
  );
}
