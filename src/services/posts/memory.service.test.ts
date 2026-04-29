import { describe, it, expect } from "vitest";
import { extractDate } from "../identifier";
import { MemoryPostService } from "./memory.service";
import { formatDate } from "./utils";
import type { AttachmentService, Attachment, MetaAttachment } from "../attachments";

type TestNowState = {
  value: Date
};

// 通过修改 nowState.value，让同一个 clock 在每次 createPost 时返回不同时间。
function createMemoryPostServiceForTest(initialNow: Date = new Date()): {
  service: MemoryPostService,
  nowState: TestNowState
} {
  const nowState: TestNowState = { value: initialNow };
  const nowDateProvider = () => nowState.value;
  const service = new MemoryPostService(nowDateProvider);
  return { service, nowState };
}

class StubAttachmentService implements AttachmentService {
  uploaded: Omit<Attachment, 'id'>[] = [];

  getAttachment(_meta: MetaAttachment): Promise<Attachment> {
    throw new Error("Not implemented");
  }

  deleteAttachment(_id: string): Promise<void> {
    throw new Error("Not implemented");
  }

  getAttachments(_metas: MetaAttachment[]): Promise<Attachment[]> {
    throw new Error("Not implemented");
  }

  uploadAttachment(attachment: Omit<Attachment, 'id'>): Promise<MetaAttachment> {
    this.uploaded.push(attachment);
    return Promise.resolve({
      id: `stub-${this.uploaded.length}`,
      mimeType: attachment.mimeType,
    });
  }
}

describe("MemoryPostService.createPost", () => {
  it("should use injected clock for id and createdAt", async () => {
    const date = new Date("2025-01-01T12:34:56")
    const { service } = createMemoryPostServiceForTest(date);

    await service.createPost({ content: "post1" })

    const posts = await service.getLatestPosts(1);
    expect(posts).toHaveLength(1);
    expect(extractDate(posts[0].id)).toStrictEqual(date);
    expect(posts[0].createdAt).toBe(formatDate(date));
  })

  it("should read the latest clock value on each createPost call", async () => {
    const oldDate = new Date("2024-05-03T01:02:03")
    const newDate = new Date("2025-01-01T04:05:06")
    const { service, nowState } = createMemoryPostServiceForTest(oldDate);

    nowState.value = oldDate;
    await service.createPost({ content: "old-post" })
    nowState.value = newDate;
    await service.createPost({ content: "new-post" })

    const posts = await service.getLatestPosts(2);
    expect(posts).toHaveLength(2);
    expect(extractDate(posts[0].id)).toStrictEqual(newDate);
    expect(posts[0].createdAt).toBe(formatDate(newDate));
    expect(extractDate(posts[1].id)).toStrictEqual(oldDate);
    expect(posts[1].createdAt).toBe(formatDate(oldDate));
  })

  it("should keep posts in id desc order when an older post is created later", async () => {
    const newerDate = new Date("2025-01-01T04:05:06")
    const olderDate = new Date("2024-05-03T01:02:03")
    const { service, nowState } = createMemoryPostServiceForTest(newerDate);

    nowState.value = newerDate;
    await service.createPost({ content: "new-post" })
    nowState.value = olderDate;
    await service.createPost({ content: "old-post" })

    const posts = await service.getLatestPosts(2);
    expect(posts).toHaveLength(2);
    expect(extractDate(posts[0].id)).toStrictEqual(newerDate);
    expect(extractDate(posts[1].id)).toStrictEqual(olderDate);
  })

  it("should use injected attachment service when creating posts with attachments", async () => {
    const attachmentService = new StubAttachmentService();
    const service = new MemoryPostService(() => new Date("2025-01-01T12:34:56"), attachmentService);
    const attachment: Omit<Attachment, 'id'> = {
      mimeType: "image/png",
      sourceUrl: "blob:source",
      thumbnailUrl: "blob:thumbnail",
    };

    await service.createPost({
      content: "post with injected attachment service",
      attachments: [attachment],
    });

    const posts = await service.getLatestPosts(1);
    expect(attachmentService.uploaded).toEqual([attachment]);
    expect(posts[0].attachments).toEqual([{ id: "stub-1", mimeType: "image/png" }]);
  })
})

