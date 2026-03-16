import { DBSchema, IDBPDatabase, openDB, deleteDB } from "idb";
import { ObjectStorage } from "./interface";

const STORE_FILES = "files"
const STORE_LISTS = "lists"

interface DB extends DBSchema {
  "files": {
    key: string;
    value: ArrayBuffer;
  };
  "lists": {
    key: string;
    value: string[];
  }
}

async function getDB(dbName: string): Promise<IDBPDatabase<DB>> {
  return openDB<DB>(dbName, 1, {
    upgrade(db) {
      if (!db.objectStoreNames.contains(STORE_FILES)) {
        db.createObjectStore(STORE_FILES)
      }
      if (!db.objectStoreNames.contains(STORE_LISTS)) {
        db.createObjectStore(STORE_LISTS)
      }
    }
  })
}

export default class IndexDBObjectStorage implements ObjectStorage {
  private dbPromise: Promise<IDBPDatabase<DB>>;
  private proxy: ObjectStorage;

  constructor(dbName: string, proxy: ObjectStorage) {
    this.dbPromise = getDB(dbName);
    this.proxy = proxy
  }

  async get(path: string): Promise<ReadableStream<Uint8Array<ArrayBuffer>>> {
    const db = await this.dbPromise
    let buffer = await db.get(STORE_FILES, path)

    if (buffer === undefined) { // 没有缓存
      const stream = await this.proxy.get(path)
      buffer = await new Response(stream).arrayBuffer()
      await db.put(STORE_FILES, buffer, path)
    }
    return new ReadableStream({
      start(controller) {
        controller.enqueue(new Uint8Array(buffer));
        controller.close();
      },
      cancel() { }
    });
  }

  async put(key: string, data: ReadableStream<Uint8Array<ArrayBuffer>>): Promise<void> {
    const buffer = await new Response(data).arrayBuffer()
    { // 写入 proxy
      const stream = new ReadableStream({
        start(controller) {
          controller.enqueue(new Uint8Array(buffer));
          controller.close();
        },
        cancel() { }
      })
      await this.proxy.put(key, stream)
    }
    const db = await this.dbPromise
    await db.put(STORE_FILES, buffer, key)
  }

  async delete(key: string): Promise<void> {
    await this.proxy.delete(key)

    const db = await this.dbPromise

    await db.delete(STORE_FILES, key)

    const tx = db.transaction(STORE_LISTS, "readwrite")
    const store = tx.objectStore(STORE_LISTS)

    for (const prefix of await store.getAllKeys()) {
      if (prefix.startsWith(key)) {
        await store.delete(prefix)
      }
    }
    await tx.done
  }

  async list(prefix: string): Promise<string[]> {
    const db = await this.dbPromise
    let paths = await db.get(STORE_LISTS, prefix)
    if (paths === undefined) {
      paths = await this.proxy.list(prefix)
      await db.put(STORE_LISTS, paths, prefix)
    }
    return paths
  }
}

export async function clearIndexDB(dbName: string): Promise<void> {
  console.log(`clearIndexDB: ${dbName}`)
  await deleteDB(dbName)
}
