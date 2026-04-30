/**
 * Subscribe to system color-scheme changes.
 * Modern browsers use EventTarget APIs; deprecated listener APIs are fallback only.
 */
export function subscribeMediaQueryChange(
  media: MediaQueryList,
  handleChange: (event: MediaQueryListEvent) => void
) {
  if (typeof media.addEventListener === "function") {
    media.addEventListener("change", handleChange);
    return () => media.removeEventListener("change", handleChange);
  }

  media.addListener(handleChange);
  return () => media.removeListener(handleChange);
}
