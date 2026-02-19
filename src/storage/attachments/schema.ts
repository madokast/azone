/**
 * Attachment model for file attachments.
 * Contains basic file metadata and URLs.
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
  
  /**
   * URL to the thumbnail version of the attachment (if applicable)
   */
  thumbnailUrl?: string;
  
  /**
   * URL to the original source of the attachment
   */
  sourceUrl: string;
};
