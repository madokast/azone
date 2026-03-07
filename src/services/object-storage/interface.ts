
export interface ObjectStorage {
    get(path: string): Promise<ReadableStream<Uint8Array<ArrayBuffer>>>
    put(path: string, data: ReadableStream<Uint8Array<ArrayBuffer>>): Promise<void>
    delete(path: string): Promise<void>
    list(prefix: string): Promise<string[]>
}
