import { ObjectStorage } from "./interface"
import MemoryObjectStorage from "./memory.fs"


export const ObjectStorageIns: ObjectStorage = new MemoryObjectStorage();



