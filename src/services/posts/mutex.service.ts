import Mutex from "../../tools/mutex";
import { CreatePostDto, Post } from "./schema";
import PostService from "./service.interface";

export default class MutexPostService implements PostService {
    private readonly mutex = new Mutex();
    private readonly proxy: PostService;

    constructor(proxy: PostService) {
        this.proxy = proxy;
    }

    public async createPost(postData: CreatePostDto): Promise<void> {
        return this.mutex.withLock(() => this.proxy.createPost(postData));
    }

    public async deletePost(id: string): Promise<void> {
        return this.mutex.withLock(() => this.proxy.deletePost(id));
    }

    public async getLatestPosts(limit: number): Promise<Post[]> {
        return this.mutex.withLock(() => this.proxy.getLatestPosts(limit));
    }

    public async getPostsBefore(beforeId: string, limit: number): Promise<Post[]> {
        return this.mutex.withLock(() => this.proxy.getPostsBefore(beforeId, limit));
    }
}
