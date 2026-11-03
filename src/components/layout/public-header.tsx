"use client";

import * as React from "react";
import Link from "next/link";
import { Menu, X, ArrowRight } from "lucide-react";
import { DishionaryLogo } from "@/components/brand/dishionary-logo";
import { ThemeToggle } from "@/components/layout/theme-toggle";

const navLinks = [
  { href: "#features", label: "Features" },
  { href: "#preview", label: "Cookbook Reader" },
  { href: "#portability", label: "Export & Import" },
];

export function PublicHeader() {
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  return (
    <header className="sticky top-0 z-30 border-b border-border bg-background/95 backdrop-blur-xs">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-2 px-4 sm:px-6 lg:px-8">
        <Link
          href="/"
          aria-label="Dishionary Home"
          className="shrink-0"
          onClick={() => setMobileMenuOpen(false)}
        >
          <DishionaryLogo size="sm" className="sm:hidden" />
          <DishionaryLogo size="md" className="hidden sm:inline-flex" />
        </Link>

        {/* Desktop & Tablet Navigation */}
        <nav
          aria-label="Primary Navigation"
          className="hidden items-center gap-8 text-sm font-medium text-muted-foreground md:flex"
        >
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="transition-colors hover:text-foreground"
            >
              {link.label}
            </a>
          ))}
        </nav>

        {/* Actions + Mobile Menu Button */}
        <div className="flex items-center gap-2 sm:gap-3">
          <ThemeToggle />

          <Link
            href="/login"
            className="hidden rounded-lg border border-border bg-surface px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-surface-muted sm:inline-flex"
          >
            Sign In
          </Link>

          <Link
            href="/register"
            className="hidden items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary-hover sm:inline-flex"
          >
            <span>Start Your Cookbook</span>
            <ArrowRight className="h-4 w-4" strokeWidth={1.75} />
          </Link>

          {/* Mobile Primary CTA (Compact) */}
          <Link
            href="/register"
            className="inline-flex h-10 items-center justify-center rounded-lg bg-primary px-3.5 text-xs font-medium whitespace-nowrap text-primary-foreground transition-colors hover:bg-primary-hover sm:hidden"
          >
            Get Started
          </Link>

          {/* Mobile Hamburger Menu Button */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            aria-expanded={mobileMenuOpen}
            aria-controls="mobile-navigation-menu"
            aria-label={
              mobileMenuOpen ? "Close navigation menu" : "Open navigation menu"
            }
            className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-border bg-surface text-foreground transition-colors hover:bg-surface-muted md:hidden"
          >
            {mobileMenuOpen ? (
              <X className="h-5 w-5" strokeWidth={1.75} />
            ) : (
              <Menu className="h-5 w-5" strokeWidth={1.75} />
            )}
          </button>
        </div>
      </div>

      {/* Collapsible Mobile Navigation Drawer */}
      {mobileMenuOpen && (
        <div
          id="mobile-navigation-menu"
          className="border-t border-border bg-surface px-4 pt-3 pb-5 shadow-sm md:hidden"
        >
          <nav
            aria-label="Mobile Navigation"
            className="flex flex-col space-y-1"
          >
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="rounded-lg px-3 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-surface-muted"
              >
                {link.label}
              </a>
            ))}
          </nav>

          <div className="mt-4 grid grid-cols-2 gap-2.5 border-t border-border pt-4 sm:hidden">
            <Link
              href="/login"
              onClick={() => setMobileMenuOpen(false)}
              className="inline-flex items-center justify-center rounded-lg border border-border bg-background px-4 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-surface-muted"
            >
              Sign In
            </Link>
            <Link
              href="/register"
              onClick={() => setMobileMenuOpen(false)}
              className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary-hover"
            >
              <span>Create Account</span>
              <ArrowRight className="h-4 w-4" strokeWidth={1.75} />
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
