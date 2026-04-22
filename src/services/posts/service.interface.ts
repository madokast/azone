import type { Post, CreatePostDto } from './schema';

export default interface PostService {
  createPost(postData: CreatePostDto): Promise<void>;
  deletePost(id: string): Promise<void>;

  /**
   * Retrieves posts with optional pagination.
   * @param page The page number (1-based).
   * @param pageSize The number of posts per page.
   * @returns A promise that resolves to an array of posts for the specified page.
   * @deprecated 待 getLatestPosts / getPostsBefore 替换完成后移除。
   */
  getPosts(page: number, pageSize: number): Promise<Post[]>;

  /**
   * 加载最新的 limit 条帖子（用于首屏加载/刷新场景）。
   * 返回结果按 id 倒序，长度 <= limit。
   */
  getLatestPosts(limit: number): Promise<Post[]>;

  /**
   * 加载锚点 beforeId 之前的下一批帖子（用于滚动到底部加载更多）。
   * 返回结果按 id 倒序，严格满足 id < beforeId（不包含锚点本身）；
   * 长度 < limit 表示已经没有更多。
   */
  getPostsBefore(beforeId: string, limit: number): Promise<Post[]>;
}
