import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import MediaSlot from ".";
import type { MediaSlotValue } from "../../routes/Media/media-utils.ts";

describe("MediaSlot", () => {
  it("renders post content as a single-line image caption", () => {
    const media: MediaSlotValue = {
      attachment: {
        id: "image-1",
        mimeType: "image/png",
        thumbnailUrl: "blob:thumb",
        sourceUrl: "blob:source",
      },
      postId: "post-1",
      postContent: "hello, world from a long post",
      createdAt: "2026-04-30T08:00:00.000Z",
    };

    const markup = renderToStaticMarkup(<MediaSlot media={media} />);

    expect(markup).toContain("hello, world from a long post");
    expect(markup).toContain('src="blob:source"');
    expect(markup).toContain("text-overflow:ellipsis");
    expect(markup).toContain("white-space:nowrap");
  });
});
