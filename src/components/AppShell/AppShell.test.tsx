import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import AppShell from ".";

describe("AppShell", () => {
  it("renders children inside the app shell container", () => {
    const markup = renderToStaticMarkup(
      <AppShell>
        <span>content</span>
      </AppShell>
    );

    expect(markup).toContain('class="app-shell"');
    expect(markup).toContain("<span>content</span>");
  });
});
