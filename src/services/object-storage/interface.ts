
export interface ListOptions {
    file: boolean
    directory: boolean
}

export interface ObjectStorage {
    get(path: string): Promise<ReadableStream<Uint8Array>>
    put(path: string, data: ReadableStream<Uint8Array>): Promise<void>
    delete(path: string): Promise<void>
    list(prefix: string, options?: ListOptions): Promise<string[]>
}
