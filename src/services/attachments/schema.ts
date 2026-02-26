/**
 * Attachment model for file attachments.
 * Contains basic file metadata and URLs.
 */
export interface Attachment {
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
   * URL to the thumbnail version of the attachment
   */
  thumbnailUrl: string;
  
  /**
   * URL to the original source of the attachment
   */
  sourceUrl: string;
}
