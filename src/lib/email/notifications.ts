import { Resend } from "resend";
import { getAppBaseUrl } from "@/lib/supabase/config";

export type AccountNotificationType =
  | "password_updated"
  | "email_update_requested"
  | "profile_updated"
  | "welcome_verified";

export interface SendAccountNotificationParams {
  to: string;
  displayName?: string;
  type: AccountNotificationType;
}

const notificationCopy: Record<
  AccountNotificationType,
  { subject: string; heading: string; body: string }
> = {
  password_updated: {
    subject: "Dishionary Security Alert: Your password was updated",
    heading: "Your password has been changed",
    body: "Your Dishionary account password was recently updated. If you made this change, no further action is needed. If you did not authorize this update, please reset your password immediately.",
  },
  email_update_requested: {
    subject: "Dishionary Security Alert: Email address change requested",
    heading: "Email change requested on your account",
    body: "A request was made to update the email address associated with your Dishionary cookbook. Please check your inbox to confirm the new address.",
  },
  profile_updated: {
    subject: "Dishionary: Your account profile was updated",
    heading: "Account settings updated",
    body: "Your Dishionary profile preferences and account details have been saved.",
  },
  welcome_verified: {
    subject: "Welcome to Dishionary — Your cookbook is ready",
    heading: "Welcome to your private digital cookbook",
    body: "Your email is verified and your Dishionary cookbook is ready. Start adding recipes in Markdown, organizing collections, or importing .dishionary.json recipes.",
  },
};

/**
 * Builds a clean, warm-toned HTML email body with zero emojis.
 */
export function buildAccountEmailHtml({
  displayName = "Home Chef",
  heading,
  body,
  logoSrc,
}: {
  displayName?: string;
  heading: string;
  body: string;
  logoSrc?: string;
}): string {
  const appUrl = getAppBaseUrl();
  const resolvedLogoSrc = logoSrc || `${appUrl}/api/logo`;
  return `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${heading}</title>
  </head>
  <body style="margin:0;padding:32px 16px;background-color:#FAF7F2;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;color:#1F1A17;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:540px;margin:0 auto;background-color:#FFFFFF;border:1px solid #E5DDD3;border-radius:14px;padding:32px;">
      <tr>
        <td>
          <div style="margin:0 0 18px 0;">
            <img src="${resolvedLogoSrc}" alt="Dishionary Logo" width="44" height="44" style="display:block;border-radius:10px;border:1px solid #E5DDD3;" />
          </div>
          <p style="margin:0 0 8px 0;font-size:12px;font-weight:600;letter-spacing:0.08em;text-transform:uppercase;color:#C85A32;">
            Dishionary Cookbook
          </p>
          <h1 style="margin:0 0 16px 0;font-family:Georgia,serif;font-size:24px;font-weight:600;color:#1F1A17;">
            ${heading}
          </h1>
          <p style="margin:0 0 14px 0;font-size:15px;line-height:1.6;color:#1F1A17;">
            Hello ${displayName},
          </p>
          <p style="margin:0 0 24px 0;font-size:15px;line-height:1.6;color:#6E6259;">
            ${body}
          </p>
          <a href="${appUrl}/dashboard" style="display:inline-block;background-color:#C85A32;color:#FFFFFF;text-decoration:none;font-size:14px;font-weight:600;padding:10px 20px;border-radius:8px;">
            Open My Cookbook
          </a>
          <hr style="border:none;border-top:1px solid #E5DDD3;margin:28px 0 16px 0;" />
          <p style="margin:0;font-size:12px;color:#6E6259;">
            Sent by Dishionary. Your private, independent digital cookbook.
          </p>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

/**
 * Normalizes EMAIL_FROM into valid RFC 5322 format ("Display Name <email@domain.com>" or "email@domain.com").
 */
export function normalizeEmailFrom(rawFrom?: string): string {
  const fallback = "Dishionary <noreply@dishionary.app>";
  if (!rawFrom || !rawFrom.trim()) {
    return fallback;
  }

  const trimmed = rawFrom.trim();
  // Already has angle brackets or is a plain email without spaces
  if (trimmed.includes("<") || !trimmed.includes(" ")) {
    return trimmed;
  }

  // Format like "Dishionary support@mail.bvmohr.dev" -> "Dishionary <support@mail.bvmohr.dev>"
  const parts = trimmed.split(/\s+/);
  const emailPart = parts.pop();
  const namePart = parts.join(" ");
  if (emailPart && emailPart.includes("@")) {
    return `${namePart} <${emailPart}>`;
  }

  return trimmed;
}

/**
 * Sends a transactional account notification email via Resend.
 * Gracefully falls back to safe server logging if RESEND_API_KEY is not configured.
 */
export async function sendAccountNotificationEmail({
  to,
  displayName,
  type,
}: SendAccountNotificationParams): Promise<{ sent: boolean; id?: string }> {
  const copy = notificationCopy[type];

  const apiKey = process.env.RESEND_API_KEY;
  const fromAddress = normalizeEmailFrom(process.env.EMAIL_FROM);

  if (!apiKey || apiKey.startsWith("re_your_")) {
    return { sent: false };
  }

  try {
    // Generate inline PNG buffer for CID attachment so the logo renders even when testing on localhost
    let logoBuffer: Buffer | undefined;
    try {
      const { GET: getLogoResponse } = await import("@/app/api/logo/route");
      const logoRes = await getLogoResponse();
      const arrayBuf = await logoRes.arrayBuffer();
      logoBuffer = Buffer.from(arrayBuf);
    } catch {
      // Fallback to hosted URL if ImageResponse is unavailable in test env
    }

    const html = buildAccountEmailHtml({
      displayName,
      heading: copy.heading,
      body: copy.body,
      logoSrc: logoBuffer ? "cid:dishionary-logo" : undefined,
    });

    const resend = new Resend(apiKey);
    const { data, error } = await resend.emails.send({
      from: fromAddress,
      to: [to],
      subject: copy.subject,
      html,
      attachments: logoBuffer
        ? [
            {
              filename: "dishionary-logo.png",
              content: logoBuffer,
              contentId: "dishionary-logo",
            },
          ]
        : undefined,
    });

    if (error) {
      console.error("Failed to dispatch Resend notification email:", error);
      return { sent: false };
    }

    return { sent: true, id: data?.id };
  } catch (err) {
    console.error("Unexpected error sending notification email:", err);
    return { sent: false };
  }
}
