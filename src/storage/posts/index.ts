import { createMemoryPostService } from "./memory";

export type { Post } from "./schema";
export type { PostService, CreatePostData } from "./service";

// Global singleton post service instance
export const PostServiceIns = createMemoryPostService();

// The following exports are for testing purposes only
export { createMemoryPostService } from "./memory";
export { createRandomPosts } from "./utils";
