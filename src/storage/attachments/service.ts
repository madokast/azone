import type { Attachment } from './schema';

/**
 * Attachment service interface for managing attachments.
 * This interface defines the contract for attachment management functionality.
 */
export interface AttachmentService {
  /**
   * Gets an attachment by its ID.
   * Note: This method only constructs URLs and doesn't access the network.
   * @param id The ID of the attachment to retrieve.
   * @returns A promise that resolves to the attachment if found, null otherwise.
   */
  getAttachment(id: string): Promise<Attachment | null>;

  /**
   * Deletes an attachment by its ID.
   * @param id The ID of the attachment to delete.
   * @returns A promise that resolves to true if the attachment was deleted successfully, false otherwise.
   */
  deleteAttachment(id: string): Promise<boolean>;

  /**
   * Uploads a file and creates an attachment.
   * @param file The file to upload.
   * @returns A promise that resolves to the ID of the created attachment.
   */
  uploadAttachment(file: File): Promise<string>;
}
