import { ListOptions, ObjectStorage } from "./interface";

export default class PrefixObjectStorage implements ObjectStorage {
    private prefix: string;
    private proxy: ObjectStorage;

    constructor(prefix: string, proxy: ObjectStorage) {
        while (prefix.startsWith("/")) {
            prefix = prefix.slice(1)
        }
        while (prefix.endsWith("/")) {
            prefix = prefix.slice(0, -1)
        }
        this.prefix = prefix;
        this.proxy = proxy;
    }

    private addPrefix(path: string) {
        if (path.startsWith("/")) {
            path = path.slice(1)
        }
        return this.prefix + "/" + path;
    }

    async get(path: string): Promise<ReadableStream<Uint8Array>> {
        return this.proxy.get(this.addPrefix(path))
    }

    async put(path: string, data: ReadableStream<Uint8Array>): Promise<void> {
        await this.proxy.put(this.addPrefix(path), data)
    }

    async delete(path: string): Promise<void> {
        await this.proxy.delete(this.addPrefix(path))
    }

    async list(prefix: string, options?: ListOptions): Promise<string[]> {
        return this.proxy.list(this.addPrefix(prefix), options)
    }
}

