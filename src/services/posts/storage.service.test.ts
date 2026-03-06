import { describe, it, expect } from "vitest";
import StoragePostService from "./storage.service";
import { extractDate } from "../identifier";
import MemoryObjectStorage from "../object-storage/memory.fs";
import { PostService } from "./service.interface";
import { CreatePostDto } from "./schema";

type StoragePostServiceForTest = PostService & {
    createPost(postData: CreatePostDto, now: Date | null): Promise<void>
    nextLoadPostDate(): Promise<Date | null>
    oldestDate(): Promise<Date | null>
}

function createStoragePostServiceForTest(): StoragePostServiceForTest {
    return new StoragePostService("/posts", new MemoryObjectStorage()) as any as StoragePostServiceForTest;
}

describe("oldestDate", () => {
    it("should return null when posts is empty", async () => {
        const service = createStoragePostServiceForTest();
        const date = await service.oldestDate();
        expect(date).toBeNull();
    })

    it("should return the oldest date when posts is not empty", async () => {
        const service = createStoragePostServiceForTest();
        const now = new Date()
        await service.createPost({ content: "post1" })
        await service.createPost({ content: "post2" })

        const oldest = await service.oldestDate();
        expect(oldest?.getFullYear()).toBe(now.getFullYear());
        expect(oldest?.getMonth()).toBe(now.getMonth());
        expect(oldest?.getDate()).toBe(now.getDate());
    })

    it("should return the oldest date when posts contain different dates", async () => {
        const service = createStoragePostServiceForTest();
        const date20250101 = new Date("2025-01-01")
        const date20240503 = new Date("2024-05-03")
        await service.createPost({ content: "post1" }, date20250101)
        await service.createPost({ content: "post2" }, date20240503)

        const oldest = await service.oldestDate();
        expect(oldest?.getFullYear()).toBe(date20240503.getFullYear());
        expect(oldest?.getMonth()).toBe(date20240503.getMonth());
        expect(oldest?.getDate()).toBe(date20240503.getDate());
    })
})

describe("nextLoadPostDate", () => {
    it("should return null when posts is empty", async () => {
        const service = createStoragePostServiceForTest();
        const date = await service.nextLoadPostDate();
        expect(date).toBeNull();
    })

    it("should return the next load post date when posts is not empty", async () => {
        const service = createStoragePostServiceForTest();
        const date20260303 = new Date("2026-03-03")
        await service.createPost({ content: "post1" }, date20260303)
        await service.createPost({ content: "post2" }, date20260303)

        const nextLoadDate = await service.nextLoadPostDate();
        console.log(`nextLoadDate: ${nextLoadDate}`)
        expect(nextLoadDate?.getFullYear()).toBe(date20260303.getFullYear());
        expect(nextLoadDate?.getMonth()).toBe(date20260303.getMonth());
        expect(nextLoadDate?.getDate()).toBe(date20260303.getDate());
    })

    it("should return the next load post date when posts contain different dates", async () => {
        const service = createStoragePostServiceForTest();
        const date20250101 = new Date("2025-01-01")
        const date20240503 = new Date("2024-05-03")
        await service.createPost({ content: "post1" }, date20250101)
        await service.createPost({ content: "post2" }, date20240503)

        const nextLoadDate = await service.nextLoadPostDate();
        expect(nextLoadDate?.getFullYear()).toBe(date20250101.getFullYear());
        expect(nextLoadDate?.getMonth()).toBe(date20250101.getMonth());
        expect(nextLoadDate?.getDate()).toBe(date20250101.getDate());
    })
})

describe("getPosts", () => {
    it("should return posts when posts is not empty", async () => {
        const service = new StoragePostService("/posts", new MemoryObjectStorage());
        const date20250101 = new Date("2025-01-01")
        await service.createPost({ content: "post1" }, date20250101)
        const posts = await service.getPosts(1, 10);
        expect(posts.length).toBe(1);
        expect(extractDate(posts[0].id)).toStrictEqual(date20250101);
    })

    it("should return posts order by date desc", async () => {
        const service = new StoragePostService("/posts", new MemoryObjectStorage());
        const date20250101 = new Date("2025-01-01")
        const date20240503 = new Date("2024-05-03")
        await service.createPost({ content: "post1" }, date20250101)
        await service.createPost({ content: "post2" }, date20240503)
        const posts = await service.getPosts(1, 10);
        expect(posts.length).toBe(2);
        expect(extractDate(posts[0].id)).toStrictEqual(date20250101);
        expect(extractDate(posts[1].id)).toStrictEqual(date20240503);
    })

    it("should return posts order by date desc 2", async () => {
        const service = new StoragePostService("/posts", new MemoryObjectStorage());
        const date20250101 = new Date("2025-01-01")
        const date20240503 = new Date("2024-05-03")
        await service.createPost({ content: "post2" }, date20240503)
        await service.createPost({ content: "post1" }, date20250101)
        const posts = await service.getPosts(1, 10);
        expect(posts.length).toBe(2);
        expect(extractDate(posts[0].id)).toStrictEqual(date20250101);
        expect(extractDate(posts[1].id)).toStrictEqual(date20240503);
    })

    it("should return only one post", async () => {
        const service = new StoragePostService("/posts", new MemoryObjectStorage());
        const date20250101 = new Date("2025-01-01")
        const date20240503 = new Date("2024-05-03")
        await service.createPost({ content: "post2" }, date20240503)
        await service.createPost({ content: "post1" }, date20250101)
        const posts = await service.getPosts(1, 1);
        expect(posts.length).toBe(1);
        expect(extractDate(posts[0].id)).toStrictEqual(date20250101);
    })

    it("should return only one post 2", async () => {
        const service = new StoragePostService("/posts", new MemoryObjectStorage());
        const date20250101 = new Date("2025-01-01")
        const date20240503 = new Date("2024-05-03")
        await service.createPost({ content: "post1" }, date20250101)
        await service.createPost({ content: "post2" }, date20240503)
        const posts = await service.getPosts(1, 1);
        expect(posts.length).toBe(1);
        expect(extractDate(posts[0].id)).toStrictEqual(date20250101);
    })

    it("should return all posts", async () => {
        const service = new StoragePostService("/posts", new MemoryObjectStorage());
        const date20250101 = new Date("2025-01-01")
        const date20240503 = new Date("2024-05-03")
        await service.createPost({ content: "post1" }, date20250101)
        await service.createPost({ content: "post2" }, date20240503)
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
        const service = new StoragePostService("/posts", new MemoryObjectStorage());
        const date20250101 = new Date("2025-01-01")
        const date20240503 = new Date("2024-05-03")
        await service.createPost({ content: "post2" }, date20240503)
        await service.createPost({ content: "post1" }, date20250101)
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
