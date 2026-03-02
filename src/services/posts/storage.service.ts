import type { Post, PostService, CreatePostDto } from './index';
import { generateId } from '../identifier';
import { formatDate } from './utils';

import { AttachmentServiceIns } from '../attachments';
import { ObjectStorageIns } from '../object-storage';

export class StoragePostService implements PostService {
    private readonly rootDir: string;
    private posts: Post[] = [];

    constructor(rootDir: string) {
        this.rootDir = rootDir;
    }

    private getPath(id: string):string  {
        // TODO yyyy/mm/dd/id.dat
        console.log(this.rootDir);
        console.log(id);
        throw new Error('Method not implemented.');
    }

    async createPost(postData: CreatePostDto): Promise<void> {
        const attachments = await Promise.all(
            (postData.attachments || []).map(
                attachment => AttachmentServiceIns.uploadAttachment(attachment))
        );

        const newPost: Post = {
            id: generateId(),
            createdAt: formatDate(new Date()),
            content: postData.content,
            attachments: attachments,
        };

        const path = this.getPath(newPost.id);
        await ObjectStorageIns.put(path, new ReadableStream({
            start(controller) {
                const encoder = new TextEncoder();
                controller.enqueue(encoder.encode(JSON.stringify(newPost)));
                controller.close();
            }
        }));
        this.posts.unshift(newPost);
    }

    async deletePost(id: string): Promise<void> {
        const path = this.getPath(id);
        await ObjectStorageIns.delete(path);

        this.posts = this.posts.filter(post => post.id !== id);
    }

    getPosts(page: number, pageSize: number): Promise<Post[]> {
        console.log(page, pageSize);
        throw new Error('Method not implemented.');
    }
}