describe("MemoryPostService.getLatestPosts", () => {
  it("should return all posts when limit is large enough", async () => {
    const date1 = new Date("2024-05-03T01:02:03")
    const date2 = new Date("2025-01-01T04:05:06")
    const { service, nowState } = createMemoryPostServiceForTest(date1);

    nowState.value = date1;
    await service.createPost({ content: "post1" })
    nowState.value = date2;
    await service.createPost({ content: "post2" })

    const posts = await service.getLatestPosts(10);
    expect(posts).toHaveLength(2);
  })

  it("should return posts in id desc order when older is created first", async () => {
    const olderDate = new Date("2024-05-03T01:02:03")
    const newerDate = new Date("2025-01-01T04:05:06")
    const { service, nowState } = createMemoryPostServiceForTest(olderDate);

    nowState.value = olderDate;
    await service.createPost({ content: "old-post" })
    nowState.value = newerDate;
    await service.createPost({ content: "new-post" })

    const posts = await service.getLatestPosts(10);
    expect(posts).toHaveLength(2);
    expect(extractDate(posts[0].id)).toStrictEqual(newerDate);
    expect(extractDate(posts[1].id)).toStrictEqual(olderDate);
  })

  it("should return posts in id desc order when newer is created first", async () => {
    const olderDate = new Date("2024-05-03T01:02:03")
    const newerDate = new Date("2025-01-01T04:05:06")
    const { service, nowState } = createMemoryPostServiceForTest(newerDate);

    nowState.value = newerDate;
    await service.createPost({ content: "new-post" })
    nowState.value = olderDate;
    await service.createPost({ content: "old-post" })

    const posts = await service.getLatestPosts(10);
    expect(posts).toHaveLength(2);
    expect(extractDate(posts[0].id)).toStrictEqual(newerDate);
    expect(extractDate(posts[1].id)).toStrictEqual(olderDate);
  })

  // limit < 总数：只返 limit 条，且必须是最新的
  it("should return at most limit posts", async () => {
    const olderDate = new Date("2024-05-03T01:02:03")
    const newerDate = new Date("2025-01-01T04:05:06")
    const { service, nowState } = createMemoryPostServiceForTest(olderDate);

    nowState.value = olderDate;
    await service.createPost({ content: "old-post" })
    nowState.value = newerDate;
    await service.createPost({ content: "new-post" })

    const posts = await service.getLatestPosts(1);
    expect(posts).toHaveLength(1);
    expect(extractDate(posts[0].id)).toStrictEqual(newerDate);
  })
})

describe("MemoryPostService cursor pagination", () => {
  // 联合分页：getLatestPosts + getPostsBefore 能完整翻完所有数据
  it("should walk through all posts using getLatestPosts then getPostsBefore", async () => {
    const dates = [
      new Date("2024-01-01T01:00:00"),
      new Date("2024-02-01T01:00:00"),
      new Date("2024-03-01T01:00:00"),
      new Date("2024-04-01T01:00:00"),
    ]
    const { service, nowState } = createMemoryPostServiceForTest(dates[0]);
    for (const d of dates) {
      nowState.value = d
      await service.createPost({ content: d.toISOString() })
    }

    // 一次拉一条，期望按时间倒序拿到全部 4 条
    const collected: string[] = [];
    const first = await service.getLatestPosts(1);
    expect(first).toHaveLength(1);
    collected.push(first[0].id);

    while (true) {
      const next = await service.getPostsBefore(collected[collected.length - 1], 1);
      if (next.length === 0) break;
      collected.push(next[0].id);
    }

    expect(collected).toHaveLength(4);
    // 严格倒序
    for (let i = 0; i < collected.length - 1; i++) {
      expect(collected[i] > collected[i + 1]).toBe(true);
    }
    // 最新 = dates[3]，最老 = dates[0]
    expect(extractDate(collected[0])).toStrictEqual(dates[3]);
    expect(extractDate(collected[collected.length - 1])).toStrictEqual(dates[0]);
  })
})

