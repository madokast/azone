import { ObjectStorage } from "./interface";
import { mustEndWithSlash } from "./asserts";

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

    async get(path: string): Promise<ReadableStream<Uint8Array<ArrayBuffer>>> {
        return this.proxy.get(this.addPrefix(path))
    }

    async put(path: string, data: ReadableStream<Uint8Array<ArrayBuffer>>): Promise<void> {
        await this.proxy.put(this.addPrefix(path), data)
    }

    async delete(path: string): Promise<void> {
        await this.proxy.delete(this.addPrefix(path))
    }

    async list(prefix: string): Promise<string[]> {
        mustEndWithSlash(prefix);
        const fullPrefix = this.addPrefix(prefix)
        const paths = await this.proxy.list(fullPrefix)

        const base = this.prefix + "/"

        return paths.map((p) => {
            if (!p.startsWith(base)) {
                throw new Error(`Invalid path from proxy: ${p}, expected prefix ${base}`)
            }
            return p.slice(base.length)
        })
    }
}

