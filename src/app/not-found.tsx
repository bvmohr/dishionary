import Link from "next/link";
import { Compass, ArrowLeft } from "lucide-react";
import { DishionaryLogo } from "@/components/brand/dishionary-logo";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4 text-center text-foreground">
      <DishionaryLogo size="md" className="mb-8" />
      <div className="mx-auto max-w-md rounded-2xl border border-border bg-surface p-8 shadow-xs">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl border border-border bg-surface-muted text-primary">
          <Compass className="h-6 w-6" strokeWidth={1.75} />
        </div>
        <p className="mt-4 font-mono text-xs font-semibold tracking-wider text-primary uppercase">
          Error 404
        </p>
        <h1 className="mt-2 font-serif text-2xl font-semibold text-foreground">
          Page or Recipe Not Found
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          We couldn&apos;t find the page you were looking for. It may have been
          moved, deleted, or the recipe link may have expired.
        </p>
        <div className="mt-6">
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary-hover"
          >
            <ArrowLeft className="h-4 w-4" strokeWidth={1.75} />
            <span>Return to Dishionary</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
