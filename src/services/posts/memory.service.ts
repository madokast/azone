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

    const insertIndex = this.posts.findIndex((post) => post.id < newPost.id);
    if (insertIndex === -1) {
      this.posts.push(newPost);
    } else {
      this.posts.splice(insertIndex, 0, newPost);
    }
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
    // posts 已按 id 倒序维护，这里先用最简单的线性扫描，后续可以换二分。
    const result: Post[] = [];
    for (const post of this.posts) {
      if (post.id < beforeId) {
        result.push(post);
        if (result.length >= limit) break;
      }
    }
    return Promise.resolve(result);
  }
}

