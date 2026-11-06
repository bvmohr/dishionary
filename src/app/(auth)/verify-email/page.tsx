import Link from "next/link";
import { MailCheck, ArrowLeft } from "lucide-react";

export default async function VerifyEmailPage({
  searchParams,
}: {
  searchParams: Promise<{ email?: string }>;
}) {
  const params = await searchParams;
  const email = params?.email;

  return (
    <div className="text-center">
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl border border-border bg-surface-muted text-primary">
        <MailCheck className="h-6 w-6" strokeWidth={1.75} />
      </div>

      <h1 className="mt-4 font-serif text-2xl font-semibold text-foreground sm:text-3xl">
        Check your inbox
      </h1>

      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
        We sent a verification link to{" "}
        {email ? (
          <strong className="font-medium text-foreground">{email}</strong>
        ) : (
          "your email address"
        )}
        . Click the link in that email to activate your personal Dishionary
        cookbook.
      </p>

      <div className="mt-6 rounded-xl border border-border bg-surface-muted/50 p-4 text-left text-xs leading-relaxed text-muted-foreground">
        <p className="font-medium text-foreground">
          Didn&apos;t receive the email?
        </p>
        <ul className="mt-1.5 list-disc space-y-1 pl-4">
          <li>Check your spam or promotions folder.</li>
          <li>Verify that you entered the correct email address.</li>
        </ul>
      </div>

      <div className="mt-6">
        <Link
          href="/login"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-primary hover:text-primary-hover"
        >
          <ArrowLeft className="h-3.5 w-3.5" strokeWidth={1.75} />
          <span>Return to Sign In</span>
        </Link>
      </div>
    </div>
  );
}
