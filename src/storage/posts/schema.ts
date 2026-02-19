/**
 * Minimal post model for personal usage.
 * No author field, no attachments, and posts are immutable after creation.
 */
export type Post = {
  id: string;
  createdAt: string;
  content: string;
};
