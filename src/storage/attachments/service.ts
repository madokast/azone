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
   * @returns A promise that resolves to the attachment.
   */
  getAttachment(id: string): Promise<Attachment>;

  /**
   * Deletes an attachment by its ID.
   * @param id The ID of the attachment to delete.
   * @returns A promise that resolves when the attachment is deleted successfully.
   * @throws Error if the attachment is not found.
   */
  deleteAttachment(id: string): Promise<void>;

  /**
   * Gets multiple attachments by their IDs.
   * @param ids The IDs of the attachments to retrieve.
   * @returns A promise that resolves to an array of attachments.
   */
  getAttachments(ids: string[]): Promise<Attachment[]>;

  /**
   * Uploads a file and creates an attachment.
   * @param file The file to upload.
   * @returns A promise that resolves to the ID of the created attachment.
   */
  uploadAttachment(file: File): Promise<string>;
}
