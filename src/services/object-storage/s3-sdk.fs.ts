import { ObjectStorage } from "./interface";
import { mustEndWithSlash } from "./asserts";
import { S3Client, PutObjectCommand, GetObjectCommand, ListObjectsV2Command, DeleteObjectCommand } from "@aws-sdk/client-s3";

export interface S3Config {
    endpoint?: string;
    region: string;
    bucket: string;
    accessKeyId: string;
    secretAccessKey: string;
    forcePathStyle: boolean;
}


export class S3ObjectStorage implements ObjectStorage {

    private client: S3Client;

    constructor(private config: S3Config) {
        this.client = new S3Client({
            region: this.config.region,
            endpoint: this.config.endpoint,
            forcePathStyle: this.config.forcePathStyle,
            credentials: {
                accessKeyId: this.config.accessKeyId,
                secretAccessKey: this.config.secretAccessKey,
            },
        });
    }

    public async get(path: string): Promise<ReadableStream<Uint8Array<ArrayBuffer>>> {
        const r = await this.client.send(new GetObjectCommand({ Bucket: this.config.bucket, Key: path }));
        return r.Body as ReadableStream<Uint8Array<ArrayBuffer>>;
    }

    public async put(path: string, data: ReadableStream<Uint8Array<ArrayBuffer>>): Promise<void> {
        await this.client.send(new PutObjectCommand({
            Bucket: this.config.bucket,
            Key: path,
            Body: await new Response(data).arrayBuffer(),
        }));
    }

    public async delete(path: string): Promise<void> {
        await this.client.send(new DeleteObjectCommand({
            Bucket: this.config.bucket,
            Key: path,
        }));
    }

    public async list(prefix: string): Promise<string[]> {
        mustEndWithSlash(prefix);
        const r = await this.client.send(new ListObjectsV2Command({
            Bucket: this.config.bucket,
            Prefix: prefix,
            Delimiter: "/"
        }));

        const paths: string[] = []

        const files: string[] = (r.Contents || [])
            .filter(obj => obj.Key && obj.Key !== prefix) // 排除目录本身
            .map(obj => obj.Key!);
        paths.push(...files);

        const folders: string[] = (r.CommonPrefixes || [])
            .filter(p => p.Prefix)
            .map(p => p.Prefix!);
        paths.push(...folders);

        return paths;
    }
}

export function createS3ObjectStorage(config: Partial<S3Config>): S3ObjectStorage {
    if (!config.region) {
        throw new Error("S3 region is required");
    }
    if (!config.bucket) {
        throw new Error("S3 bucket is required");
    }
    if (!config.accessKeyId) {
        throw new Error("S3 access key ID is required");
    }
    if (!config.secretAccessKey) {
        throw new Error("S3 secret access key is required");
    }
    config.forcePathStyle = config.forcePathStyle || false;
    return new S3ObjectStorage(config as S3Config);
}
