import { DBSchema, IDBPDatabase, openDB } from "idb";
import { ObjectStorage } from "./interface";
import { mustEndWithSlash } from "./asserts";

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
  let database: IDBPDatabase<DB>;

  database = await openDB<DB>(dbName, 1, {
    upgrade(db) {
      if (!db.objectStoreNames.contains(STORE_FILES)) {
        db.createObjectStore(STORE_FILES)
      }
      if (!db.objectStoreNames.contains(STORE_LISTS)) {
        db.createObjectStore(STORE_LISTS)
      }
    },
    blocking() {
      database.close()
    },
  })

  return database
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

    // 暂时先全部清空 STORE_LISTS
    const tx = db.transaction(STORE_LISTS, "readwrite")
    const store = tx.objectStore(STORE_LISTS)

    for (const k of await store.getAllKeys()) {
      await store.delete(k)
    }
    await tx.done
  }

  async delete(key: string): Promise<void> {
    await this.proxy.delete(key)

    const db = await this.dbPromise

    await db.delete(STORE_FILES, key)

    // 暂时先全部清空 STORE_LISTS
    const tx = db.transaction(STORE_LISTS, "readwrite")
    const store = tx.objectStore(STORE_LISTS)

    for (const k of await store.getAllKeys()) {
      await store.delete(k)
    }
    await tx.done
  }

  async list(prefix: string): Promise<string[]> {
    mustEndWithSlash(prefix);
    const db = await this.dbPromise
    let paths = await db.get(STORE_LISTS, prefix)
    if (paths === undefined) {
      paths = await this.proxy.list(prefix)
      await db.put(STORE_LISTS, paths, prefix)
    }
    return paths
  }

  async clearAll(): Promise<void> {
    const db = await this.dbPromise
    const tx = db.transaction([STORE_FILES, STORE_LISTS], "readwrite")
    await Promise.all([
      tx.objectStore(STORE_FILES).clear(),
      tx.objectStore(STORE_LISTS).clear(),
    ])
    await tx.done
  }
}
