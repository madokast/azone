import { ObjectStorage } from "./interface";
import { mustEndWithSlash } from "./asserts";

export default class MemoryObjectStorage implements ObjectStorage {

    private storage = new Map<string, Uint8Array>();

    async get(path: string): Promise<ReadableStream<Uint8Array<ArrayBuffer>>> {
        const data = this.storage.get(path);
        if (!data) throw new Error(`Not Found: ${path}`);

        return new ReadableStream({
            start(controller) {
                controller.enqueue(data.slice()); // 防止外部修改
                controller.close();
            },
            cancel() {
                // memory storage 无需处理
            }
        });
    }

    async put(path: string, data: ReadableStream<Uint8Array<ArrayBuffer>>): Promise<void> {
        const buffer = await new Response(data).arrayBuffer()
        this.storage.set(path, new Uint8Array(buffer))
        console.log(`MemoryObjectStorage put ${path}`)
    }

    async delete(path: string): Promise<void> {
        this.storage.delete(path)
    }

    async list(prefix: string): Promise<string[]> {
        mustEndWithSlash(prefix);

        const seenDirs = new Set<string>()
        const paths: string[] = []

        for (const key of this.storage.keys()) {
            if (!key.startsWith(prefix)) continue

            const rest = key.slice(prefix.length)
            if (!rest) continue

            const i = rest.indexOf("/")

            if (i === -1) {
                // 文件
                paths.push(prefix + rest);
            } else {
                // 子目录
                const dir = prefix + rest.slice(0, i + 1)
                if (!seenDirs.has(dir)) {
                    seenDirs.add(dir)
                    paths.push(dir)
                }
            }
        }
        return paths;
    }

    clear() {
        this.storage.clear()
    }
}
