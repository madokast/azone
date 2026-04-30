import { createServer, type IncomingMessage, type Server, type ServerResponse } from "node:http";
import { AddressInfo } from "node:net";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { createS3ObjectStorage, type S3Config } from "./s3-sdk.fs";

const BUCKET = "test-bucket";
const decoder = new TextDecoder();

function streamFromString(value: string): ReadableStream<Uint8Array<ArrayBuffer>> {
    return new ReadableStream({
        start(controller) {
            controller.enqueue(new TextEncoder().encode(value));
            controller.close();
        }
    });
}

function readRequestBody(request: IncomingMessage): Promise<Buffer> {
    return new Promise((resolve, reject) => {
        const chunks: Buffer[] = [];
        request.on("data", (chunk: Buffer) => chunks.push(chunk));
        request.on("end", () => resolve(Buffer.concat(chunks)));
        request.on("error", reject);
    });
}

function escapeXml(value: string): string {
    return value
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&apos;");
}

function writeXml(response: ServerResponse, statusCode: number, xml: string): void {
    response.writeHead(statusCode, { "content-type": "application/xml" });
    response.end(xml);
}

function writeS3Error(response: ServerResponse, statusCode: number, code: string): void {
    writeXml(response, statusCode, `<Error><Code>${code}</Code></Error>`);
}

function parseS3Path(requestUrl: string): { bucket: string; key: string; searchParams: URLSearchParams } {
    const url = new URL(requestUrl, "http://localhost");
    const [, bucket = "", ...keyParts] = url.pathname.split("/");
    return {
        bucket: decodeURIComponent(bucket),
        key: keyParts.map(part => decodeURIComponent(part)).join("/"),
        searchParams: url.searchParams,
    };
}

function listObjectsXml(objects: Map<string, Buffer>, prefix: string, delimiter: string | null): string {
    const files: string[] = [];
    const folders = new Set<string>();

    for (const key of objects.keys()) {
        if (!key.startsWith(prefix)) continue;
        if (key === prefix) continue;

        const rest = key.slice(prefix.length);
        const delimiterIndex = delimiter ? rest.indexOf(delimiter) : -1;
        if (delimiter && delimiterIndex !== -1) {
            folders.add(prefix + rest.slice(0, delimiterIndex + delimiter.length));
        } else {
            files.push(key);
        }
    }

    return [
        `<?xml version="1.0" encoding="UTF-8"?>`,
        `<ListBucketResult xmlns="http://s3.amazonaws.com/doc/2006-03-01/">`,
        `<Name>${escapeXml(BUCKET)}</Name>`,
        `<Prefix>${escapeXml(prefix)}</Prefix>`,
        `<Delimiter>${escapeXml(delimiter ?? "")}</Delimiter>`,
        ...files.map(key => `<Contents><Key>${escapeXml(key)}</Key></Contents>`),
        ...Array.from(folders).map(prefix => `<CommonPrefixes><Prefix>${escapeXml(prefix)}</Prefix></CommonPrefixes>`),
        `</ListBucketResult>`,
    ].join("");
}

async function createS3MockServer(): Promise<{ server: Server; endpoint: string }> {
    const objects = new Map<string, Buffer>();

    const server = createServer(async (request, response) => {
        try {
            const { bucket, key, searchParams } = parseS3Path(request.url ?? "/");
            if (bucket !== BUCKET) {
                writeS3Error(response, 404, "NoSuchBucket");
                return;
            }

            if (request.method === "PUT") {
                objects.set(key, await readRequestBody(request));
                response.writeHead(200);
                response.end();
                return;
            }

            if (request.method === "GET" && searchParams.get("list-type") === "2") {
                writeXml(response, 200, listObjectsXml(
                    objects,
                    searchParams.get("prefix") ?? "",
                    searchParams.get("delimiter"),
                ));
                return;
            }

            if (request.method === "GET") {
                const object = objects.get(key);
                if (!object) {
                    writeS3Error(response, 404, "NoSuchKey");
                    return;
                }
                response.writeHead(200, { "content-type": "application/octet-stream" });
                response.end(object);
                return;
            }

            if (request.method === "DELETE") {
                objects.delete(key);
                response.writeHead(204);
                response.end();
                return;
            }

            writeS3Error(response, 405, "MethodNotAllowed");
        } catch (error) {
            response.writeHead(500, { "content-type": "text/plain" });
            response.end(String(error));
        }
    });

    await new Promise<void>((resolve) => server.listen(0, "127.0.0.1", resolve));
    const address = server.address() as AddressInfo;
    return {
        server,
        endpoint: `http://127.0.0.1:${address.port}`,
    };
}

function createTestConfig(endpoint: string): S3Config {
    return {
        endpoint,
        region: "us-east-1",
        bucket: BUCKET,
        accessKeyId: "test-access-key",
        secretAccessKey: "test-secret-key",
        forcePathStyle: true,
    };
}

describe("S3ObjectStorage backed by AWS SDK", () => {
    let server: Server | undefined;
    let endpoint = "";

    beforeEach(async () => {
        const mock = await createS3MockServer();
        server = mock.server;
        endpoint = mock.endpoint;
    });

    afterEach(async () => {
        if (!server) return;
        await new Promise<void>((resolve, reject) => {
            server!.close(error => error ? reject(error) : resolve());
        });
        server = undefined;
    });

    it("should put and get object data through an S3-compatible endpoint", async () => {
        const storage = createS3ObjectStorage(createTestConfig(endpoint));

        await storage.put("posts/1.json", streamFromString(`{"content":"hello"}`));
        const body = await storage.get("posts/1.json");
        const data = await new Response(body).arrayBuffer();

        expect(decoder.decode(data)).toBe(`{"content":"hello"}`);
    });

    it("should list direct files and child directories", async () => {
        const storage = createS3ObjectStorage(createTestConfig(endpoint));

        await storage.put("posts/root.json", streamFromString("root"));
        await storage.put("posts/2026/item.json", streamFromString("item"));
        await storage.put("posts/2026/04/item.json", streamFromString("nested"));
        await storage.put("media/image.png", streamFromString("image"));

        await expect(storage.list("posts")).rejects.toThrow('ObjectStorage.list prefix must end with "/"');
        await expect(storage.list("posts/")).resolves.toEqual([
            "posts/root.json",
            "posts/2026/",
        ]);
    });

    it("should delete object data from an S3-compatible endpoint", async () => {
        const storage = createS3ObjectStorage(createTestConfig(endpoint));

        await storage.put("posts/delete-me.json", streamFromString("temporary"));
        await storage.delete("posts/delete-me.json");

        await expect(storage.get("posts/delete-me.json")).rejects.toThrow();
    });
});
