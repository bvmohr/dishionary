import React from "react";
import { cn } from "@/lib/utils";

export interface DishionaryLogoProps {
  className?: string;
  iconOnly?: boolean;
  size?: "sm" | "md" | "lg";
}

const sizeMap = {
  sm: {
    icon: "h-7 w-7",
    text: "text-lg",
  },
  md: {
    icon: "h-9 w-9",
    text: "text-xl",
  },
  lg: {
    icon: "h-11 w-11",
    text: "text-2xl",
  },
};

/**
 * Custom Dishionary SVG Logo.
 * Combines an open editorial cookbook spine with a culinary cloche dome and steam line.
 * Uses strictly vector paths and currentColor/CSS variables with zero emojis.
 */
export function DishionaryLogo({
  className,
  iconOnly = false,
  size = "md",
}: DishionaryLogoProps) {
  const dimensions = sizeMap[size];

  return (
    <div
      className={cn("inline-flex items-center gap-2.5 select-none", className)}
      data-testid="dishionary-logo"
    >
      <div
        className={cn(
          "relative flex items-center justify-center rounded-lg border border-border bg-surface text-primary shadow-xs",
          dimensions.icon
        )}
      >
        <svg
          viewBox="0 0 36 36"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="h-5/6 w-5/6"
          role="img"
          aria-label="Dishionary emblem"
        >
          {/* Culinary Cloche Handle */}
          <circle
            cx="18"
            cy="7.5"
            r="1.75"
            stroke="currentColor"
            strokeWidth="1.75"
          />
          {/* Culinary Cloche Dome */}
          <path
            d="M9.5 16.5C9.5 11.8056 13.3056 8 18 8C22.6944 8 26.5 11.8056 26.5 16.5"
            stroke="currentColor"
            strokeWidth="1.75"
            strokeLinecap="round"
          />
          {/* Open Cookbook Pages & Spine */}
          <path
            d="M6.5 17.5C10.5 17.5 14.5 18.75 18 21C21.5 18.75 25.5 17.5 29.5 17.5V27.5C25.5 27.5 21.5 28.5 18 30.5C14.5 28.5 10.5 27.5 6.5 27.5V17.5Z"
            stroke="currentColor"
            strokeWidth="1.75"
            strokeLinejoin="round"
          />
          {/* Center Book Spine */}
          <path
            d="M18 21V30.25"
            stroke="currentColor"
            strokeWidth="1.75"
            strokeLinecap="round"
          />
        </svg>
      </div>

      {!iconOnly && (
        <span
          className={cn(
            "font-serif font-semibold tracking-tight text-foreground",
            dimensions.text
          )}
        >
          Dishionary
        </span>
      )}
    </div>
  );
}
