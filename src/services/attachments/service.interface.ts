import type { Attachment, MetaAttachment } from './schema';

/**
 * ## Blob URL 所有权约定（创建者负责释放）
 *
 * **uploadAttachment**：
 *   调用方传入的 `attachment.sourceUrl` 所有权归调用方，服务只读取其内容，不负责释放。
 *   上传完成后，调用方应在合适时机自行调用 `URL.revokeObjectURL(attachment.sourceUrl)`。
 *
 * **getAttachment / getAttachments**：
 *   服务负责创建返回的 `Attachment` 中的 blob URL，并将所有权转交给调用方。
 *   调用方使用完毕后须调用 `Attachments.dispose(attachment)` 释放，
 *   服务不缓存已返回的 URL，无法代替调用方管理其生命周期。
 *
 * **deleteAttachment**：
 *   删除持久化数据，不负责释放调用方持有的 blob URL（调用方自行 dispose）。
 */
export interface AttachmentService {
  getAttachment(meta: MetaAttachment): Promise<Attachment>;
  deleteAttachment(id: string): Promise<void>;
  getAttachments(metas: MetaAttachment[]): Promise<Attachment[]>;
  uploadAttachment(attachment: Omit<Attachment, 'id'>): Promise<MetaAttachment>;
}
