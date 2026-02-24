import type { PostService } from './index';
import { Attachment } from '../attachments';

/**
 * Generates a random string of specified length.
 * @param length The length of the random string to generate.
 * @returns A random string containing letters, numbers, and symbols.
 */
function generateRandomString(length: number): string {
  const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789 !@#$%^&*()_+-=[]{}|;:,.<>?';
  let result = '';
  const charsetLength = charset.length;

  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * charsetLength);
    result += charset[randomIndex];
  }

  return result;
}

/**
 * Creates random posts using the provided PostService.
 * @param postService The PostService instance to use for creating posts.
 * @param number The number of random posts to create.
 * @param maxContentSize The maximum length of content for each post (default: 256).
 * @param attachmentRate The probability of a post having attachments (default: 0.5).
 * @param maxAttachmentNumber The maximum number of attachments per post (default: 9).
 * @returns A promise that resolves when all posts are created.
 */
export async function createRandomPosts(
  postService: PostService,
  number: number,
  maxContentSize: number = 256,
  attachmentRate: number = 0.5,
  maxAttachmentNumber: number = 9
): Promise<void> {
  for (let i = 0; i < number; i++) {
    // Generate random content length between 1 and maxContentSize
    const contentLength = Math.floor(Math.random() * maxContentSize) + 1;
    const randomContent = generateRandomString(contentLength);

    // Generate attachment IDs if needed
    let attachments: Omit<Attachment, 'id'>[] | null = null;
    if (Math.random() < attachmentRate) {
      const attachmentCount = Math.floor(Math.random() * maxAttachmentNumber) + 1;
      attachments = [];
      for (let j = 0; j < attachmentCount; j++) {
        // Generate random image attachment if not found
        const randomWidth = Math.floor(Math.random() * 601) + 600; // 600-1200
        const randomHeight = Math.floor(Math.random() * 601) + 600; // 600-1200

        const isVideo = Math.random() > 0.5;

        const randomAttachment: Omit<Attachment, 'id'> = {
          mimeType: isVideo ? 'video/mp4' : 'image/jpeg',
          thumbnailUrl: `https://picsum.photos/160/160?random=${i*maxAttachmentNumber+j}`,
          sourceUrl: isVideo ?
            "https://mdn.alipayobjects.com/huamei_iwk9zp/afts/file/A*uYT7SZwhJnUAAAAAAAAAAAAADgCCAQ" :
            `https://picsum.photos/${randomWidth}/${randomHeight}?random=${i*maxAttachmentNumber+j}`,
        };
        attachments.push(randomAttachment);
      }
    }

    // Create post using the provided PostService
    await postService.createPost({
      content: randomContent,
      attachments,
    });
  }
}


export function formatDate(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');

  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}