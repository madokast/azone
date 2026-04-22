import { describe, it, expect } from "vitest";
import StoragePostService from "./storage.service";
import type { Clock } from "./storage.service";
import { extractDate } from "../identifier";
import MemoryObjectStorage from "../object-storage/memory.fs";
import { PostService } from "./index";
import { MemoryAttachmentService } from "../attachments/memory.service";

type StoragePostServiceForTest = PostService & {
    nextLoadPostDate(): Promise<Date | null>
    oldestDate(): Promise<Date | null>
}

type TestNowState = {
    value: Date
};

// 测试用法：
// 1) 通过 nowState.value 维护当前“时间”；
// 2) clock 每次调用都读取 nowState.value；
// 3) 在一次测试中反复修改 nowState.value，即可驱动 createPost 使用不同时间。
function createStoragePostServiceForTest(initialNow: Date = new Date()): {
    service: StoragePostServiceForTest,
    nowState: TestNowState
} {
    const nowState: TestNowState = { value: initialNow };
    const nowDateProvider: Clock = () => nowState.value;
    const service = new StoragePostService(
        "posts",
        new MemoryObjectStorage(),
        new MemoryAttachmentService(),
        nowDateProvider
    ) as any as StoragePostServiceForTest;
    return { service, nowState };
}

describe("oldestDate", () => {
    it("should return null when posts is empty", async () => {
        const { service } = createStoragePostServiceForTest();
        const date = await service.oldestDate();
        expect(date).toBeNull();
    })

    it("should return the oldest date when posts is not empty", async () => {
        const { service } = createStoragePostServiceForTest();
        const now = new Date()
        await service.createPost({ content: "post1" })
        await service.createPost({ content: "post2" })

        const oldest = await service.oldestDate();
        expect(oldest?.getFullYear()).toBe(now.getFullYear());
        expect(oldest?.getMonth()).toBe(now.getMonth());
        expect(oldest?.getDate()).toBe(now.getDate());
    })

    it("should return the oldest date when posts contain different dates", async () => {
        const date20250101 = new Date("2025-01-01")
        const { service, nowState } = createStoragePostServiceForTest(date20250101);
        const date20240503 = new Date("2024-05-03")
        nowState.value = date20250101;
        await service.createPost({ content: "post1" })
        nowState.value = date20240503;
        await service.createPost({ content: "post2" })

        const oldest = await service.oldestDate();
        expect(oldest?.getFullYear()).toBe(date20240503.getFullYear());
        expect(oldest?.getMonth()).toBe(date20240503.getMonth());
        expect(oldest?.getDate()).toBe(date20240503.getDate());
    })
})

describe("nextLoadPostDate", () => {
    it("should return null when posts is empty", async () => {
        const { service } = createStoragePostServiceForTest();
        const date = await service.nextLoadPostDate();
        expect(date).toBeNull();
    })

    it("should return one day before oldest cached date when posts share same date", async () => {
        const date20260303 = new Date("2026-03-03")
        const { service, nowState } = createStoragePostServiceForTest(date20260303);
        nowState.value = date20260303;
        await service.createPost({ content: "post1" })
        nowState.value = date20260303;
        await service.createPost({ content: "post2" })

        const nextLoadDate = await service.nextLoadPostDate();
        expect(nextLoadDate?.getFullYear()).toBe(date20260303.getFullYear());
        expect(nextLoadDate?.getMonth()).toBe(date20260303.getMonth());
        expect(nextLoadDate?.getDate()).toBe(date20260303.getDate() - 1);
    })

    it("should return one day before oldest cached date when posts have different dates", async () => {
        const date20250101 = new Date("2025-01-01")
        const { service, nowState } = createStoragePostServiceForTest(date20250101);
        const date20240503 = new Date("2024-05-03")
        nowState.value = date20250101;
        await service.createPost({ content: "post1" })
        nowState.value = date20240503;
        await service.createPost({ content: "post2" })

        const nextLoadDate = await service.nextLoadPostDate();
        expect(nextLoadDate?.getFullYear()).toBe(date20240503.getFullYear());
        expect(nextLoadDate?.getMonth()).toBe(date20240503.getMonth());
        expect(nextLoadDate?.getDate()).toBe(date20240503.getDate() - 1);
    })
})

