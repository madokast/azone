export type { Post } from "./schema";
export type { PostService, CreatePostData } from "./service";

// The following exports are for testing purposes only
export { createMemoryPostService } from "./memory";
export { createRandomPosts } from "./utils";
