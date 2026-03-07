import { ObjectStorage } from "./interface";
import CryptoWrapper from "../crypto-wrapper";

export default class CryptoObjectStorage implements ObjectStorage {
    private crypto: CryptoWrapper;
    private proxy: ObjectStorage;

    constructor(crypto: CryptoWrapper, proxy: ObjectStorage) {
        this.crypto = crypto;
        this.proxy = proxy;
    }

    async get(path: string): Promise<ReadableStream<Uint8Array<ArrayBuffer>>> {
        const encrypted = await this.proxy.get(path);
        const buffer = await new Response(encrypted).arrayBuffer()
        const decrypted = await this.crypto.decryptBuffer(buffer);

        return new ReadableStream({
            start(controller) {
                controller.enqueue(new Uint8Array(decrypted));
                controller.close();
            },
            cancel() { }
        });
    }

    async put(path: string, data: ReadableStream<Uint8Array<ArrayBuffer>>): Promise<void> {
        const buffer = await new Response(data).arrayBuffer();

        const encrypted = await this.crypto.encryptBuffer(buffer);

        const stream = new ReadableStream({
            start(controller) {
                controller.enqueue(new Uint8Array(encrypted));
                controller.close();
            },
            cancel() { }
        });
        await this.proxy.put(path, stream);
    }

    async delete(path: string): Promise<void> {
        await this.proxy.delete(path);
    }

    async list(prefix: string): Promise<string[]> {
        return this.proxy.list(prefix);
    }
}