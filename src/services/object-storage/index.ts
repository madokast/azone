import { ObjectStorage } from "./interface"
import MemoryObjectStorage from "./memory.fs"

import { S3Config, S3ObjectStorage, s3ConnectTest } from "./s3.fs";

export const ObjectStorageIns: ObjectStorage = new MemoryObjectStorage();
