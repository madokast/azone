/**
 * 判断给定的 MIME 类型是否为图片类型
 * @param mimeType MIME 类型字符串
 * @returns 如果是图片类型返回 true，否则返回 false
 */
export function isImageMimeType(mimeType: string): boolean {
  return mimeType.startsWith('image/');
}

/**
 * 判断给定的 MIME 类型是否为视频类型
 * @param mimeType MIME 类型字符串
 * @returns 如果是视频类型返回 true，否则返回 false
 */
export function isVideoMimeType(mimeType: string): boolean {
  return mimeType.startsWith('video/');
}
