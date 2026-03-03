import { describe, it, expect } from "vitest"
import { ObjectStorageIns } from "../object-storage";
import StoragePostService from "./storage.service";
import { CreatePostDto, Post } from "./schema";
import { generateId } from "../identifier";
import MemoryObjectStorage from "../object-storage/memory.fs";

function string2stream(str: string): ReadableStream<Uint8Array> {
    return new ReadableStream({
        start(controller) {
            controller.enqueue(new TextEncoder().encode(str))
            controller.close()
        }
    })
}

describe("oldestDate", () => {
    it("should return null when posts is empty", async () => {
        const service = new StoragePostService("/posts");
        const date = await service.oldestDate();
        expect(date).toBeNull();
    })

    it("should return the oldest date when posts is not empty", async () => {
        const service = new StoragePostService("/posts", new MemoryObjectStorage());
        const now = new Date()
        await service.createPost({ content: "post1" })
        await service.createPost({ content: "post2" })

        const oldest = await service.oldestDate();
        expect(oldest?.getFullYear()).toBe(now.getFullYear());
        expect(oldest?.getMonth()).toBe(now.getMonth());
        expect(oldest?.getDate()).toBe(now.getDate());
    })

    it("should return the oldest date when posts is not empty", async () => {
        const service = new StoragePostService("/posts", new MemoryObjectStorage());
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