export type { Attachment } from "./schema";
export type { AttachmentService } from "./service";

// The following exports are for testing purposes only
import { createMemoryAttachmentService } from "./memory";

export const AttachmentServiceIns = createMemoryAttachmentService();