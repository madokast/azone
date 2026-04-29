import type { ArchiveService, ExportPostsOptions } from "./service.interface";
import type { AttachmentService } from "../attachments";
import type { Post, PostService } from "../posts";
import { ZipBuilder } from "../../tools/zip";
import { ARCHIVE_MANIFEST_FILE } from "./schema";
import {
  ARCHIVE_ATTACHMENTS_DIR,
  ARCHIVE_POSTS_FILE,
  ARCHIVE_SCHEMA_VERSION,
  type ArchiveManifest,
  type ArchivePostEntry,
} from "./schema.v1";

export class ZipArchiveService implements ArchiveService {
  async exportPosts(
    postService: PostService,
    _attachmentService: AttachmentService,
    options: ExportPostsOptions = {},
  ): Promise<Uint8Array> {
    const posts = await loadAllPosts(postService, options.batchSize ?? 100);

    // TODO: Export attachment files and fill manifest.attachments in a follow-up step.
    if (posts.some(post => (post.attachments?.length ?? 0) > 0)) {
      throw new Error("Attachment export is not implemented");
    }

    const archivePosts: ArchivePostEntry[] = [...posts].reverse().map(post => ({
      id: post.id,
      createdAt: post.createdAt,
      content: post.content,
      attachments: post.attachments ?? [],
    }));
    const manifest: ArchiveManifest = {
      schemaVersion: ARCHIVE_SCHEMA_VERSION,
      exportedAt: new Date().toISOString(),
      postsFile: ARCHIVE_POSTS_FILE,
      attachmentsDir: ARCHIVE_ATTACHMENTS_DIR,
      postCount: archivePosts.length,
      attachments: [],
    };

    const zip = new ZipBuilder();
    zip.add(ARCHIVE_MANIFEST_FILE, JSON.stringify(manifest, null, 2));
    zip.add(ARCHIVE_POSTS_FILE, JSON.stringify(archivePosts, null, 2));
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
