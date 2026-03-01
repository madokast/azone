import { isImageMimeType, type Attachment, type AttachmentService } from './index';
import { generateId } from '../utils';
import { unknowFileIcon } from '../../assets';
import { ObjectStorageIns } from '../object-storage';
import { Attachments, MetaAttachment } from './schema';


export class StorageAttachmentService implements AttachmentService {
    private readonly rootDir: string;
    private cache = new Map<string, Attachment>();

    constructor(rootDir: string) {
        this.rootDir = rootDir;
    }

    private getPath(id: string) {
        return `${this.rootDir}/${id}.dat`;
    }

    async getAttachment(meta: MetaAttachment): Promise<Attachment> {
        if (this.cache.has(meta.id)) return this.cache.get(meta.id)!;

        const path = this.getPath(meta.id);
        const stream = await ObjectStorageIns.get(path);
        const blob = await new Response(stream).blob();
        const sourceUrl = URL.createObjectURL(blob);
        const thumbnailUrl = isImageMimeType(meta.mimeType) ? sourceUrl : unknowFileIcon;
        return {
            ...meta,
            sourceUrl,
            thumbnailUrl,
        }
    }

    getAttachments(metas: MetaAttachment[]): Promise<Attachment[]> {
        return Promise.all(metas.map(m => this.getAttachment(m)));
    }

    async deleteAttachment(id: string): Promise<void> {
        if (this.cache.has(id)) {
            const attachment = this.cache.get(id)!;
            Attachments.dispose(attachment);
            this.cache.delete(id);
        }
        const path = this.getPath(id);
        await ObjectStorageIns.delete(path);
    }

    async uploadAttachment(attachment: Omit<Attachment, 'id'>): Promise<MetaAttachment> {
        const id = generateId();
        const path = this.getPath(id);
        const stream = await fetch(attachment.sourceUrl).then(res => res.body!);
        await ObjectStorageIns.put(path, stream);
        return {
            ...attachment,
            id,
        }
    }
}
