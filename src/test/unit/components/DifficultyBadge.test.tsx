import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { DifficultyBadge } from "@/components/DifficultyBadge";

describe("DifficultyBadge", () => {
  it("renders 'Easy' label", () => {
    render(<DifficultyBadge difficulty="Easy" />);
    expect(screen.getByText("Easy")).toBeInTheDocument();
  });

  it("renders 'Medium' label", () => {
    render(<DifficultyBadge difficulty="Medium" />);
    expect(screen.getByText("Medium")).toBeInTheDocument();
  });

  it("renders 'Hard' label", () => {
    render(<DifficultyBadge difficulty="Hard" />);
    expect(screen.getByText("Hard")).toBeInTheDocument();
  });

  it("applies Easy difficulty CSS classes", () => {
    const { container } = render(<DifficultyBadge difficulty="Easy" />);
    const badge = container.firstChild as HTMLElement;
    expect(badge.className).toContain("bg-easy");
    expect(badge.className).toContain("text-easy");
  });

  it("applies Medium difficulty CSS classes", () => {
    const { container } = render(<DifficultyBadge difficulty="Medium" />);
    const badge = container.firstChild as HTMLElement;
    expect(badge.className).toContain("text-primary");
  });

  it("applies Hard difficulty CSS classes", () => {
    const { container } = render(<DifficultyBadge difficulty="Hard" />);
    const badge = container.firstChild as HTMLElement;
    expect(badge.className).toContain("bg-hard");
    expect(badge.className).toContain("text-hard");
  });

  it("renders as a span element", () => {
    const { container } = render(<DifficultyBadge difficulty="Easy" />);
    expect(container.querySelector("span")).toBeInTheDocument();
  });

  it("has correct structure for all three difficulties (snapshot-style)", () => {
    const difficulties = ["Easy", "Medium", "Hard"] as const;
    for (const d of difficulties) {
      const { getByText } = render(<DifficultyBadge difficulty={d} />);
      expect(getByText(d)).toBeVisible();
    }
  });
});
