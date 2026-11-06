import Link from "next/link";
import { DishionaryLogo } from "@/components/brand/dishionary-logo";
import { ThemeToggle } from "@/components/layout/theme-toggle";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <header className="border-b border-border bg-background/95">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link href="/" aria-label="Dishionary Home">
            <DishionaryLogo size="sm" />
          </Link>
          <ThemeToggle />
        </div>
      </header>

      <main className="flex flex-1 items-center justify-center px-4 py-10 sm:px-6">
        <div className="w-full max-w-md rounded-2xl border border-border bg-surface p-6 shadow-xs sm:p-8">
          {children}
        </div>
      </main>

      <footer className="py-6 text-center text-xs text-muted-foreground">
        <p>Dishionary &middot; Private Digital Cookbook</p>
      </footer>
    </div>
  );
}
