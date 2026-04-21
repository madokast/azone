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
