import { ListOptions, ObjectStorage } from "./interface";
import { S3Client, PutObjectCommand, GetObjectCommand, ListObjectsV2Command, DeleteObjectCommand } from "@aws-sdk/client-s3";

export interface S3Config {
    endpoint?: string;
    region: string;
    bucket: string;
    accessKeyId: string;
    secretAccessKey: string;
}


export class S3ObjectStorage implements ObjectStorage {

    private client: S3Client;

    constructor(private config: S3Config) {
        this.client = new S3Client({
            region: this.config.region,
            endpoint: this.config.endpoint,
            forcePathStyle: !!this.config.endpoint,
            credentials: {
                accessKeyId: this.config.accessKeyId,
                secretAccessKey: this.config.secretAccessKey,
            },
        });
    }

    public async get(path: string): Promise<ReadableStream<Uint8Array>> {
        const r = await this.client.send(new GetObjectCommand({ Bucket: this.config.bucket, Key: path }));
        return r.Body as ReadableStream<Uint8Array>;
    }

    public async put(path: string, data: ReadableStream<Uint8Array>): Promise<void> {
        await this.client.send(new PutObjectCommand({
            Bucket: this.config.bucket,
            Key: path,
            Body: data,
        }));
    }

    public async delete(path: string): Promise<void> {
        await this.client.send(new DeleteObjectCommand({
            Bucket: this.config.bucket,
            Key: path,
        }));
    }

    public async list(prefix: string, options?: ListOptions): Promise<string[]> {
        if (prefix && !prefix.endsWith("/")) prefix += "/";
        const r = await this.client.send(new ListObjectsV2Command({
            Bucket: this.config.bucket,
            Prefix: prefix,
            Delimiter: "/"
        }));

        const paths: string[] = []
        if (!options || options.file) {
            const files: string[] = (r.Contents || [])
                .filter(obj => obj.Key && obj.Key !== prefix) // 排除目录本身
                .map(obj => obj.Key!);
            paths.push(...files);
        }

        if (!options || options.directory) {
            const folders: string[] = (r.CommonPrefixes || [])
                .filter(p => p.Prefix)
                .map(p => p.Prefix!);
            paths.push(...folders);
        }

        return paths;
    }

}

export async function s3ConnectTest(config: Partial<S3Config>): Promise<void> {
    if (!config.region || !config.bucket || !config.accessKeyId || !config.secretAccessKey) {
        throw new Error("S3 config is incomplete");
    }
    const storage = new S3ObjectStorage(config as S3Config);
    await storage.list("");
}
