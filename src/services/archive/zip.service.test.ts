import { describe, expect, it } from "vitest";
import { MemoryAttachmentService, type ObjectURLProvider } from "../attachments/memory.service";
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
  attachmentService: MemoryAttachmentService;
} {
  const nowState: TestNowState = { value: initialNow };
  const attachmentService = new MemoryAttachmentService();
  const service = new MemoryPostService(() => nowState.value, attachmentService);
  return { service, nowState, attachmentService };
}

function decodeJsonFile<T>(files: { path: string; data: Uint8Array }[], path: string): T {
  const file = files.find(file => file.path === path);
  if (!file) {
    throw new Error(`Missing archive file: ${path}`);
  }
  return JSON.parse(decoder.decode(file.data)) as T;
}

function createTrackedURLProvider(): {
  provider: ObjectURLProvider;
} {
  const provider: ObjectURLProvider = {
    createObjectURL(blob: Blob): string {
      return URL.createObjectURL(blob);
    },
    revokeObjectURL(url: string): void {
      URL.revokeObjectURL(url);
    },
  };
  return {
    provider,
  };
}

function bytesToDataURL(bytes: Uint8Array, mimeType: string): string {
  let binary = "";
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return `data:${mimeType};base64,${btoa(binary)}`;
}

function expectBytesEqual(actual: Uint8Array, expected: Uint8Array): void {
  expect(actual.length).toBe(expected.length);
  for (let i = 0; i < expected.length; i++) {
    if (actual[i] !== expected[i]) {
      throw new Error(`bytes differ at index ${i}: actual=${actual[i]} expected=${expected[i]}`);
    }
  }
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
    const { service: postService, nowState, attachmentService } = createMemoryPostServiceForTest(dates[0]);
    for (let i = 0; i < dates.length; i++) {
      const date = dates[i];
      nowState.value = date;
      await postService.createPost({ content: contents[i] });
    }
    const expectedPosts = (await postService.getLatestPosts(10)).reverse();

    const archiveService = new ZipArchiveService();
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

  it("should export attachment files referenced by posts", async () => {
    const { provider } = createTrackedURLProvider();
    const attachmentService = new MemoryAttachmentService(provider);
    const postService = new MemoryPostService(
      () => new Date("2025-01-01T12:34:56"),
      attachmentService,
    );
    const attachmentBytes = new Uint8Array([2, 4, 6, 8]);
    const thumbnailBytes = new Uint8Array([1, 3, 5, 7]);

    await postService.createPost({
      content: "post with attachment",
      attachments: [{
        mimeType: "image/png",
        sourceUrl: bytesToDataURL(attachmentBytes, "image/png"),
        thumbnailUrl: bytesToDataURL(thumbnailBytes, "image/png"),
      }],
    });
    const [post] = await postService.getLatestPosts(1);
    const attachmentMeta = post.attachments![0];

    const archiveService = new ZipArchiveService();
    const archive = await archiveService.exportPosts(postService, attachmentService);
    const files = await unzipFiles(archive);
    const manifest = decodeJsonFile<ArchiveManifest>(files, ARCHIVE_MANIFEST_FILE);

    expect(manifest.attachments).toEqual([{
      id: attachmentMeta.id,
      mimeType: "image/png",
      path: `${attachmentMeta.id}.png`,
      size: attachmentBytes.length,
      sha256: expect.any(String),
    }]);

    const archiveAttachmentPath = `${manifest.attachmentsDir}/${manifest.attachments[0].path}`;
    expect(files.map(file => file.path).sort()).toEqual([
      archiveAttachmentPath,
      ARCHIVE_MANIFEST_FILE,
      ARCHIVE_POSTS_FILE,
    ].sort());

    const attachmentFile = files.find(file => file.path === archiveAttachmentPath);
    expect(attachmentFile).toBeDefined();
    expectBytesEqual(attachmentFile!.data, attachmentBytes);
    expect(Array.from(attachmentFile!.data)).not.toEqual(Array.from(thumbnailBytes));
  });
});
