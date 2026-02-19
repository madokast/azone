import type { Attachment, AttachmentService } from './index';

/**
 * In-memory implementation of AttachmentService for testing purposes.
 * Uses a map to store attachments in memory.
 */
export class MemoryAttachmentService implements AttachmentService {
  private attachments = new Map<string, Attachment>();

  /**
   * Gets an attachment by its ID.
   * Note: This method only constructs URLs and doesn't access the network.
   * @param id The ID of the attachment to retrieve.
   * @returns A promise that resolves to the attachment if found, null otherwise.
   */
  getAttachment(id: string): Promise<Attachment | null> {
    const attachment = this.attachments.get(id);
    return Promise.resolve(attachment || null);
  }

  /**
   * Deletes an attachment by its ID.
   * @param id The ID of the attachment to delete.
   * @returns A promise that resolves to true if the attachment was deleted successfully, false otherwise.
   */
  deleteAttachment(id: string): Promise<boolean> {
    const existed = this.attachments.has(id);
    if (existed) {
      this.attachments.delete(id);
    }
    return Promise.resolve(existed);
  }

  /**
   * Uploads a file and creates an attachment.
   * @param file The file to upload.
   * @returns A promise that resolves to the ID of the created attachment.
   */
  uploadAttachment(file: File): Promise<string> {
    const id = crypto.randomUUID();
    
    // Create attachment with mock URLs for testing
    const attachment: Attachment = {
      id,
      mimeType: file.type || 'application/octet-stream',
      thumbnailUrl: `/thumbnail/${id}`,
      sourceUrl: `/source/${id}`,
    };

    this.attachments.set(id, attachment);
    return Promise.resolve(id);
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
  getInternalAttachments(): Map<string, Attachment> {
    return new Map(this.attachments);
  }
}

/**
 * Creates a new instance of MemoryAttachmentService.
 * @returns A new instance of MemoryAttachmentService.
 */
export function createMemoryAttachmentService(): AttachmentService {
  return new MemoryAttachmentService();
}
