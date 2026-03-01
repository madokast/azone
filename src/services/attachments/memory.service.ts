import type { Attachment, AttachmentService } from './index';
import { generateId } from '../utils';
import { unknowFileIcon } from '../../assets';
import { Attachments, MetaAttachment } from './schema';

/**
 * In-memory implementation of AttachmentService for testing purposes.
 * Uses a map to store attachments in memory.
 */
export class MemoryAttachmentService implements AttachmentService {
  private attachments = new Map<string, Attachment>();

  getAttachment(meta: MetaAttachment): Promise<Attachment> {
    const attachment = this.attachments.get(meta.id);
    if (attachment) {
      return Promise.resolve(attachment);
    }

    throw new Error(`Attachment with ID ${meta.id} not found`);
  }

  getAttachments(metas: MetaAttachment[]): Promise<Attachment[]> {
    return Promise.all(metas.map(m=>this.getAttachment(m)));
  }

  deleteAttachment(id: string): Promise<void> {
    const attachment = this.attachments.get(id);
    if (!attachment) {
      return Promise.reject(new Error(`Attachment with ID ${id} not found`));
    }
    
    Attachments.dispose(attachment);
    this.attachments.delete(id);
    return Promise.resolve();
  }

  async uploadAttachment(attachment: Omit<Attachment, 'id'>): Promise<MetaAttachment> {
    const id = generateId();
    // Create object URL for source
    let sourceUrl = attachment.sourceUrl;
    let thumbnailUrl: string;
    
    if (sourceUrl.startsWith('blob:')) {
      sourceUrl = URL.createObjectURL(await fetch(sourceUrl).then(res => res.blob()));
    }

    // Check if file is an image
    const isImage = attachment.mimeType.startsWith('image/');
    
    if (isImage) {
      // For images: use the same object URL for thumbnail (not compressed)
      // TODO: Implement actual thumbnail compression
      thumbnailUrl = sourceUrl;
    } else {
      // For non-images: use default thumbnail
      thumbnailUrl = unknowFileIcon;
    }

    const uploaded = {
      id,
      mimeType: attachment.mimeType,
      sourceUrl,
      thumbnailUrl,
    } as Attachment;

    this.attachments.set(id, uploaded);
    return Promise.resolve(uploaded);
  }

  /**
   * Clears all attachments from memory (for testing purposes).
   */
  clear(): void {
    // Revoke all object URLs
    this.attachments.forEach(attachment => {
      URL.revokeObjectURL(attachment.sourceUrl);
      URL.revokeObjectURL(attachment.thumbnailUrl);
    });
    this.attachments.clear();
  }

  /**
   * Gets the internal attachments map (for testing purposes).
   */
  getInternalAttachments(): Map<string, Attachment> {
    return new Map(this.attachments);
  }
}

