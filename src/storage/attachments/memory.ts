import type { Attachment, AttachmentService } from './index';
import { generateId } from '../utils';

/**
 * In-memory implementation of AttachmentService for testing purposes.
 * Uses a map to store attachments in memory.
 */
export class MemoryAttachmentService implements AttachmentService {
  private attachments = new Map<string, Attachment>();

  /**
   * Gets an attachment by its ID.
   * Note: This method only constructs URLs and doesn't access the network.
   * If the attachment is not found, generates a random image attachment.
   * @param id The ID of the attachment to retrieve.
   * @returns A promise that resolves to the attachment.
   */
  getAttachment(id: string): Promise<Attachment> {
    const attachment = this.attachments.get(id);
    if (attachment) {
      return Promise.resolve(attachment);
    }
    
    // Generate random image attachment if not found
    const randomWidth = Math.floor(Math.random() * 601) + 600; // 600-1200
    const randomHeight = Math.floor(Math.random() * 601) + 600; // 600-1200
    
    const randomAttachment: Attachment = {
      id,
      mimeType: 'image/jpeg',
      thumbnailUrl: `https://picsum.photos/160/160?random=${id}`,
      sourceUrl: `https://picsum.photos/${randomWidth}/${randomHeight}?random=${id}`,
    };
    
    // Store the generated attachment in memory
    this.attachments.set(id, randomAttachment);
    
    return Promise.resolve(randomAttachment);
  }

  /**
   * Gets multiple attachments by their IDs.
   * @param ids The IDs of the attachments to retrieve.
   * @returns A promise that resolves to an array of attachments.
   */
  getAttachments(ids: string[]): Promise<Attachment[]> {
    return Promise.all(ids.map(id => this.getAttachment(id)));
  }

  /**
   * Deletes an attachment by its ID.
   * @param id The ID of the attachment to delete.
   * @returns A promise that resolves when the attachment is deleted successfully.
   * @throws Error if the attachment is not found.
   */
  deleteAttachment(id: string): Promise<void> {
    const attachment = this.attachments.get(id);
    if (!attachment) {
      return Promise.reject(new Error(`Attachment with ID ${id} not found`));
    }
    
    // Revoke object URL
    URL.revokeObjectURL(attachment.sourceUrl);
    // Delete from map
    this.attachments.delete(id);
    return Promise.resolve();
  }

  /**
   * Uploads a file and creates an attachment.
   * @param file The file to upload.
   * @returns A promise that resolves to the ID of the created attachment.
   */
  uploadAttachment(file: File): Promise<string> {
    const id = generateId();
    // Create object URL for source
    const sourceUrl = URL.createObjectURL(file);
    let thumbnailUrl: string;
    
    // Check if file is an image
    const isImage = file.type.startsWith('image/');
    
    if (isImage) {
      // For images: use the same object URL for thumbnail (not compressed)
      // TODO: Implement actual thumbnail compression
      thumbnailUrl = sourceUrl;
    } else {
      // For non-images: use default thumbnail
      thumbnailUrl = '/thumbnail/unknow-file.svg';
    }
    
    // Create attachment
    const attachment: Attachment = {
      id,
      mimeType: file.type || 'application/octet-stream',
      thumbnailUrl,
      sourceUrl,
    };

    this.attachments.set(id, attachment);
    return Promise.resolve(id);
  }

  /**
   * Clears all attachments from memory (for testing purposes).
   */
  clear(): void {
    // Revoke all object URLs
    this.attachments.forEach(attachment => {
      URL.revokeObjectURL(attachment.sourceUrl);
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

/**
 * Creates a new instance of MemoryAttachmentService.
 * @returns A new instance of MemoryAttachmentService.
 */
export function createMemoryAttachmentService(): AttachmentService {
  return new MemoryAttachmentService();
}
