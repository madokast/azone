import { Attachment } from "../attachments";
import { MetaAttachment } from "../attachments/schema";

export interface Post {
  id: string;
  createdAt: string;
  content: string;
  /**
   * Array of attachment IDs, can be null if no attachments
   */
  attachments?: MetaAttachment[] | null;
}

export interface CreatePostDto {
  content: string;
  attachments?: Omit<Attachment, 'id'>[] | null;
}
