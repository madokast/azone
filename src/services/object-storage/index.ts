import { ObjectStorage } from "./interface"
import MemoryObjectStorage from "./memory.fs"
import {S3ObjectStorage, S3Config} from "./s3.fs"
import CryptoObjectStorage from "./crypto.fs"
import IndexDBObjectStorage from "./indexdb.cache.fs"

export { S3ObjectStorage, type S3Config }
export { MemoryObjectStorage }
export { CryptoObjectStorage }
export { IndexDBObjectStorage }

export { type ObjectStorage }