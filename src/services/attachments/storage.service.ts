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
