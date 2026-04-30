import { describe, expect, it } from "vitest";
import { getNextTabBarState } from "./scroll";

describe("getNextTabBarState", () => {
  it("keeps the tab bar visible near the top", () => {
    expect(getNextTabBarState({ currentY: 4, lastY: 40, isVisible: false })).toBe("show");
  });

  it("hides the tab bar after a meaningful downward scroll", () => {
    expect(getNextTabBarState({ currentY: 120, lastY: 80, isVisible: true })).toBe("hide");
  });

  it("shows the tab bar after a meaningful upward scroll", () => {
    expect(getNextTabBarState({ currentY: 80, lastY: 120, isVisible: false })).toBe("show");
  });

  it("keeps the current state for small scroll jitter", () => {
    expect(getNextTabBarState({ currentY: 86, lastY: 80, isVisible: true })).toBe("keep");
    expect(getNextTabBarState({ currentY: 74, lastY: 80, isVisible: false })).toBe("keep");
  });
});
