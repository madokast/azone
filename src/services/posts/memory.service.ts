import type { Post, PostService, CreatePostDto } from './index';
import { generateId } from '../identifier';
import { formatDate } from './utils';
import { MemoryAttachmentService } from '../attachments/memory.service';
import type { AttachmentService } from '../attachments';

type Clock = () => Date;

/**
 * In-memory implementation of PostService for testing purposes.
 * Uses an array to store posts in memory.
 */
export class MemoryPostService implements PostService {
  private posts: Post[] = [];
  private attachmentService: AttachmentService;
  // 通过注入时钟让测试可以稳定控制 createPost 使用的时间。
  private readonly nowDateProvider: Clock;

  constructor(
    nowDateProvider: Clock = () => new Date(),
    attachmentService: AttachmentService = new MemoryAttachmentService(),
  ) {
    this.nowDateProvider = nowDateProvider;
    this.attachmentService = attachmentService;
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

  getLatestPosts(limit: number): Promise<Post[]> {
    return Promise.resolve(this.posts.slice(0, limit));
  }

  getPostsBefore(beforeId: string, limit: number): Promise<Post[]> {
    const startIndex = this.findFirstIndexBefore(beforeId);
    return Promise.resolve(this.posts.slice(startIndex, startIndex + limit));
  }

  // 返回第一个满足 post.id < id 的下标；若不存在则返回 posts.length。
  // 利用 posts 已按 id 倒序的不变量，使用二分查找在 [0, posts.length] 内定位。
  // 不变式：循环结束时 lo === hi，且
  //   - 所有 i < lo  → posts[i].id >= id
  //   - 所有 i >= lo → posts[i].id <  id
  private findFirstIndexBefore(id: string): number {
    let lo = 0;
    let hi = this.posts.length;
    while (lo < hi) {
      const mid = (lo + hi) >> 1;
      if (this.posts[mid].id < id) {
        hi = mid;
      } else {
        lo = mid + 1;
      }
    }
    return lo;
  }
}

