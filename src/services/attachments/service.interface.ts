import type { Attachment, MetaAttachment } from './schema';

export interface AttachmentService {
  getAttachment(meta: MetaAttachment): Promise<Attachment>;
  deleteAttachment(id: string): Promise<void>;
  getAttachments(metas: MetaAttachment[]): Promise<Attachment[]>;
  uploadAttachment(attachment: Omit<Attachment, 'id'>): Promise<MetaAttachment>;
}
