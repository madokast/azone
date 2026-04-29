import type { MetaAttachment } from "../attachments";

export const ARCHIVE_SCHEMA_VERSION = 1;
export const ARCHIVE_POSTS_FILE = "posts.json";
export const ARCHIVE_ATTACHMENTS_DIR = "attachments";

export interface ArchivePostEntry {
  id: string;
  createdAt: string;
  content: string;
  attachments?: MetaAttachment[] | null;
}

export interface ArchiveAttachmentEntry extends MetaAttachment {
  /**
   * Relative path under attachmentsDir, for example abc.jpg.
   */
  path: string;
  size?: number;
  sha256?: string;
}

export interface ArchiveManifest {
  schemaVersion: typeof ARCHIVE_SCHEMA_VERSION;
  exportedAt: string;
  postsFile: typeof ARCHIVE_POSTS_FILE;
  attachmentsDir: typeof ARCHIVE_ATTACHMENTS_DIR;
  postCount: number;
  attachments: ArchiveAttachmentEntry[];
}
