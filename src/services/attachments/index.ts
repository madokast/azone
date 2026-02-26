export type { Attachment } from "./schema";
export type { AttachmentService } from "./service";
export { isImageMimeType, isVideoMimeType } from "./utils";

// The following exports are for testing purposes only
import { createMemoryAttachmentService } from "./memory";

export const AttachmentServiceIns = createMemoryAttachmentService();