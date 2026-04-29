import type { ArchiveService, ExportPostsOptions } from "./service.interface";
import type { AttachmentService } from "../attachments";
import type { PostService } from "../posts";

export class ZipArchiveService implements ArchiveService {
  async exportPosts(
    _postService: PostService,
    _attachmentService: AttachmentService,
    _options?: ExportPostsOptions,
  ): Promise<Uint8Array> {
    throw new Error("Not implemented");
  }
}
