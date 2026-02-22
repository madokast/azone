/**
 * 判断给定的 MIME 类型是否为图片类型
 * @param mimeType MIME 类型字符串
 * @returns 如果是图片类型返回 true，否则返回 false
 */
export function isImageMimeType(mimeType: string): boolean {
  return mimeType.startsWith('image/');
}

/**
 * 获取常见的图片 MIME 类型列表
 * @returns 常见图片 MIME 类型数组
 */
export function getImageMimeTypes(): string[] {
  return [
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
    'image/bmp',
    'image/svg+xml'
  ];
}