describe("getPosts", () => {
    it("should insert newly created post into cached posts in date desc order", async () => {
        const oldDate = new Date("2024-05-03")
        const newDate = new Date("2025-01-01")
        const { service, nowState } = createStoragePostServiceForTest(oldDate);

        nowState.value = oldDate;
        await service.createPost({ content: "old-post" })
        const firstPageBefore = await service.getPosts(1, 1);
        expect(firstPageBefore.length).toBe(1);
        expect(extractDate(firstPageBefore[0].id)).toStrictEqual(oldDate);

        nowState.value = newDate;
        await service.createPost({ content: "new-post" })
        const firstPageAfter = await service.getPosts(1, 1);
        expect(firstPageAfter.length).toBe(1);
        expect(extractDate(firstPageAfter[0].id)).toStrictEqual(newDate);
    })

    it("should return posts when posts is not empty", async () => {
        const date20250101 = new Date("2025-01-01")
        const { service } = createStoragePostServiceForTest(date20250101);
        await service.createPost({ content: "post1" })
        const posts = await service.getPosts(1, 10);
        expect(posts.length).toBe(1);
        expect(extractDate(posts[0].id)).toStrictEqual(date20250101);
    })

    it("should return posts order by date desc", async () => {
        const date20250101 = new Date("2025-01-01")
        const date20240503 = new Date("2024-05-03")
        const { service, nowState } = createStoragePostServiceForTest(date20250101);
        nowState.value = date20250101;
        await service.createPost({ content: "post1" })
        nowState.value = date20240503;
        await service.createPost({ content: "post2" })
        const posts = await service.getPosts(1, 10);
        expect(posts.length).toBe(2);
        expect(extractDate(posts[0].id)).toStrictEqual(date20250101);
        expect(extractDate(posts[1].id)).toStrictEqual(date20240503);
    })

    it("should return posts order by date desc 2", async () => {
        const date20250101 = new Date("2025-01-01")
        const date20240503 = new Date("2024-05-03")
        const { service, nowState } = createStoragePostServiceForTest(date20240503);
        nowState.value = date20240503;
        await service.createPost({ content: "post2" })
        nowState.value = date20250101;
        await service.createPost({ content: "post1" })
        const posts = await service.getPosts(1, 10);
        expect(posts.length).toBe(2);
        expect(extractDate(posts[0].id)).toStrictEqual(date20250101);
        expect(extractDate(posts[1].id)).toStrictEqual(date20240503);
    })

    it("should return only one post", async () => {
        const date20250101 = new Date("2025-01-01")
        const date20240503 = new Date("2024-05-03")
        const { service, nowState } = createStoragePostServiceForTest(date20240503);
        nowState.value = date20240503;
        await service.createPost({ content: "post2" })
        nowState.value = date20250101;
        await service.createPost({ content: "post1" })
        const posts = await service.getPosts(1, 1);
        expect(posts.length).toBe(1);
        expect(extractDate(posts[0].id)).toStrictEqual(date20250101);
    })

    it("should return only one post 2", async () => {
        const date20250101 = new Date("2025-01-01")
        const date20240503 = new Date("2024-05-03")
        const { service, nowState } = createStoragePostServiceForTest(date20250101);
        nowState.value = date20250101;
        await service.createPost({ content: "post1" })
        nowState.value = date20240503;
        await service.createPost({ content: "post2" })
        const posts = await service.getPosts(1, 1);
        expect(posts.length).toBe(1);
        expect(extractDate(posts[0].id)).toStrictEqual(date20250101);
    })

    it("should return all posts", async () => {
        const date20250101 = new Date("2025-01-01")
        const date20240503 = new Date("2024-05-03")
        const { service, nowState } = createStoragePostServiceForTest(date20250101);
        nowState.value = date20250101;
        await service.createPost({ content: "post1" })
        nowState.value = date20240503;
        await service.createPost({ content: "post2" })
        {
            const posts = await service.getPosts(1, 1);
            expect(posts.length).toBe(1);
            expect(extractDate(posts[0].id)).toStrictEqual(date20250101);
        }
        {
            const posts = await service.getPosts(2, 1);
            // console.log(service.posts);
            expect(posts.length).toBe(1);
            expect(extractDate(posts[0].id)).toStrictEqual(date20240503);
        }
    })

    it("should return all posts 2", async () => {
        const date20250101 = new Date("2025-01-01")
        const date20240503 = new Date("2024-05-03")
        const { service, nowState } = createStoragePostServiceForTest(date20240503);
        nowState.value = date20240503;
        await service.createPost({ content: "post2" })
        nowState.value = date20250101;
        await service.createPost({ content: "post1" })
        {
            const posts = await service.getPosts(1, 1);
            expect(posts.length).toBe(1);
            expect(extractDate(posts[0].id)).toStrictEqual(date20250101);
        }
        {
            const posts = await service.getPosts(2, 1);
            // console.log(service.posts);
            expect(posts.length).toBe(1);
            expect(extractDate(posts[0].id)).toStrictEqual(date20240503);
        }
    })
})

describe("StoragePostService.getLatestPosts", () => {
    it("should return all posts when limit is large enough", async () => {
        const date1 = new Date("2024-05-03T01:02:03")
        const date2 = new Date("2025-01-01T04:05:06")
        const { service, nowState } = createStoragePostServiceForTest(date1);

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
        const { service, nowState } = createStoragePostServiceForTest(olderDate);

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
        const { service, nowState } = createStoragePostServiceForTest(newerDate);

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

describe("StoragePostService.getPostsBefore", () => {
    // A1: 不包含锚点本身
    it("should not include the anchor post itself", async () => {
        const date1 = new Date("2024-01-01T01:00:00")
        const date2 = new Date("2024-02-01T01:00:00")
        const date3 = new Date("2024-03-01T01:00:00")
        const { service, nowState } = createStoragePostServiceForTest(date1);

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
        const { service, nowState } = createStoragePostServiceForTest(date1);

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
        const { service, nowState } = createStoragePostServiceForTest(date1);

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
        const { service, nowState } = createStoragePostServiceForTest(dates[0]);
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
        const { service, nowState } = createStoragePostServiceForTest(date1);

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
        const { service, nowState } = createStoragePostServiceForTest(date1);

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
        const { service, nowState } = createStoragePostServiceForTest(date1);

        nowState.value = date1; await service.createPost({ content: "p1" })
        nowState.value = date2; await service.createPost({ content: "p2" })

        const syntheticAnchor = "20240201-000000-zzzzzz";
        const posts = await service.getPostsBefore(syntheticAnchor, 10);
        expect(posts).toHaveLength(1);
        expect(extractDate(posts[0].id)).toStrictEqual(date1);
    })
})
