/**
 * Attachment model for file attachments.
 * Contains basic file metadata.
 */
export type Attachment = {
  /**
   * Unique identifier for the attachment
   */
  id: string;
  
  /**
   * MIME type of the attachment
   * Example: "image/jpeg", "application/pdf"
   */
  mimeType: string;
  
  /**
   * Size of the attachment in bytes
   */
  size: number;
};
