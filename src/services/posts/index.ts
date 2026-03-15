import StoragePostService from "./storage.service";
import PostService from "./service.interface";

export type { Post, CreatePostDto } from "./schema";
export type { PostService };

// Global singleton post service instance
export const PostServiceIns: PostService = new StoragePostService('/azone/posts');

// The following exports are for testing purposes only
export { createRandomPosts } from "./utils";
