import { isImageMimeType, type Attachment, type AttachmentService } from './index';
import { generateId } from '../identifier';
import { unknowFileIcon } from '../../assets';
import { MetaAttachment } from './schema';
import { ObjectStorage } from '../object-storage/interface';


export class StorageAttachmentService implements AttachmentService {
    private readonly rootDir: string;
    private readonly objectStorage: ObjectStorage;

    constructor(rootDir: string, objectStorage: ObjectStorage) {
        this.rootDir = rootDir;
        this.objectStorage = objectStorage;
    }

    private getPath(id: string) {
        return `${this.rootDir}/${id}.dat`;
    }

    /**
     * 从持久化存储读取数据并创建新的 blob URL，所有权转交给调用方。
     * 调用方使用完毕后须调用 Attachments.dispose(attachment) 释放，
     * 本服务不缓存返回的 URL，无法代为管理其生命周期。
     */
    async getAttachment(meta: MetaAttachment): Promise<Attachment> {
        const path = this.getPath(meta.id);
        const stream = await this.objectStorage.get(path);
        const blob = await new Response(stream).blob();
        const sourceUrl = URL.createObjectURL(blob);
        const thumbnailUrl = isImageMimeType(meta.mimeType) ? sourceUrl : unknowFileIcon;
        return {
            ...meta,
            sourceUrl,
            thumbnailUrl,
        }
    }

    async getAttachments(metas: MetaAttachment[]): Promise<Attachment[]> {
        return Promise.all(metas.map(m => this.getAttachment(m)));
    }

    async deleteAttachment(id: string): Promise<void> {
        const path = this.getPath(id);
        await this.objectStorage.delete(path);
    }

    /**
     * 读取 sourceUrl 内容写入持久化存储，不持有也不释放传入的 blob URL。
     * sourceUrl 的所有权归调用方，上传完成后由调用方自行 revoke。
     */
    async uploadAttachment(attachment: Omit<Attachment, 'id'>): Promise<MetaAttachment> {
        const id = generateId();
        const path = this.getPath(id);
        const stream = await fetch(attachment.sourceUrl).then(res => res.body!);
        await this.objectStorage.put(path, stream);
        return {
            id,
            mimeType: attachment.mimeType,
        }
    }
}
