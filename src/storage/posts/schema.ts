import { Attachment } from "../attachments";

export type Post = {
  id: string;
  createdAt: string;
  content: string;
  /**
   * Array of attachment IDs, can be null if no attachments
   */
  attachmentIds: string[] | null;
};

export type CreatePostData = {
  content: string;
  attachments?: Omit<Attachment, 'id'>[] | null;
}
