import imageCompression from 'browser-image-compression';

const MAX_SIZE = 256 * 1024; // 256 KB

export default async function imageCompress(image: File) : Promise<File> {
    if (image.size <= MAX_SIZE) {
        return image;
    }

    return await imageCompression(image, {
        maxSizeMB: MAX_SIZE/1024/1024,
        maxWidthOrHeight: 1080,
        useWebWorker: true,
    });
}