describe("MemoryPostService.getPostsBefore", () => {
  // A1: 不包含锚点本身
  it("should not include the anchor post itself", async () => {
    const date1 = new Date("2024-01-01T01:00:00")
    const date2 = new Date("2024-02-01T01:00:00")
    const date3 = new Date("2024-03-01T01:00:00")
    const { service, nowState } = createMemoryPostServiceForTest(date1);

    nowState.value = date1; await service.createPost({ content: "p1" })
    nowState.value = date2; await service.createPost({ content: "p2" })
    nowState.value = date3; await service.createPost({ content: "p3" })

    const all = await service.getLatestPosts(10);
    const middleId = all[1].id;

    const posts = await service.getPostsBefore(middleId, 10);
    expect(posts.find(p => p.id === middleId)).toBeUndefined();
  })

  // A2: 所有结果严格 < beforeId
  it("should only return posts with id strictly less than beforeId", async () => {
    const date1 = new Date("2024-01-01T01:00:00")
    const date2 = new Date("2024-02-01T01:00:00")
    const date3 = new Date("2024-03-01T01:00:00")
    const { service, nowState } = createMemoryPostServiceForTest(date1);

    nowState.value = date1; await service.createPost({ content: "p1" })
    nowState.value = date2; await service.createPost({ content: "p2" })
    nowState.value = date3; await service.createPost({ content: "p3" })

    const all = await service.getLatestPosts(10);
    const middleId = all[1].id;

    const posts = await service.getPostsBefore(middleId, 10);
    for (const p of posts) {
      expect(p.id < middleId).toBe(true);
    }
  })

  // A3: 结果按 id 倒序
  it("should return posts in id desc order", async () => {
    const date1 = new Date("2024-01-01T01:00:00")
    const date2 = new Date("2024-02-01T01:00:00")
    const date3 = new Date("2024-03-01T01:00:00")
    const date4 = new Date("2024-04-01T01:00:00")
    const { service, nowState } = createMemoryPostServiceForTest(date1);

    nowState.value = date1; await service.createPost({ content: "p1" })
    nowState.value = date2; await service.createPost({ content: "p2" })
    nowState.value = date3; await service.createPost({ content: "p3" })
    nowState.value = date4; await service.createPost({ content: "p4" })

    const all = await service.getLatestPosts(10);
    const anchorId = all[0].id;

    const posts = await service.getPostsBefore(anchorId, 10);
    expect(posts).toHaveLength(3);
    for (let i = 0; i < posts.length - 1; i++) {
      expect(posts[i].id > posts[i + 1].id).toBe(true);
    }
  })

  // A4: 尊重 limit 上限
  it("should return at most limit posts", async () => {
    const dates = [
      new Date("2024-01-01T01:00:00"),
      new Date("2024-02-01T01:00:00"),
      new Date("2024-03-01T01:00:00"),
      new Date("2024-04-01T01:00:00"),
      new Date("2024-05-01T01:00:00"),
    ]
    const { service, nowState } = createMemoryPostServiceForTest(dates[0]);
    for (const d of dates) {
      nowState.value = d
      await service.createPost({ content: d.toISOString() })
    }

    const all = await service.getLatestPosts(10);
    const anchorId = all[0].id;

    const posts = await service.getPostsBefore(anchorId, 2);
    expect(posts).toHaveLength(2);
  })

  // B5: 锚点之前的数据少于 limit，应返回实际数量
  it("should return fewer than limit when not enough older posts exist", async () => {
    const date1 = new Date("2024-01-01T01:00:00")
    const date2 = new Date("2024-02-01T01:00:00")
    const { service, nowState } = createMemoryPostServiceForTest(date1);

    nowState.value = date1; await service.createPost({ content: "p1" })
    nowState.value = date2; await service.createPost({ content: "p2" })

    const all = await service.getLatestPosts(10);
    const anchorId = all[0].id;

    const posts = await service.getPostsBefore(anchorId, 10);
    expect(posts).toHaveLength(1);
  })

  // B6: 锚点已经是最旧帖子，返回空数组
  it("should return empty array when anchor is the oldest post", async () => {
    const date1 = new Date("2024-01-01T01:00:00")
    const date2 = new Date("2024-02-01T01:00:00")
    const { service, nowState } = createMemoryPostServiceForTest(date1);

    nowState.value = date1; await service.createPost({ content: "p1" })
    nowState.value = date2; await service.createPost({ content: "p2" })

    const all = await service.getLatestPosts(10);
    const oldestId = all[1].id;

    const posts = await service.getPostsBefore(oldestId, 10);
    expect(posts).toHaveLength(0);
  })

  // D7: 锚点 id 不存在，按字符串比较返回严格小于该 id 的帖子
  it("should work as a string comparison when anchor id does not exist", async () => {
    const date1 = new Date("2024-01-01T01:00:00")
    const date2 = new Date("2024-03-01T01:00:00")
    const { service, nowState } = createMemoryPostServiceForTest(date1);

    nowState.value = date1; await service.createPost({ content: "p1" })
    nowState.value = date2; await service.createPost({ content: "p2" })

    const syntheticAnchor = "20240201-000000-zzzzzz";
    const posts = await service.getPostsBefore(syntheticAnchor, 10);
    expect(posts).toHaveLength(1);
    expect(extractDate(posts[0].id)).toStrictEqual(date1);
  })
})
