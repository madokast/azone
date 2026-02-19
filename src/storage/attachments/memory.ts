import type { Attachment, AttachmentService } from './index';

/**
 * In-memory implementation of AttachmentService for testing purposes.
 * Uses a map to store attachments in memory.
 */
export class MemoryAttachmentService implements AttachmentService {
  private attachments = new Map<string, Attachment>();
  private objectUrls = new Map<string, string[]>(); // Store object URLs for cleanup

  /**
   * Gets an attachment by its ID.
   * Note: This method only constructs URLs and doesn't access the network.
   * @param id The ID of the attachment to retrieve.
   * @returns A promise that resolves to the attachment.
   * @throws Error if the attachment is not found.
   */
  getAttachment(id: string): Promise<Attachment> {
    const attachment = this.attachments.get(id);
    if (attachment) {
      return Promise.resolve(attachment);
    }
    return Promise.reject(new Error(`Attachment with ID ${id} not found`));
  }

  /**
   * Deletes an attachment by its ID.
   * @param id The ID of the attachment to delete.
   * @returns A promise that resolves to true if the attachment was deleted successfully, false otherwise.
   */
  deleteAttachment(id: string): Promise<boolean> {
    const existed = this.attachments.has(id);
    if (existed) {
      // Revoke object URLs if they exist
      const urls = this.objectUrls.get(id);
      if (urls) {
        urls.forEach(url => {
          URL.revokeObjectURL(url);
        });
        this.objectUrls.delete(id);
      }
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
    let sourceUrl: string;
    let thumbnailUrl: string;
    const urlsToStore: string[] = [];
    
    // Check if file is an image
    const isImage = file.type.startsWith('image/');
    
    if (isImage) {
      // For images: create object URLs for both source and thumbnail
      sourceUrl = URL.createObjectURL(file);
      // Thumbnail: using the same object URL for now (not compressed)
      // TODO: Implement actual thumbnail compression
      thumbnailUrl = URL.createObjectURL(file);
      urlsToStore.push(sourceUrl, thumbnailUrl);
    } else {
      // For non-images: create object URL only for source, use default thumbnail
      sourceUrl = URL.createObjectURL(file);
      thumbnailUrl = '/thumbnail/unknow-file.svg';
      urlsToStore.push(sourceUrl);
    }
    
    // Create attachment
    const attachment: Attachment = {
      id,
      mimeType: file.type || 'application/octet-stream',
      thumbnailUrl,
      sourceUrl,
    };

    this.attachments.set(id, attachment);
    this.objectUrls.set(id, urlsToStore);
    return Promise.resolve(id);
  }

  /**
   * Clears all attachments from memory (for testing purposes).
   */
  clear(): void {
    // Revoke all object URLs
    this.objectUrls.forEach(urls => {
      urls.forEach(url => {
        URL.revokeObjectURL(url);
      });
    });
    this.attachments.clear();
    this.objectUrls.clear();
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
