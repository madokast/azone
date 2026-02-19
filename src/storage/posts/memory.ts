import type { Post, PostService, CreatePostData } from './index';

/**
 * In-memory implementation of PostService for testing purposes.
 * Uses an array to store posts in memory.
 */
export class MemoryPostService implements PostService {
  private posts: Post[] = [];

  /**
   * Creates a new post with the given post data.
   * @param postData The post data as a key-value pair object.
   * @returns A promise that resolves to the created post.
   */
  createPost(postData: CreatePostData): Promise<Post> {
    const newPost: Post = {
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      attachmentIds: null,
      ...postData,
    };

    this.posts.push(newPost);
    return Promise.resolve(newPost);
  }

  /**
   * Deletes a post by its ID.
   * @param id The ID of the post to delete.
   * @returns A promise that resolves to true if the post was deleted successfully, false otherwise.
   */
  deletePost(id: string): Promise<boolean> {
    const initialLength = this.posts.length;
    this.posts = this.posts.filter(post => post.id !== id);
    return Promise.resolve(this.posts.length < initialLength);
  }

  /**
   * Retrieves a post by its ID.
   * @param id The ID of the post to retrieve.
   * @returns A promise that resolves to the post if found, null otherwise.
   */
  getPost(id: string): Promise<Post | null> {
    const post = this.posts.find(post => post.id === id);
    return Promise.resolve(post || null);
  }

  /**
   * Retrieves all posts.
   * @returns A promise that resolves to an array of all posts.
   */
  getAllPosts(): Promise<Post[]> {
    return Promise.resolve([...this.posts]);
  }

  /**
   * Retrieves posts with optional pagination.
   * @param page The page number (1-based).
   * @param pageSize The number of posts per page.
   * @returns A promise that resolves to an array of posts for the specified page.
   */
  getPosts(page: number, pageSize: number): Promise<Post[]> {
    const startIndex = (page - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    return Promise.resolve(this.posts.slice(startIndex, endIndex));
  }

  /**
   * Gets the total count of posts.
   * @returns A promise that resolves to the total number of posts.
   */
  getPostCount(): Promise<number> {
    return Promise.resolve(this.posts.length);
  }

  /**
   * Searches posts by keyword.
   * @param keyword The keyword to search for in post content.
   * @returns A promise that resolves to an array of matching posts.
   */
  searchPosts(keyword: string): Promise<Post[]> {
    if (!keyword.trim()) {
      return Promise.resolve([]);
    }

    const lowerKeyword = keyword.toLowerCase();
    return Promise.resolve(
      this.posts.filter(post => 
        post.content.toLowerCase().includes(lowerKeyword)
      )
    );
  }

  /**
   * Clears all posts from memory (for testing purposes).
   */
  clear(): void {
    this.posts = [];
  }

  /**
   * Gets the internal posts array (for testing purposes).
   */
  getInternalPosts(): Post[] {
    return [...this.posts];
  }
}

/**
 * Creates a new instance of MemoryPostService.
 * @returns A new instance of MemoryPostService.
 */
export function createMemoryPostService(): PostService {
  return new MemoryPostService();
}
