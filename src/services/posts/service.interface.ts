import type { Post, CreatePostDto } from './schema';

export default interface PostService {
  createPost(postData: CreatePostDto): Promise<void>;
  deletePost(id: string): Promise<void>;

  /**
   * Retrieves posts with optional pagination.
   * @param page The page number (1-based).
   * @param pageSize The number of posts per page.
   * @returns A promise that resolves to an array of posts for the specified page.
   */
  getPosts(page: number, pageSize: number): Promise<Post[]>;
}
