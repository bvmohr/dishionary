import Link from "next/link";
import { DishionaryLogo } from "@/components/brand/dishionary-logo";

export function PublicFooter() {
  return (
    <footer className="border-t border-border bg-surface">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center gap-6 text-center sm:flex-row sm:items-start sm:justify-between sm:text-left">
          <div className="max-w-xs space-y-2">
            <Link
              href="/"
              aria-label="Dishionary Home"
              className="inline-flex justify-center sm:justify-start"
            >
              <DishionaryLogo size="sm" />
            </Link>
            <p className="text-xs leading-relaxed text-muted-foreground">
              Your private digital cookbook. Designed with warm editorial
              typography and crisp SVG craftsmanship.
            </p>
          </div>

          <nav
            aria-label="Footer Navigation"
            className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2.5 text-xs font-medium text-muted-foreground sm:justify-end"
          >
            <a
              href="#features"
              className="transition-colors hover:text-foreground"
            >
              Features
            </a>
            <a
              href="#preview"
              className="transition-colors hover:text-foreground"
            >
              Cookbook Reader
            </a>
            <a
              href="#portability"
              className="transition-colors hover:text-foreground"
            >
              Export &amp; Import
            </a>
            <Link
              href="/login"
              className="transition-colors hover:text-foreground"
            >
              Sign In
            </Link>
            <Link
              href="/register"
              className="text-primary transition-colors hover:text-primary-hover"
            >
              Create Account
            </Link>
          </nav>
        </div>

        <div className="mt-8 border-t border-border pt-6 text-center text-xs text-muted-foreground sm:flex sm:items-center sm:justify-between sm:text-left">
          <p>{new Date().getFullYear()} Dishionary. All rights reserved.</p>
          <p className="mt-1.5 sm:mt-0">
            Independent Cookbooks &middot; Markdown Native &middot; Portable
            JSON
          </p>
        </div>
      </div>
    </footer>
  );
}
