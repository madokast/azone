import { Attachment } from "../attachments";

export interface Post {
  id: string;
  createdAt: string;
  content: string;
  /**
   * Array of attachment IDs, can be null if no attachments
   */
  attachmentIds: string[] | null;
}

export interface CreatePostDto {
  content: string;
  attachments?: Omit<Attachment, 'id'>[] | null;
}
