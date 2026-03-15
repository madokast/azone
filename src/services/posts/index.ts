import StoragePostService from "./storage.service";
import PostService from "./service.interface";
import PrefixObjectStorage from "../object-storage/prefix.fs";

export type { Post, CreatePostDto } from "./schema";
export type { PostService };
export { StoragePostService }
export { PrefixObjectStorage };


// The following exports are for testing purposes only
export { createRandomPosts } from "./utils";
