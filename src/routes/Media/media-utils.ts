import type { Attachment, MetaAttachment } from "../../services/attachments";
import type { Post } from "../../services/posts";

export type MediaRef = {
  meta: MetaAttachment;
  postId: string;
  postContent: string;
  createdAt: string;
};

export type MediaSlotValue = {
  attachment: Attachment;
  postId: string;
  postContent: string;
  createdAt: string;
};

export type MediaSlotState = {
  id: string;
  media?: MediaSlotValue;
};

export function getMediaRefs(post: Post): MediaRef[] {
  return (post.attachments ?? [])
    .map((attachment) => ({
      meta: attachment,
      postId: post.id,
      postContent: post.content,
      createdAt: post.createdAt,
    }));
}

export function createEmptyMediaSlots(count: number, offset = 0): MediaSlotState[] {
  return Array.from({ length: count }, (_, index) => ({
    id: `media-slot-${offset + index}`,
  }));
}

export function setFirstEmptyMediaSlot(
  slots: MediaSlotState[],
  media: MediaSlotValue
): MediaSlotState[] {
  const emptyIndex = slots.findIndex((slot) => !slot.media);
  if (emptyIndex === -1) return slots;

  return slots.map((slot, index) =>
    index === emptyIndex ? { ...slot, media } : slot
  );
}
