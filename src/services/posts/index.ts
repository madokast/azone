import { MemoryPostService } from "./memory.service";
import { PostService } from "./service.interface";

export type { Post, CreatePostDto } from "./schema";
export type { PostService } from "./service.interface";

// Global singleton post service instance
export const PostServiceIns: PostService = new MemoryPostService();

// The following exports are for testing purposes only
export { createRandomPosts } from "./utils";
