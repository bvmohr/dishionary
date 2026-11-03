import Link from "next/link";
import {
  BookOpen,
  Clock,
  Share2,
  LayoutGrid,
  FileText,
  ShieldCheck,
  Maximize2,
  ArrowRight,
  Check,
  PanelLeft,
} from "lucide-react";
import { PublicHeader } from "@/components/layout/public-header";
import { PublicFooter } from "@/components/layout/public-footer";
import { formatDuration } from "@/lib/utils";

const sampleSidebarRecipes = [
  {
    id: "1",
    title: "Herb-Crusted Rack of Lamb",
    category: "Main Course",
    timeMinutes: 55,
    active: true,
  },
  {
    id: "2",
    title: "Saffron Risotto Milanese",
    category: "Side Dish",
    timeMinutes: 40,
    active: false,
  },
  {
    id: "3",
    title: "Charred Broccolini & Lemon",
    category: "Vegetable",
    timeMinutes: 20,
    active: false,
  },
  {
    id: "4",
    title: "Brown Butter Sage Tart",
    category: "Dessert",
    timeMinutes: 75,
    active: false,
  },
];

const featureHighlights = [
  {
    icon: FileText,
    title: "Hybrid Form & Markdown Authoring",
    description:
      "Update cook times, servings, and structured ingredient rows with clean form fields while formatting cooking steps in rich, sanitized Markdown.",
  },
  {
    icon: PanelLeft,
    title: "Conversation-Style Recipe Sidebar",
    description:
      "Switch effortlessly between your main course, sauce, and side dishes in a persistent left sidebar without losing your reading position.",
  },
  {
    icon: Maximize2,
    title: "Quick View & Fullscreen Reader",
    description:
      "Peek at any dish from your dashboard in a scrollable Quick View drawer, or expand into a distraction-free fullscreen reader while cooking.",
  },
  {
    icon: Share2,
    title: "Portable Recipe Export & Import",
    description:
      "Export any recipe—including metadata, Markdown instructions, and dish photography—as a portable .dishionary.json file or shareable link.",
  },
  {
    icon: LayoutGrid,
    title: "Adaptive Grid & List Views",
    description:
      "Browse your personal cookbook visually with rich photography cards in Grid mode or scan large collections rapidly in List mode.",
  },
  {
    icon: ShieldCheck,
    title: "Private, Independent Cookbooks",
    description:
      "Protected with server-side session cookies, Google OIDC, and PostgreSQL Row-Level Security so your personal recipes remain strictly yours.",
  },
];

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      {/* Top Navigation */}
      <PublicHeader />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="mx-auto max-w-7xl px-4 pt-10 pb-14 sm:px-6 sm:pt-14 sm:pb-16 md:pt-20 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-border bg-surface px-3.5 py-1.5 text-xs font-medium text-muted-foreground sm:mb-6">
              <BookOpen
                className="h-3.5 w-3.5 shrink-0 text-primary"
                strokeWidth={1.75}
              />
              <span>Crafted for Home Cooks &amp; Culinary Curators</span>
            </div>

            <h1 className="font-serif text-3xl font-semibold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
              Your personal recipes, beautifully typeset and ready to cook.
            </h1>

            <p className="mt-5 text-base leading-relaxed text-muted-foreground sm:mt-6 sm:text-lg">
              Dishionary combines structured form inputs with clean Markdown
              formatting, giving you an independent cookbook with Grid and List
              views, a conversation-style recipe switcher, and one-click recipe
              export and import.
            </p>

            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link
                href="/register"
                className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-6 py-3 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary-hover sm:w-auto"
              >
                <span>Create Free Account</span>
                <ArrowRight className="h-4 w-4" strokeWidth={1.75} />
              </Link>
              <Link
                href="/login"
                className="inline-flex w-full items-center justify-center rounded-lg border border-border bg-surface px-6 py-3 text-sm font-medium text-foreground transition-colors hover:bg-surface-muted sm:w-auto"
              >
                Sign In to Cookbook
              </Link>
            </div>
          </div>

          {/* Interactive Architectural Preview of the Cookbook Split View */}
          <div
            id="preview"
            className="mt-12 overflow-hidden rounded-2xl border border-border bg-surface shadow-sm sm:mt-14"
          >
            {/* Mock Window Bar */}
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border bg-surface-muted px-3.5 py-2.5 sm:px-4 sm:py-3">
              <div className="flex min-w-0 items-center gap-1.5 sm:gap-2">
                <span className="h-2.5 w-2.5 shrink-0 rounded-full bg-border" />
                <span className="h-2.5 w-2.5 shrink-0 rounded-full bg-border" />
                <span className="h-2.5 w-2.5 shrink-0 rounded-full bg-border" />
                <span className="ml-1.5 truncate font-mono text-xs text-muted-foreground">
                  /cookbook/herb-crusted-rack-of-lamb
                </span>
              </div>
              <div className="flex shrink-0 items-center gap-1.5 text-xs text-muted-foreground sm:gap-2">
                <span className="rounded-md border border-border bg-surface px-2 py-0.5 font-medium text-foreground sm:px-2.5 sm:py-1">
                  Quick View
                </span>
                <span className="rounded-md bg-primary px-2 py-0.5 font-medium text-primary-foreground sm:px-2.5 sm:py-1">
                  Fullscreen Reader
                </span>
              </div>
            </div>

            {/* Split-Pane Cookbook Preview */}
            <div className="grid grid-cols-1 md:grid-cols-12">
              {/* Conversation-Style Recipe Sidebar */}
              <aside className="border-b border-border bg-surface-muted/50 p-4 md:col-span-4 md:border-r md:border-b-0 lg:col-span-3">
                <div className="mb-3 flex items-center justify-between">
                  <span className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                    My Cookbook (24)
                  </span>
                  <span className="font-mono text-xs text-primary">
                    Sidebar Nav
                  </span>
                </div>
                <div className="space-y-2">
                  {sampleSidebarRecipes.map((item) => (
                    <div
                      key={item.id}
                      className={`rounded-xl border p-3 transition-colors ${
                        item.active
                          ? "border-primary bg-surface shadow-2xs"
                          : "border-transparent bg-transparent hover:bg-surface/60"
                      }`}
                    >
                      <p className="font-serif text-sm font-medium text-foreground">
                        {item.title}
                      </p>
                      <div className="mt-1.5 flex items-center justify-between text-xs text-muted-foreground">
                        <span>{item.category}</span>
                        <span className="inline-flex items-center gap-1 font-mono">
                          <Clock className="h-3 w-3" strokeWidth={1.75} />
                          {formatDuration(item.timeMinutes)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </aside>

              {/* Main Scrollable Recipe Canvas */}
              <div className="p-5 sm:p-8 md:col-span-8 lg:col-span-9">
                <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border pb-6">
                  <div>
                    <span className="inline-flex items-center rounded-md bg-secondary-accent/15 px-2.5 py-1 text-xs font-medium text-secondary-accent">
                      Main Course
                    </span>
                    <h2 className="mt-2 font-serif text-2xl font-semibold text-foreground sm:text-3xl">
                      Herb-Crusted Rack of Lamb
                    </h2>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Roast rack of lamb coated with fresh rosemary, thyme,
                      garlic, and toasted breadcrumbs.
                    </p>
                  </div>

                  <div className="flex w-full items-center justify-around gap-3 rounded-xl border border-border bg-surface-muted px-4 py-2.5 font-mono text-xs sm:w-auto sm:justify-start sm:gap-4">
                    <div>
                      <span className="block text-muted-foreground">PREP</span>
                      <span className="font-semibold text-foreground">
                        {formatDuration(20)}
                      </span>
                    </div>
                    <div className="h-6 w-px bg-border" />
                    <div>
                      <span className="block text-muted-foreground">COOK</span>
                      <span className="font-semibold text-foreground">
                        {formatDuration(35)}
                      </span>
                    </div>
                    <div className="h-6 w-px bg-border" />
                    <div>
                      <span className="block text-muted-foreground">
                        SERVES
                      </span>
                      <span className="font-semibold text-foreground">4</span>
                    </div>
                  </div>
                </div>

                {/* Ingredients & Markdown Instructions Split */}
                <div className="mt-6 grid grid-cols-1 gap-8 lg:grid-cols-12">
                  <div className="lg:col-span-5">
                    <h3 className="font-serif text-lg font-medium text-foreground">
                      Ingredients
                    </h3>
                    <ul className="mt-3 space-y-2.5 text-sm">
                      {[
                        "2 lbs frenched rack of lamb",
                        "2 tbsp Dijon mustard",
                        "1 cup fresh sourdough breadcrumbs",
                        "2 tbsp fresh rosemary, finely minced",
                        "3 cloves garlic, grated",
                      ].map((ingredient, index) => (
                        <li
                          key={ingredient}
                          className="flex items-start gap-2.5 rounded-lg border border-border bg-surface-muted/40 px-3 py-2"
                        >
                          <span
                            className={`mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded border ${
                              index < 2
                                ? "border-primary bg-primary text-primary-foreground"
                                : "border-border bg-surface"
                            }`}
                          >
                            {index < 2 && (
                              <Check className="h-3 w-3" strokeWidth={2.25} />
                            )}
                          </span>
                          <span
                            className={
                              index < 2
                                ? "text-muted-foreground line-through"
                                : "text-foreground"
                            }
                          >
                            {ingredient}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="lg:col-span-7">
                    <div className="flex items-center justify-between">
                      <h3 className="font-serif text-lg font-medium text-foreground">
                        Markdown Instructions
                      </h3>
                      <span className="font-mono text-xs text-muted-foreground">
                        Rendered via Markdown
                      </span>
                    </div>
                    <div className="mt-3 space-y-4 rounded-xl border border-border bg-surface-muted/30 p-4 text-sm leading-relaxed text-foreground sm:p-5">
                      <div>
                        <h4 className="font-serif text-base font-semibold">
                          1. Temper &amp; Sear the Lamb
                        </h4>
                        <p className="mt-1 text-muted-foreground">
                          Remove the lamb from the refrigerator{" "}
                          <strong className="font-semibold text-foreground">
                            30 minutes
                          </strong>{" "}
                          prior to cooking. Season generously with kosher salt
                          and sear fat-side down in a cast-iron skillet for 4
                          minutes until golden brown.
                        </p>
                      </div>
                      <div>
                        <h4 className="font-serif text-base font-semibold">
                          2. Apply the Herb Crust &amp; Roast
                        </h4>
                        <p className="mt-1 text-muted-foreground">
                          Brush the seared meat with Dijon mustard and press the
                          rosemary breadcrumb mixture firmly onto the surface.
                          Roast at{" "}
                          <code className="rounded bg-surface px-1.5 py-0.5 font-mono text-xs text-primary">
                            425°F (220°C)
                          </code>{" "}
                          for 20–25 minutes until internal temperature reaches{" "}
                          <code className="rounded bg-surface px-1.5 py-0.5 font-mono text-xs text-primary">
                            130°F
                          </code>{" "}
                          for medium-rare.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Feature Grid */}
        <section
          id="features"
          className="border-t border-border bg-surface-muted/40 py-14 sm:py-20"
        >
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="max-w-2xl">
              <span className="font-mono text-xs font-semibold tracking-wider text-primary uppercase">
                Built for Clarity
              </span>
              <h2 className="mt-2 font-serif text-2xl font-semibold text-foreground sm:text-4xl">
                Everything a serious home cookbook needs—nothing it
                doesn&apos;t.
              </h2>
            </div>

            <div className="mt-10 grid grid-cols-1 gap-5 sm:mt-12 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3">
              {featureHighlights.map((feature) => {
                const Icon = feature.icon;
                return (
                  <article
                    key={feature.title}
                    className="flex flex-col justify-between rounded-xl border border-border bg-surface p-6 transition-colors hover:border-primary/50"
                  >
                    <div>
                      <div className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-border bg-surface-muted text-primary">
                        <Icon className="h-5 w-5" strokeWidth={1.75} />
                      </div>
                      <h3 className="mt-4 font-serif text-xl font-semibold text-foreground">
                        {feature.title}
                      </h3>
                      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                        {feature.description}
                      </p>
                    </div>
                  </article>
                );
              })}
            </div>
          </div>
        </section>

        {/* Portability Callout */}
        <section
          id="portability"
          className="border-t border-border bg-background py-14 sm:py-20"
        >
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 items-center gap-8 rounded-2xl border border-border bg-surface p-6 sm:gap-10 sm:p-12 lg:grid-cols-12">
              <div className="lg:col-span-7">
                <span className="font-mono text-xs font-semibold tracking-wider text-secondary-accent uppercase">
                  Open Recipe Exchange
                </span>
                <h2 className="mt-2 font-serif text-2xl font-semibold text-foreground sm:text-3xl">
                  Share recipes across cookbooks without losing formatting or
                  photos.
                </h2>
                <p className="mt-4 text-sm leading-relaxed text-muted-foreground sm:text-base">
                  Export any dish as a self-contained{" "}
                  <code className="rounded border border-border bg-surface-muted px-1.5 py-0.5 font-mono text-xs text-foreground">
                    .dishionary.json
                  </code>{" "}
                  bundle or generate a private share token. When another user
                  imports your recipe, all cook times, structured ingredients,
                  Markdown steps, and image URLs arrive intact in their own
                  cookbook.
                </p>
              </div>
              <div className="min-w-0 lg:col-span-5">
                <pre className="overflow-x-auto rounded-xl border border-border bg-surface-muted p-4 font-mono text-xs leading-relaxed text-foreground">
                  {`{
  "schemaVersion": "1.0",
  "sourceApp": "Dishionary",
  "recipe": {
    "title": "Herb-Crusted Rack of Lamb",
    "prepTimeMinutes": 20,
    "cookTimeMinutes": 35,
    "imageUrl": "https://.../lamb-rack.webp",
    "instructionsMarkdown": "## 1. Sear..."
  }
}`}
                </pre>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <PublicFooter />
    </div>
  );
}
