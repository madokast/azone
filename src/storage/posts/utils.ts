import type { PostService } from './index';
import { generateId } from '../utils';

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
    let attachmentIds: string[] | null = null;
    if (Math.random() < attachmentRate) {
      const attachmentCount = Math.floor(Math.random() * maxAttachmentNumber) + 1;
      attachmentIds = [];
      for (let j = 0; j < attachmentCount; j++) {
        attachmentIds.push(generateId());
      }
    }
    
    // Create post using the provided PostService
    await postService.createPost({ 
      content: randomContent,
      attachmentIds 
    });
  }
}
