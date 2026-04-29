import type { AttachmentService } from "../attachments";
import type { PostService } from "../posts";

export interface ExportPostsOptions {
  batchSize?: number;
}

export interface ArchiveService {
  exportPosts(
    postService: PostService,
    attachmentService: AttachmentService,
    options?: ExportPostsOptions,
  ): Promise<Uint8Array>;
}
