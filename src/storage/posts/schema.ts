/**
 * Post model for personal usage.
 */
export type Post = {
  id: string;
  createdAt: string;
  content: string;
  /**
   * Array of attachment IDs, can be null if no attachments
   */
  attachmentIds: string[] | null;
};
