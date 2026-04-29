import { describe, expect, it } from "vitest";
import { MemoryAttachmentService } from "../attachments/memory.service";
import { MemoryPostService } from "../posts/memory.service";
import { unzipFiles } from "../../tools/zip";
import { ARCHIVE_MANIFEST_FILE } from "./schema";
import {
  ARCHIVE_ATTACHMENTS_DIR,
  ARCHIVE_POSTS_FILE,
  ARCHIVE_SCHEMA_VERSION,
  type ArchiveManifest,
  type ArchivePostEntry,
} from "./schema.v1";
import { ZipArchiveService } from "./zip.service";

type TestNowState = {
  value: Date;
};

const decoder = new TextDecoder();

function createMemoryPostServiceForTest(initialNow: Date): {
  service: MemoryPostService;
  nowState: TestNowState;
} {
  const nowState: TestNowState = { value: initialNow };
  const service = new MemoryPostService(() => nowState.value);
  return { service, nowState };
}

function decodeJsonFile<T>(files: { path: string; data: Uint8Array }[], path: string): T {
  const file = files.find(file => file.path === path);
  if (!file) {
    throw new Error(`Missing archive file: ${path}`);
  }
  return JSON.parse(decoder.decode(file.data)) as T;
}

describe("ZipArchiveService.exportPosts", () => {
  it("should export posts-only archive that can be read back from zip", async () => {
    const dates = [
      new Date("2024-01-01T01:00:00"),
      new Date("2024-02-01T01:00:00"),
      new Date("2024-03-01T01:00:00"),
    ];
    const contents = [
      "oldest plain text",
      "middle plain text",
      "newest plain text",
    ];
    const { service: postService, nowState } = createMemoryPostServiceForTest(dates[0]);
    for (let i = 0; i < dates.length; i++) {
      const date = dates[i];
      nowState.value = date;
      await postService.createPost({ content: contents[i] });
    }
    const expectedPosts = (await postService.getLatestPosts(10)).reverse();

    const archiveService = new ZipArchiveService();
    const attachmentService = new MemoryAttachmentService();

    const archive = await archiveService.exportPosts(postService, attachmentService, { batchSize: 2 });
    const files = await unzipFiles(archive);

    expect(files.map(file => file.path).sort()).toEqual([
      ARCHIVE_MANIFEST_FILE,
      ARCHIVE_POSTS_FILE,
    ]);

    const manifest = decodeJsonFile<ArchiveManifest>(files, ARCHIVE_MANIFEST_FILE);
    expect(manifest).toEqual({
      schemaVersion: ARCHIVE_SCHEMA_VERSION,
      exportedAt: expect.any(String),
      postsFile: ARCHIVE_POSTS_FILE,
      attachmentsDir: ARCHIVE_ATTACHMENTS_DIR,
      postCount: expectedPosts.length,
      attachments: [],
    });

    const posts = decodeJsonFile<ArchivePostEntry[]>(files, manifest.postsFile);
    expect(posts).toEqual(expectedPosts);
  });
});
