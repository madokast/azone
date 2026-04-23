import { describe, it, expect } from "vitest";
import { MemoryAttachmentService, type ObjectURLProvider } from "./memory.service";

// Tracks blob URLs handed out by createObjectURL so tests can resolve them
// back to their original Blob (for byte-level equality checks) and assert
// that all URLs are eventually revoked (leak detection).
function createTrackedURLProvider(): {
  provider: ObjectURLProvider;
  resolveBlob: (url: string) => Blob | undefined;
  aliveUrls: () => string[];
  totalCreated: () => number;
} {
  const live = new Map<string, Blob>();
  let counter = 0;
  let total = 0;
  const provider: ObjectURLProvider = {
    createObjectURL(blob: Blob): string {
      total++;
      const url = `blob:fake/${++counter}`;
      live.set(url, blob);
      return url;
    },
    revokeObjectURL(url: string): void {
      live.delete(url);
    },
  };
  return {
    provider,
    resolveBlob: (url) => live.get(url),
    aliveUrls: () => [...live.keys()],
    totalCreated: () => total,
  };
}

function randomBytes(length: number): Uint8Array {
  const bytes = new Uint8Array(length);
  for (let i = 0; i < length; i++) {
    bytes[i] = Math.floor(Math.random() * 256);
  }
  return bytes;
}

function bytesToDataURL(bytes: Uint8Array, mimeType: string): string {
  let binary = "";
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return `data:${mimeType};base64,${btoa(binary)}`;
}

async function blobBytes(blob: Blob): Promise<Uint8Array> {
  return new Uint8Array(await blob.arrayBuffer());
}

function expectBytesEqual(actual: Uint8Array, expected: Uint8Array): void {
  expect(actual.length).toBe(expected.length);
  for (let i = 0; i < expected.length; i++) {
    if (actual[i] !== expected[i]) {
      throw new Error(`bytes differ at index ${i}: actual=${actual[i]} expected=${expected[i]}`);
    }
  }
}

describe("MemoryAttachmentService", () => {
  it("returns the same bytes that were uploaded", async () => {
    const { provider, resolveBlob } = createTrackedURLProvider();
    const service = new MemoryAttachmentService(provider);

    const original = randomBytes(64);
    const meta = await service.uploadAttachment({
      mimeType: "application/octet-stream",
      sourceUrl: bytesToDataURL(original, "application/octet-stream"),
      thumbnailUrl: bytesToDataURL(original, "application/octet-stream"),
    });

    const fetched = await service.getAttachment(meta);
    const blob = resolveBlob(fetched.sourceUrl);
    expect(blob).toBeDefined();
    expectBytesEqual(await blobBytes(blob!), original);
  });

  it("rejects getAttachment after deleteAttachment", async () => {
    const { provider } = createTrackedURLProvider();
    const service = new MemoryAttachmentService(provider);

    const meta = await service.uploadAttachment({
      mimeType: "application/octet-stream",
      sourceUrl: bytesToDataURL(randomBytes(8), "application/octet-stream"),
      thumbnailUrl: bytesToDataURL(randomBytes(8), "application/octet-stream"),
    });

    await service.deleteAttachment(meta.id);

    await expect(service.getAttachment(meta)).rejects.toThrow(/not found/);
  });

  it("getAttachments returns every uploaded item with matching bytes", async () => {
    const { provider, resolveBlob } = createTrackedURLProvider();
    const service = new MemoryAttachmentService(provider);

    const originals = [randomBytes(16), randomBytes(32), randomBytes(48)];
    const metas = await Promise.all(
      originals.map((bytes) =>
        service.uploadAttachment({
          mimeType: "application/octet-stream",
          sourceUrl: bytesToDataURL(bytes, "application/octet-stream"),
          thumbnailUrl: bytesToDataURL(bytes, "application/octet-stream"),
        })
      )
    );

    const attachments = await service.getAttachments(metas);
    expect(attachments).toHaveLength(originals.length);

    for (let i = 0; i < attachments.length; i++) {
      expect(attachments[i].id).toBe(metas[i].id);
      const blob = resolveBlob(attachments[i].sourceUrl);
      expect(blob).toBeDefined();
      expectBytesEqual(await blobBytes(blob!), originals[i]);
    }
  });

  it("hands out independent source and thumbnail URLs for images, all revocable", async () => {
    const { provider, aliveUrls, totalCreated } = createTrackedURLProvider();
    const service = new MemoryAttachmentService(provider);

    const metas = await Promise.all(
      [randomBytes(8), randomBytes(8)].map((bytes) =>
        service.uploadAttachment({
          mimeType: "image/png",
          sourceUrl: bytesToDataURL(bytes, "image/png"),
          thumbnailUrl: bytesToDataURL(bytes, "image/png"),
        })
      )
    );

    const attachments = await service.getAttachments(metas);

    // For images each attachment must allocate two distinct URLs
    // (source + thumbnail). 2 attachments * 2 URLs = 4.
    expect(totalCreated()).toBe(4);
    for (const attachment of attachments) {
      expect(attachment.sourceUrl).not.toBe(attachment.thumbnailUrl);
    }

    for (const attachment of attachments) {
      provider.revokeObjectURL(attachment.sourceUrl);
      provider.revokeObjectURL(attachment.thumbnailUrl);
    }

    expect(aliveUrls()).toEqual([]);
  });

  it("getAttachments revokes already-created URLs when one item is missing", async () => {
    const { provider, aliveUrls } = createTrackedURLProvider();
    const service = new MemoryAttachmentService(provider);

    const goodMeta = await service.uploadAttachment({
      mimeType: "image/png",
      sourceUrl: bytesToDataURL(randomBytes(8), "image/png"),
      thumbnailUrl: bytesToDataURL(randomBytes(8), "image/png"),
    });
    const missingMeta = { id: "does-not-exist", mimeType: "image/png" };

    await expect(
      service.getAttachments([goodMeta, missingMeta])
    ).rejects.toThrow(/not found/);

    expect(aliveUrls()).toEqual([]);
  });
});
