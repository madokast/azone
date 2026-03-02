import { MemoryAttachmentService } from "./memory.service";
import { StorageAttachmentService } from "./storage.service";

export type { Attachment } from "./schema";
export type { AttachmentService } from "./service.interface";
export { isImageMimeType, isVideoMimeType } from "./utils";

export const AttachmentServiceIns = new StorageAttachmentService('/azone/attachments');

export const MemoryAttachmentServiceIns = new MemoryAttachmentService();
