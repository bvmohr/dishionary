import React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeSanitize from "rehype-sanitize";
import { cn } from "@/lib/utils";

export interface RecipeMarkdownRendererProps {
  markdown: string;
  className?: string;
}

/**
 * Safely renders recipe instructions in GitHub Flavored Markdown (GFM).
 * Enforces strict XSS sanitization via rehype-sanitize so untrusted tags
 * (<script>, <iframe>, onerror, javascript: links) are stripped.
 */
export function RecipeMarkdownRenderer({
  markdown,
  className,
}: RecipeMarkdownRendererProps) {
  return (
    <div
      className={cn(
        "recipe-markdown space-y-4 text-sm leading-relaxed text-foreground sm:text-base",
        className
      )}
      data-testid="recipe-markdown-renderer"
    >
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeSanitize]}
        components={{
          h1: ({ children }) => (
            <h2 className="mt-6 mb-2 font-serif text-2xl font-semibold text-foreground first:mt-0">
              {children}
            </h2>
          ),
          h2: ({ children }) => (
            <h3 className="mt-6 mb-2 font-serif text-xl font-semibold text-foreground first:mt-0">
              {children}
            </h3>
          ),
          h3: ({ children }) => (
            <h4 className="mt-4 mb-1.5 font-serif text-lg font-semibold text-foreground first:mt-0">
              {children}
            </h4>
          ),
          p: ({ children }) => (
            <p className="leading-relaxed text-foreground/90">{children}</p>
          ),
          ul: ({ children }) => (
            <ul className="my-3 list-disc space-y-1.5 pl-5 text-foreground/90">
              {children}
            </ul>
          ),
          ol: ({ children }) => (
            <ol className="my-3 list-decimal space-y-2 pl-5 text-foreground/90">
              {children}
            </ol>
          ),
          li: ({ children }) => <li className="pl-1">{children}</li>,
          blockquote: ({ children }) => (
            <blockquote className="my-4 rounded-r-xl border-l-4 border-primary bg-surface-muted/60 px-4 py-3 text-sm italic text-muted-foreground">
              {children}
            </blockquote>
          ),
          code: ({ children }) => (
            <code className="rounded border border-border bg-surface-muted px-1.5 py-0.5 font-mono text-xs text-primary">
              {children}
            </code>
          ),
          strong: ({ children }) => (
            <strong className="font-semibold text-foreground">
              {children}
            </strong>
          ),
          hr: () => <hr className="my-6 border-border" />,
          a: ({ href, children }) => {
            const safeHref =
              href &&
              (href.startsWith("https://") || href.startsWith("http://"))
                ? href
                : "#";
            return (
              <a
                href={safeHref}
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-primary underline underline-offset-4 hover:text-primary-hover"
              >
                {children}
              </a>
            );
          },
        }}
      >
        {markdown}
      </ReactMarkdown>
    </div>
  );
}
