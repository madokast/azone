import { describe, it, expect } from "vitest";
import { extractDate } from "../identifier";
import { MemoryPostService } from "./memory.service";
import { formatDate } from "./utils";

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
  const service = new (MemoryPostService as any)(nowDateProvider) as MemoryPostService;
  return { service, nowState };
}

describe("MemoryPostService.createPost", () => {
  it("should use injected clock for id and createdAt", async () => {
    const date = new Date("2025-01-01T12:34:56")
    const { service } = createMemoryPostServiceForTest(date);

    await service.createPost({ content: "post1" })

    const posts = await service.getPosts(1, 1);
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

    const posts = await service.getPosts(1, 2);
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

    const posts = await service.getPosts(1, 2);
    expect(posts).toHaveLength(2);
    expect(extractDate(posts[0].id)).toStrictEqual(newerDate);
    expect(extractDate(posts[1].id)).toStrictEqual(olderDate);
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
})
