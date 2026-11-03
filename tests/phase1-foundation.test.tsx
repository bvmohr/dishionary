import { describe, it, expect } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import React from "react";
import { cn, formatDuration } from "@/lib/utils";
import { DishionaryLogo } from "@/components/brand/dishionary-logo";
import { PublicHeader } from "@/components/layout/public-header";
import HomePage from "@/app/page";

describe("Phase 1 Foundation & Design System", () => {
  describe("cn() class merger utility", () => {
    it("merges conditional classes and resolves Tailwind conflicts", () => {
      expect(cn("px-4 py-2", false && "hidden", "px-6")).toBe("py-2 px-6");
    });
  });

  describe("formatDuration() culinary time formatter", () => {
    it("formats sub-hour durations in minutes", () => {
      expect(formatDuration(25)).toBe("25 min");
    });

    it("formats exact hour durations cleanly", () => {
      expect(formatDuration(60)).toBe("1 hr");
      expect(formatDuration(120)).toBe("2 hr");
    });

    it("formats mixed hours and minutes", () => {
      expect(formatDuration(95)).toBe("1 hr 35 min");
    });

    it("handles zero or negative values safely", () => {
      expect(formatDuration(0)).toBe("0 min");
      expect(formatDuration(-15)).toBe("0 min");
    });
  });

  describe("<DishionaryLogo /> custom SVG brand component", () => {
    it("renders both the custom SVG emblem and brand title by default", () => {
      render(<DishionaryLogo />);
      expect(screen.getByTestId("dishionary-logo")).toBeInTheDocument();
      expect(
        screen.getByRole("img", { name: /dishionary emblem/i })
      ).toBeInTheDocument();
      expect(screen.getByText("Dishionary")).toBeInTheDocument();
    });

    it("hides the text wordmark when iconOnly is true", () => {
      render(<DishionaryLogo iconOnly />);
      expect(
        screen.getByRole("img", { name: /dishionary emblem/i })
      ).toBeInTheDocument();
      expect(screen.queryByText("Dishionary")).not.toBeInTheDocument();
    });
  });

  describe("Landing Page (HomePage)", () => {
    it("renders the hero headline, cookbook preview, and zero emojis", () => {
      const { container } = render(<HomePage />);
      expect(
        screen.getByRole("heading", {
          name: /your personal recipes, beautifully typeset and ready to cook/i,
        })
      ).toBeInTheDocument();

      // Verify core architectural preview sections exist
      expect(
        screen.getAllByText(/Herb-Crusted Rack of Lamb/i).length
      ).toBeGreaterThan(0);
      expect(
        screen.getByText(/Conversation-Style Recipe Sidebar/i)
      ).toBeInTheDocument();

      // Strict guardrail: verify zero emoji characters in rendered text
      const emojiRegex = /\p{Extended_Pictographic}/u;
      expect(emojiRegex.test(container.textContent || "")).toBe(false);
    });
  });

  describe("<PublicHeader /> mobile navigation menu", () => {
    it("toggles the collapsible mobile navigation drawer when the menu button is clicked", () => {
      render(<PublicHeader />);
      const toggleBtn = screen.getByRole("button", {
        name: /open navigation menu/i,
      });
      expect(toggleBtn).toHaveAttribute("aria-expanded", "false");

      fireEvent.click(toggleBtn);
      expect(
        screen.getByRole("button", { name: /close navigation menu/i })
      ).toHaveAttribute("aria-expanded", "true");
      expect(
        screen.getByRole("navigation", { name: /mobile navigation/i })
      ).toBeInTheDocument();
    });
  });
});
