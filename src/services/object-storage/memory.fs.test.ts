import { describe, it, expect } from "vitest"
import MemoryObjectStorage from "./memory.fs";

function string2stream(str: string): ReadableStream<Uint8Array> {
    return new ReadableStream({
        start(controller) {
            controller.enqueue(new TextEncoder().encode(str))
            controller.close()
        }
    })
}

describe("MemoryObjectStorage", () => {
    it("should list files and directories", async () => {
        const storage = new MemoryObjectStorage();
        await storage.put("/1.txt", string2stream("test"));
        await storage.put("/2.txt", string2stream("test"));
        await storage.put("/abc/3.txt", string2stream("test"));
        await storage.put("/abc/4.txt", string2stream("test"));

        const files = []
        for await (const entry of storage.list("/")) {
            files.push(entry)
        }
        console.log(`list /: ${files}`)
        expect(files).toEqual(["/1.txt", "/2.txt", "/abc/"])
        

        const files2 = []
        for await (const entry of storage.list("/abc/")) {
            files2.push(entry)
        }
        console.log(`list /abc/: ${files2}`)
        expect(files2).toEqual(["/abc/3.txt", "/abc/4.txt"])
    })
})
