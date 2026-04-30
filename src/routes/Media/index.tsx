import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { InfiniteScroll } from "antd-mobile";
import MediaSlot from "../../components/MediaSlot";
import AttachmentViewer from "../../components/AttachmentViewer";
import { showToast } from "../../components/toast";
import type { AttachmentService } from "../../services/attachments";
import type { PostService } from "../../services/posts";
import {
  createEmptyMediaSlots,
  getMediaRefs,
  setFirstEmptyMediaSlot,
  type MediaRef,
  type MediaSlotState,
  type MediaSlotValue,
} from "./media-utils.ts";

type MediaProps = {
  postService: PostService;
  attachmentService: AttachmentService;
};

const gridColumns = 3;
const postPageSize = 20;
const loadMoreSlotCount = gridColumns * 4;

function getInitialSlotCount() {
  if (typeof window === "undefined") return gridColumns * 6;

  const columnWidth = Math.max(window.innerWidth / gridColumns, 1);
  const visibleRows = Math.ceil(window.innerHeight / columnWidth);
  return (visibleRows + 1) * gridColumns;
}

function revokeAttachmentUrls(media: MediaSlotValue) {
  new Set([
    media.attachment.sourceUrl,
    media.attachment.thumbnailUrl,
  ]).forEach((url) => URL.revokeObjectURL(url));
}

export default function Media({ postService, attachmentService }: MediaProps) {
  const [slots, setSlots] = useState<MediaSlotState[]>(() =>
    createEmptyMediaSlots(getInitialSlotCount())
  );
  const [hasMore, setHasMore] = useState(true);
  const [attachmentViewerVisible, setAttachmentViewerVisible] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  const slotsRef = useRef(slots);
  const pendingRefsRef = useRef<MediaRef[]>([]);
  const lastPostIdRef = useRef<string | undefined>(undefined);
  const hasMorePostsRef = useRef(true);
  const loadingRef = useRef(false);
  const disposedRef = useRef(false);
  const runIdRef = useRef(0);

  const loadedMedia = useMemo(
    () => slots.flatMap((slot) => (slot.media ? [slot.media] : [])),
    [slots]
  );

  const viewerAttachments = useMemo(
    () => loadedMedia.map((media) => media.attachment),
    [loadedMedia]
  );

  const getEmptySlotCount = useCallback(
    () => slotsRef.current.filter((slot) => !slot.media).length,
    []
  );

  const syncHasMore = useCallback(() => {
    setHasMore(hasMorePostsRef.current || pendingRefsRef.current.length > 0);
  }, []);

  const setFirstEmptySlot = useCallback((media: MediaSlotValue) => {
    const nextSlots = setFirstEmptyMediaSlot(slotsRef.current, media);
    slotsRef.current = nextSlots;
    setSlots(nextSlots);
  }, []);

  const appendEmptySlots = useCallback((count: number) => {
    const currentSlots = slotsRef.current;
    const nextSlots = [
      ...currentSlots,
      ...createEmptyMediaSlots(count, currentSlots.length),
    ];
    slotsRef.current = nextSlots;
    setSlots(nextSlots);
  }, []);

  const isActiveRun = useCallback(
    (runId: number) => !disposedRef.current && runIdRef.current === runId,
    []
  );

  const fillEmptySlotsFromPending = useCallback(async (runId: number) => {
    while (isActiveRun(runId) && getEmptySlotCount() > 0) {
      const nextRef = pendingRefsRef.current.shift();
      if (!nextRef) return;

      try {
        const attachment = await attachmentService.getAttachment(nextRef.meta);
        const media: MediaSlotValue = {
          attachment,
          postId: nextRef.postId,
          postContent: nextRef.postContent,
          createdAt: nextRef.createdAt,
        };

        if (!isActiveRun(runId)) {
          revokeAttachmentUrls(media);
          return;
        }

        setFirstEmptySlot(media);
      } catch (error) {
        if (isActiveRun(runId)) {
          showToast(`${error}`);
        }
      }
    }
  }, [attachmentService, getEmptySlotCount, isActiveRun, setFirstEmptySlot]);

  const scanUntilSlotsFilled = useCallback(async (runId = runIdRef.current) => {
    if (loadingRef.current) return;
    if (!hasMorePostsRef.current && pendingRefsRef.current.length === 0) {
      syncHasMore();
      return;
    }

    loadingRef.current = true;

    try {
      await fillEmptySlotsFromPending(runId);

      while (
        isActiveRun(runId) &&
        getEmptySlotCount() > 0 &&
        hasMorePostsRef.current
      ) {
        const posts = lastPostIdRef.current
          ? await postService.getPostsBefore(lastPostIdRef.current, postPageSize)
          : await postService.getLatestPosts(postPageSize);

        if (!isActiveRun(runId)) return;

        if (posts.length === 0) {
          hasMorePostsRef.current = false;
          syncHasMore();
          return;
        }

        const lastPost = posts[posts.length - 1];
        lastPostIdRef.current = lastPost.id;
        pendingRefsRef.current.push(...posts.flatMap(getMediaRefs));

        if (posts.length < postPageSize) {
          hasMorePostsRef.current = false;
        }

        await fillEmptySlotsFromPending(runId);
      }
    } catch (error) {
      if (isActiveRun(runId)) {
        hasMorePostsRef.current = false;
        pendingRefsRef.current = [];
        showToast(`${error}`);
      }
    } finally {
      if (isActiveRun(runId)) {
        syncHasMore();
        loadingRef.current = false;
      }
    }
  }, [
    fillEmptySlotsFromPending,
    getEmptySlotCount,
    isActiveRun,
    postService,
    syncHasMore,
  ]);

  useEffect(() => {
    const runId = runIdRef.current + 1;
    runIdRef.current = runId;
    disposedRef.current = false;
    pendingRefsRef.current = [];
    lastPostIdRef.current = undefined;
    hasMorePostsRef.current = true;
    loadingRef.current = false;
    const initialSlots = createEmptyMediaSlots(getInitialSlotCount());
    slotsRef.current = initialSlots;
    setSlots(initialSlots);
    setHasMore(true);
    scanUntilSlotsFilled(runId);

    return () => {
      disposedRef.current = true;
      pendingRefsRef.current = [];
      slotsRef.current.forEach((slot) => {
        if (slot.media) revokeAttachmentUrls(slot.media);
      });
    };
  }, [scanUntilSlotsFilled]);

  const handleLoadMore = async () => {
    appendEmptySlots(loadMoreSlotCount);
    await scanUntilSlotsFilled();
  };

  const handleSlotClick = (media: MediaSlotValue) => {
    const index = loadedMedia.findIndex(
      (item) => item.attachment.sourceUrl === media.attachment.sourceUrl
    );
    if (index === -1) return;

    setCurrentIndex(index);
    setAttachmentViewerVisible(true);
  };

  return (
    <>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: `repeat(${gridColumns}, minmax(0, 1fr))`,
          gap: 2,
          padding: 2,
        }}
      >
        {slots.map((slot) => (
          <MediaSlot
            key={slot.id}
            media={slot.media}
            onClick={handleSlotClick}
          />
        ))}
      </div>

      <InfiniteScroll loadMore={handleLoadMore} hasMore={hasMore} />

      <AttachmentViewer
        attachments={viewerAttachments}
        visible={attachmentViewerVisible}
        currentIndex={currentIndex}
        onClose={() => setAttachmentViewerVisible(false)}
        viewContainer={document.body}
      />
    </>
  );
}
