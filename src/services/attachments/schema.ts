export interface MetaAttachment {
    /**
   * Unique identifier for the attachment
   */
  id: string;
  
  /**
   * MIME type of the attachment
   * Example: "image/jpeg", "application/pdf"
   */
  mimeType: string;
}

export interface Attachment extends MetaAttachment {
  /**
   * URL to the thumbnail version of the attachment
   */
  thumbnailUrl: string;
  
  /**
   * URL to the original source of the attachment
   */
  sourceUrl: string;
}

export const Attachments = {
  dispose(attachment: Attachment) {
    URL.revokeObjectURL(attachment.thumbnailUrl);
    URL.revokeObjectURL(attachment.sourceUrl);
  }
}

