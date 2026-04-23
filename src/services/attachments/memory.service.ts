import type { Attachment, AttachmentService } from './index';
import { isImageMimeType } from './index';
import { generateId } from '../identifier';
import { unknowFileIcon } from '../../assets';
import { MetaAttachment } from './schema';

interface StoredAttachment {
  mimeType: string;
  blob: Blob;
}

/**
 * In-memory implementation of AttachmentService for testing purposes.
 *
 * ## Blob URL 所有权说明
 *
 * 内部以 Blob 对象存储附件数据，不持有任何 blob URL，与接口约定一致：
 * - **uploadAttachment**：fetch sourceUrl 拿到 Blob 存入 Map，不持有也不释放调用方的 URL。
 * - **getAttachment**：每次调用从 Blob 创建新的 blob URL，所有权转交调用方，
 *   调用方使用完毕后须调用 Attachments.dispose(attachment) 释放。
 * - **deleteAttachment / clear**：直接移除 Map 条目，Blob 内存由 GC 回收，无需 revoke URL。
 */
export class MemoryAttachmentService implements AttachmentService {
  // 存储 Blob 对象而非 blob URL，getAttachment 按需创建新 URL 并转交调用方
  private attachments = new Map<string, StoredAttachment>();

  getAttachment(meta: MetaAttachment): Promise<Attachment> {
    const stored = this.attachments.get(meta.id);
    if (!stored) {
      return Promise.reject(new Error(`Attachment with ID ${meta.id} not found`));
    }
    const sourceUrl = URL.createObjectURL(stored.blob);
    const thumbnailUrl = isImageMimeType(stored.mimeType) ? sourceUrl : unknowFileIcon;
    return Promise.resolve({ id: meta.id, mimeType: stored.mimeType, sourceUrl, thumbnailUrl });
  }

  getAttachments(metas: MetaAttachment[]): Promise<Attachment[]> {
    return Promise.all(metas.map(m => this.getAttachment(m)));
  }

  deleteAttachment(id: string): Promise<void> {
    if (!this.attachments.has(id)) {
      return Promise.reject(new Error(`Attachment with ID ${id} not found`));
    }
    this.attachments.delete(id);
    return Promise.resolve();
  }

  async uploadAttachment(attachment: Omit<Attachment, 'id'>): Promise<MetaAttachment> {
    const id = generateId();
    // 将数据持久化为 Blob，调用方的 sourceUrl 所有权不转移
    const blob = await fetch(attachment.sourceUrl).then(res => res.blob());
    this.attachments.set(id, { mimeType: attachment.mimeType, blob });
    return { id, mimeType: attachment.mimeType };
  }

  /**
   * Clears all attachments from memory (for testing purposes).
   */
  clear(): void {
    this.attachments.clear();
  }

  /**
   * Gets the internal attachments map (for testing purposes).
   */
  getInternalAttachments(): Map<string, StoredAttachment> {
    return new Map(this.attachments);
  }
}


