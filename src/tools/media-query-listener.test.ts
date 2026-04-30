import { describe, expect, it, vi } from "vitest";
import { subscribeMediaQueryChange } from "./media-query-listener";

describe("subscribeMediaQueryChange", () => {
  it("uses addEventListener and removeEventListener when available", () => {
    const handleChange = vi.fn();
    const media = {
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    } as unknown as MediaQueryList;

    const unsubscribe = subscribeMediaQueryChange(media, handleChange);

    expect(media.addEventListener).toHaveBeenCalledWith("change", handleChange);

    unsubscribe();
    expect(media.removeEventListener).toHaveBeenCalledWith(
      "change",
      handleChange
    );
  });

  it("falls back to addListener and removeListener", () => {
    const handleChange = vi.fn();
    const media = {
      addListener: vi.fn(),
      removeListener: vi.fn(),
    } as unknown as MediaQueryList;

    const unsubscribe = subscribeMediaQueryChange(media, handleChange);

    expect(media.addListener).toHaveBeenCalledWith(handleChange);

    unsubscribe();
    expect(media.removeListener).toHaveBeenCalledWith(handleChange);
  });
});
