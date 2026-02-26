import { createMemoryPostService } from "./memory.service";

export type { Post, CreatePostDto } from "./schema";
export type { PostService } from "./service.interface";

// Global singleton post service instance
export const PostServiceIns = createMemoryPostService();

// The following exports are for testing purposes only
export { createMemoryPostService } from "./memory.service";
export { createRandomPosts } from "./utils";
