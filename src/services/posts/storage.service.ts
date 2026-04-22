import type { Post, PostService, CreatePostDto } from './index';
import { extractYYYYMMDD, generateId } from '../identifier';
import { formatDate } from './utils';
import { ObjectStorage } from '../object-storage/interface';
import { AttachmentService } from '../attachments';

// 统一时间来源的类型，便于在生产环境用真实时间、在测试中注入可控时间。
export type Clock = () => Date;

export default class StoragePostService implements PostService {
    private readonly rootDir: string;
    // 通过注入时钟替代直接 new Date()，避免业务接口夹带测试参数。
    private readonly nowDateProvider: Clock;
    private objectStorage: ObjectStorage;
    private attachmentService: AttachmentService;

    constructor(
        rootDir: string, // 根目录，不要末尾 / 分隔符
        objectStorage: ObjectStorage,
        attachmentService: AttachmentService,
        nowDateProvider: Clock = () => new Date(),
    ) {
        this.rootDir = rootDir;
        this.objectStorage = objectStorage;
        this.attachmentService = attachmentService;
        this.nowDateProvider = nowDateProvider;
    }

    // 从 post.id 中获取 post 所在的文件路径
    public getPath(id: string): string {
        const { yyyy, mm, dd } = extractYYYYMMDD(id);
        return `${this.rootDir}/${yyyy}/${mm}/${dd}/${id}.dat`;
    }

    public async createPost(postData: CreatePostDto): Promise<void> {
        const attachments = await Promise.all(
            (postData.attachments || []).map(
                attachment => this.attachmentService.uploadAttachment(attachment))
        );

        // 所有创建时间都从注入时钟读取，确保行为可预测、可测试。
        const now = this.nowDateProvider();
        const newPost: Post = {
            id: generateId(now),
            createdAt: formatDate(now),
            content: postData.content,
            attachments: attachments,
        };

        const path = this.getPath(newPost.id);
        await this.objectStorage.put(path, new ReadableStream({
            start(controller) {
                const encoder = new TextEncoder();
                controller.enqueue(encoder.encode(JSON.stringify(newPost)));
                controller.close();
            }
        }));
    }

    public async deletePost(id: string): Promise<void> {
        const path = this.getPath(id);
        await this.objectStorage.delete(path);
    }

    // 直接从 ObjectStorage 按 yyyy/mm/dd 倒序遍历，凑够 limit 条立即返回。
    // 底层 IndexDBObjectStorage 已经做了 list/get 的缓存，所以这里没必要再在
    // service 层维护一份完整数组。
    public async getLatestPosts(limit: number): Promise<Post[]> {
        const result: Post[] = [];
        const yearDirs = await this.objectStorage.list(this.rootDir + "/");
        yearDirs.sort((a, b) => b.localeCompare(a)); // 年份降序
        for (const yearDir of yearDirs) {
            const monthDirs = await this.objectStorage.list(yearDir);
            monthDirs.sort((a, b) => b.localeCompare(a)); // 月份降序
            for (const monthDir of monthDirs) {
                const dayDirs = await this.objectStorage.list(monthDir);
                dayDirs.sort((a, b) => b.localeCompare(a)); // 日期降序
                for (const dayDir of dayDirs) {
                    const dir = dayDir.endsWith("/") ? dayDir : dayDir + "/";
                    const postPaths = await this.objectStorage.list(dir);
                    postPaths.sort((a, b) => b.localeCompare(a)); // post id 降序
                    for (const postPath of postPaths) {
                        const post = await this.loadPost(postPath);
                        result.push(post);
                        if (result.length >= limit) return result;
                    }
                }
            }
        }
        return result;
    }

    // 与 getLatestPosts 同样按 yyyy/mm/dd 倒序遍历，只是多了一道筛选：
    // 仅收集 id < beforeId 的帖子，并在凑齐 limit 条时立即返回。
    // 当前先用最朴素的遍历，后续可按 id 前缀剪枝整段日/月/年目录来优化。
    public async getPostsBefore(beforeId: string, limit: number): Promise<Post[]> {
        const result: Post[] = [];
        const yearDirs = await this.objectStorage.list(this.rootDir + "/");
        yearDirs.sort((a, b) => b.localeCompare(a)); // 年份降序
        for (const yearDir of yearDirs) {
            const monthDirs = await this.objectStorage.list(yearDir);
            monthDirs.sort((a, b) => b.localeCompare(a)); // 月份降序
            for (const monthDir of monthDirs) {
                const dayDirs = await this.objectStorage.list(monthDir);
                dayDirs.sort((a, b) => b.localeCompare(a)); // 日期降序
                for (const dayDir of dayDirs) {
                    const dir = dayDir.endsWith("/") ? dayDir : dayDir + "/";
                    const postPaths = await this.objectStorage.list(dir);
                    postPaths.sort((a, b) => b.localeCompare(a)); // post id 降序
                    for (const postPath of postPaths) {
                        const post = await this.loadPost(postPath);
                        if (post.id < beforeId) {
                            result.push(post);
                            if (result.length >= limit) return result;
                        }
                    }
                }
            }
        }
        return result;
    }

    private async loadPost(postPath: string): Promise<Post> {
        const postData = await this.objectStorage.get(postPath);
        const postText = await new Response(postData).text();
        const post: Post = JSON.parse(postText);
        return post;
    }
}
