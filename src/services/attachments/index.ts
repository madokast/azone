export type { Attachment } from "./schema";
export type { AttachmentService } from "./service.interface";
export { isImageMimeType, isVideoMimeType } from "./utils";

// The following exports are for testing purposes only
import { createMemoryAttachmentService } from "./memory.service";

export const AttachmentServiceIns = createMemoryAttachmentService();