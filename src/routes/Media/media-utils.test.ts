import { describe, expect, it } from "vitest";
import {
  createEmptyMediaSlots,
  getMediaRefs,
  setFirstEmptyMediaSlot,
  type MediaSlotValue,
} from "./media-utils.ts";
import type { Post } from "../../services/posts";

describe("media utils", () => {
  it("extracts all attachments with their post context", () => {
    const post: Post = {
      id: "post-1",
      content: "hello with media",
      createdAt: "2026-04-30T08:00:00.000Z",
      attachments: [
        { id: "image-1", mimeType: "image/png" },
        { id: "video-1", mimeType: "video/mp4" },
        { id: "file-1", mimeType: "application/pdf" },
      ],
    };

    expect(getMediaRefs(post)).toEqual([
      {
        meta: { id: "image-1", mimeType: "image/png" },
        postId: "post-1",
        postContent: "hello with media",
        createdAt: "2026-04-30T08:00:00.000Z",
      },
      {
        meta: { id: "video-1", mimeType: "video/mp4" },
        postId: "post-1",
        postContent: "hello with media",
        createdAt: "2026-04-30T08:00:00.000Z",
      },
      {
        meta: { id: "file-1", mimeType: "application/pdf" },
        postId: "post-1",
        postContent: "hello with media",
        createdAt: "2026-04-30T08:00:00.000Z",
      },
    ]);
  });

  it("sets media into the first empty slot while preserving grid length", () => {
    const slots = createEmptyMediaSlots(3);
    const media: MediaSlotValue = {
      attachment: {
        id: "image-1",
        mimeType: "image/png",
        thumbnailUrl: "blob:thumb",
        sourceUrl: "blob:source",
      },
      postId: "post-1",
      postContent: "hello",
      createdAt: "2026-04-30T08:00:00.000Z",
    };

    const next = setFirstEmptyMediaSlot(slots, media);

    expect(next).toHaveLength(3);
    expect(next[0].media).toEqual(media);
    expect(next[1].media).toBeUndefined();
    expect(next[2].media).toBeUndefined();
  });
});
