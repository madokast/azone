import type { Post, PostService, CreatePostDto } from './index';
import { generateId } from '../identifier';
import { formatDate } from './utils';
import { MemoryAttachmentService } from '../attachments/memory.service';

type Clock = () => Date;

/**
 * In-memory implementation of PostService for testing purposes.
 * Uses an array to store posts in memory.
 */
export class MemoryPostService implements PostService {
  private posts: Post[] = [];
  private attachmentService = new MemoryAttachmentService();
  // 通过注入时钟让测试可以稳定控制 createPost 使用的时间。
  private readonly nowDateProvider: Clock;

  constructor(nowDateProvider: Clock = () => new Date()) {
    this.nowDateProvider = nowDateProvider;
  }

  async createPost(postData: CreatePostDto): Promise<void> {

    const attachments = await Promise.all(
      (postData.attachments || []).map(attachment => this.attachmentService.uploadAttachment(attachment))
    );

    const now = this.nowDateProvider();
    const newPost: Post = {
      id: generateId(now),
      createdAt: formatDate(now),
      content: postData.content,
      attachments: attachments,
    };

    const insertIndex = this.findFirstIndexBefore(newPost.id);
    this.posts.splice(insertIndex, 0, newPost);
    return Promise.resolve();
  }

  deletePost(id: string): Promise<void> {
    this.posts = this.posts.filter(post => post.id !== id);
    return Promise.resolve();
  }

  getPosts(page: number, pageSize: number): Promise<Post[]> {
    const startIndex = (page - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    return Promise.resolve(this.posts.slice(startIndex, endIndex));
  }

  getLatestPosts(limit: number): Promise<Post[]> {
    return Promise.resolve(this.posts.slice(0, limit));
  }

  getPostsBefore(beforeId: string, limit: number): Promise<Post[]> {
    const startIndex = this.findFirstIndexBefore(beforeId);
    return Promise.resolve(this.posts.slice(startIndex, startIndex + limit));
  }

  // 返回第一个满足 post.id < id 的下标；若不存在则返回 posts.length。
  // 当前实现是线性扫描，后续可在这里统一替换为二分搜索。
  private findFirstIndexBefore(id: string): number {
    const index = this.posts.findIndex((post) => post.id < id);
    return index === -1 ? this.posts.length : index;
  }
}

