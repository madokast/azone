import type { Post, CreatePostData } from './schema';

/**
 * Post service interface for CRUD operations on posts.
 * This interface defines the contract for post management functionality.
 */
export interface PostService {
  /**
   * Creates a new post with the given post data.
   * @param postData The post data as a key-value pair object.
   * @returns A promise that resolves to the created post.
   */
  createPost(postData: CreatePostData): Promise<Post>;

  /**
   * Deletes a post by its ID.
   * @param id The ID of the post to delete.
   * @returns A promise that resolves to true if the post was deleted successfully, false otherwise.
   */
  deletePost(id: string): Promise<boolean>;

  /**
   * Retrieves a post by its ID.
   * @param id The ID of the post to retrieve.
   * @returns A promise that resolves to the post if found, null otherwise.
   */
  getPost(id: string): Promise<Post | null>;

  /**
   * Retrieves all posts.
   * @returns A promise that resolves to an array of all posts.
   */
  getAllPosts(): Promise<Post[]>;

  /**
   * Retrieves posts with optional pagination.
   * @param page The page number (1-based).
   * @param pageSize The number of posts per page.
   * @returns A promise that resolves to an array of posts for the specified page.
   */
  getPosts(page: number, pageSize: number): Promise<Post[]>;

  /**
   * Gets the total count of posts.
   * @returns A promise that resolves to the total number of posts.
   */
  getPostCount(): Promise<number>;

  /**
   * Searches posts by keyword.
   * @param keyword The keyword to search for in post content.
   * @returns A promise that resolves to an array of matching posts.
   */
  searchPosts(keyword: string): Promise<Post[]>;
}
