import type { Post, PostService, CreatePostDto } from './index';
import { generateId } from '../identifier';
import { formatDate } from './utils';
import { MemoryAttachmentService } from '../attachments/memory.service';


/**
 * In-memory implementation of PostService for testing purposes.
 * Uses an array to store posts in memory.
 */
export class MemoryPostService implements PostService {
  private posts: Post[] = [];
  private attachmentService = new MemoryAttachmentService();

  async createPost(postData: CreatePostDto): Promise<void> {

    const attachments = await Promise.all(
      (postData.attachments || []).map(attachment => this.attachmentService.uploadAttachment(attachment))
    );

    const newPost: Post = {
      id: generateId(),
      createdAt: formatDate(new Date()),
      content: postData.content,
      attachments: attachments,
    };

    this.posts.unshift(newPost);
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
}

