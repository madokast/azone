import type { ArchiveService, ExportPostsOptions } from "./service.interface";
import type { Attachment, AttachmentService, MetaAttachment } from "../attachments";
import type { Post, PostService } from "../posts";
import { ZipBuilder } from "../../tools/zip";
import { ARCHIVE_MANIFEST_FILE } from "./schema";
import {
  ARCHIVE_ATTACHMENTS_DIR,
  ARCHIVE_POSTS_FILE,
  ARCHIVE_SCHEMA_VERSION,
  type ArchiveAttachmentEntry,
  type ArchiveManifest,
  type ArchivePostEntry,
} from "./schema.v1";

export class ZipArchiveService implements ArchiveService {
  async exportPosts(
    postService: PostService,
    attachmentService: AttachmentService,
    options: ExportPostsOptions = {},
  ): Promise<Uint8Array> {
    const posts = await loadAllPosts(postService, options.batchSize ?? 100);

    const archivePosts: ArchivePostEntry[] = [...posts].reverse().map(post => ({
      id: post.id,
      createdAt: post.createdAt,
      content: post.content,
      attachments: post.attachments ?? [],
    }));
    const attachmentMetas = collectAttachmentMetas(archivePosts);
    const attachments = await readArchiveAttachments(attachmentService, attachmentMetas);
    const manifest: ArchiveManifest = {
      schemaVersion: ARCHIVE_SCHEMA_VERSION,
      exportedAt: new Date().toISOString(),
      postsFile: ARCHIVE_POSTS_FILE,
      attachmentsDir: ARCHIVE_ATTACHMENTS_DIR,
      postCount: archivePosts.length,
      attachments: attachments.map(attachment => attachment.entry),
    };

    const zip = new ZipBuilder();
    zip.add(ARCHIVE_MANIFEST_FILE, JSON.stringify(manifest, null, 2));
    zip.add(ARCHIVE_POSTS_FILE, JSON.stringify(archivePosts, null, 2));
    for (const attachment of attachments) {
      zip.add(`${ARCHIVE_ATTACHMENTS_DIR}/${attachment.entry.path}`, attachment.data);
    }
    return zip.generate();
  }
}

async function loadAllPosts(postService: PostService, batchSize: number): Promise<Post[]> {
  const posts = await postService.getLatestPosts(batchSize);
  while (posts.length > 0) {
    const nextPosts = await postService.getPostsBefore(posts[posts.length - 1].id, batchSize);
    if (nextPosts.length === 0) {
      break;
    }
    posts.push(...nextPosts);
  }
  return posts;
}

function collectAttachmentMetas(posts: ArchivePostEntry[]): MetaAttachment[] {
  const metas = new Map<string, MetaAttachment>();
  for (const post of posts) {
    for (const attachment of post.attachments ?? []) {
      metas.set(attachment.id, attachment);
    }
  }
  return [...metas.values()];
}

async function readArchiveAttachments(
  attachmentService: AttachmentService,
  metas: MetaAttachment[],
): Promise<{ entry: ArchiveAttachmentEntry; data: Uint8Array }[]> {
  const result: { entry: ArchiveAttachmentEntry; data: Uint8Array }[] = [];
  for (const meta of metas) {
    const attachment = await attachmentService.getAttachment(meta);
    try {
      const data = await readSourceBytes(attachment);
      result.push({
        entry: {
          ...meta,
          path: `${meta.id}.${extensionFromMimeType(meta.mimeType)}`,
          size: data.byteLength,
          sha256: await sha256Hex(data),
        },
        data,
      });
    } finally {
      revokeBlobUrl(attachment.sourceUrl);
      if (attachment.thumbnailUrl !== attachment.sourceUrl) {
        revokeBlobUrl(attachment.thumbnailUrl);
      }
    }
  }
  return result;
}

async function readSourceBytes(attachment: Attachment): Promise<Uint8Array> {
  const buffer = await fetch(attachment.sourceUrl).then(response => response.arrayBuffer());
  return new Uint8Array(buffer);
}

async function sha256Hex(data: Uint8Array): Promise<string> {
  const digestInput = new Uint8Array(data).buffer;
  const digest = await crypto.subtle.digest("SHA-256", digestInput);
  return [...new Uint8Array(digest)]
    .map(byte => byte.toString(16).padStart(2, "0"))
    .join("");
}

function extensionFromMimeType(mimeType: string): string {
  switch (mimeType) {
    case "image/jpeg":
      return "jpg";
    case "image/png":
      return "png";
    case "image/gif":
      return "gif";
    case "image/webp":
      return "webp";
    case "video/mp4":
      return "mp4";
    case "application/pdf":
      return "pdf";
    default:
      return "bin";
  }
}

function revokeBlobUrl(url: string): void {
  if (url.startsWith("blob:")) {
    URL.revokeObjectURL(url);
  }
}
