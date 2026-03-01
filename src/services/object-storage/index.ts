import { ObjectStorage } from "./interface"
import MemoryObjectStorage from "./memory.fs"


export function createMemoryObjectStorage(): ObjectStorage {
    return new MemoryObjectStorage()
}


