import type { Post, PostService, CreatePostDto } from './index';
import { extractYYYYMMDD, generateId } from '../identifier';
import { formatDate } from './utils';

import { AttachmentServiceIns } from '../attachments';
import { ObjectStorageIns } from '../object-storage';
import { ObjectStorage } from '../object-storage/interface';

export default class StoragePostService implements PostService {
    private readonly rootDir: string;
    private objectStorage: ObjectStorage;
    private posts: Post[] = [];

    constructor(rootDir: string, objectStorage: ObjectStorage|null = null) {
        this.rootDir = rootDir;
        this.objectStorage = objectStorage || ObjectStorageIns;
    }

    // 从 post.id 中获取 post 所在的文件路径
    public getPath(id: string): string {
        const { yyyy, mm, dd } = extractYYYYMMDD(id);
        return `${this.rootDir}/${yyyy}/${mm}/${dd}/${id}.dat`;
    }

    public async createPost(postData: CreatePostDto, now: Date | null = null): Promise<void> {
        const attachments = await Promise.all(
            (postData.attachments || []).map(
                attachment => AttachmentServiceIns.uploadAttachment(attachment))
        );

        now = now || new Date();
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
        
        // 将新帖子添加到数组开头，确保getPosts返回最新的帖子
        this.posts.unshift(newPost);
    }

    public async deletePost(id: string): Promise<void> {
        const path = this.getPath(id);
        await this.objectStorage.delete(path);

        this.posts = this.posts.filter(post => post.id !== id);
    }

    public async getPosts(page: number, pageSize: number): Promise<Post[]> {
        const startIndex = (page - 1) * pageSize;
        const endIndex = startIndex + pageSize;
        while (endIndex > this.posts.length) {
            const hasmore = await this.loadPosts(pageSize);
            if (!hasmore) {
                break;
            }
        }
        return Promise.resolve(this.posts.slice(startIndex, endIndex));
    }

    // 加载 posts，返回是否成功。即从 posts 最后一个的日期，加载更早的 num 个 posts
    public async loadPosts(num: number): Promise<boolean> {
        const date = await this.nextLoadPostDate();
        console.log(`nextLoadPostDate: ${date}`);
        if (date === null) return false;
        const oldestDate = await this.oldestDate();
        console.log(`oldestDate: ${oldestDate}`);
        if (oldestDate === null) return false;
        console.log(`date <= oldestDate: ${date <= oldestDate}`);


        const posts: Post[] = [];
        while (date >= oldestDate) {
            const year = date.getFullYear().toString();
            const month = (date.getMonth() + 1).toString().padStart(2, '0');
            const day = date.getDate().toString().padStart(2, '0');
            const dayDir = `${this.rootDir}/${year}/${month}/${day}`;
            const allPostPaths: string[] = await this.objectStorage.list(dayDir);
            allPostPaths.sort((a, b) => b.localeCompare(a)); // 按日期降序排序
            // console.log(`allPostPaths: ${allPostPaths} in ${dayDir}`);
            for (const postPath of allPostPaths) {
                const postData = await this.objectStorage.get(postPath);
                const postText = await new Response(postData).text();
                const post: Post = JSON.parse(postText);
                console.log(`push post: ${JSON.stringify(post)}`);
                posts.push(post);
            }
            if (posts.length >= num) break;
            // 前一天
            date.setDate(date.getDate() - 1);
        }
        if (posts.length == 0) return false;
        this.posts = this.posts.concat(posts);
        return true;
    }

    // 获取需要加载 post 时，搜索的日期
    private async nextLoadPostDate(): Promise<Date | null> {
        if (this.posts.length == 0) {
            // 找到最新的日期
            const allYearDirs: string[] = await this.objectStorage.list(this.rootDir);
            console.log(`allYearDirs: ${allYearDirs}`)
            if (allYearDirs.length == 0) return null;
            allYearDirs.sort((a, b) => a.localeCompare(b)); // 按年份升序排序
            while (allYearDirs.length > 0) {
                const yearDir = allYearDirs.pop()!; // 最新的年份
                const allMonthDirs: string[] = await this.objectStorage.list(yearDir);
                if (allMonthDirs.length == 0) continue;
                allMonthDirs.sort((a, b) => a.localeCompare(b)); // 按月份升序排序
                while (allMonthDirs.length > 0) {
                    const monthDir = allMonthDirs.pop()!; // 最新的月份
                    const allDayDirs: string[] = await this.objectStorage.list(monthDir);
                    if (allDayDirs.length == 0) continue;
                    allDayDirs.sort((a, b) => a.localeCompare(b)); // 按日期升序排序
                    let dayDir = allDayDirs.pop()!; // 最新的日期
                    if (dayDir.endsWith("/")) {
                        dayDir = dayDir.slice(0, -1);
                    }
                    const [yyyy, mm, dd] = dayDir.split("/").slice(-3);
                    return new Date(parseInt(yyyy), parseInt(mm) - 1, parseInt(dd));
                }
            }
            return null;
        } else {
            const lastPost = this.posts[this.posts.length - 1];
            console.log(`lastPost: ${lastPost}`)
            const { yyyy, mm, dd } = extractYYYYMMDD(lastPost.id);
            const date = new Date(parseInt(yyyy), parseInt(mm) - 1, parseInt(dd));
            date.setDate(date.getDate() - 1);
            return date;
        }
    }

    // 获取所有存储中 posts 最早的日期
    private async oldestDate(): Promise<Date | null> {
        const allYearDirs: string[] = await this.objectStorage.list(this.rootDir);
        console.log(`allYearDirs: ${allYearDirs}`)
        if (allYearDirs.length == 0) return null;
        allYearDirs.sort((a, b) => b.localeCompare(a)); // 按年份降序排序
        while (allYearDirs.length > 0) {
            const yearDir = allYearDirs.pop()!; // 最老的年份
            const allMonthDirs: string[] = await this.objectStorage.list(yearDir);
            console.log(`allMonthDirs: ${allMonthDirs}`)
            if (allMonthDirs.length == 0) continue;
            allMonthDirs.sort((a, b) => b.localeCompare(a)); // 按月份降序排序
            while (allMonthDirs.length > 0) {
                const monthDir = allMonthDirs.pop()!;
                const allDayDirs: string[] = await this.objectStorage.list(monthDir);
                console.log(`allDayDirs: ${allDayDirs}`)
                if (allDayDirs.length == 0) continue;
                allDayDirs.sort((a, b) => b.localeCompare(a)); // 按日期降序排序
                let dayDir = allDayDirs.pop()!;
                if (dayDir.endsWith("/")) {
                    dayDir = dayDir.slice(0, -1);
                }
                console.log(`dayDir: ${dayDir}`)
                const [yyyy, mm, dd] = dayDir.split("/").slice(-3);
                return new Date(parseInt(yyyy), parseInt(mm) - 1, parseInt(dd));
            }
        }
        return null;
    }
}
