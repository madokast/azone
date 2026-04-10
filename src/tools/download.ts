/**
 * 触发浏览器下载文件
 * @param fileName 下载的文件名
 * @param blob 文件内容的Blob对象
 */
export function downloadBlob(fileName: string, blob: Blob): void {
    // 创建隐藏的可下载链接
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.href = url;
    link.download = fileName;
    // 触发点击下载
    document.body.appendChild(link);
    link.click();
    // 清理
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}

export function downloadJson(fileName: string, data: any): void {
    const blob = new Blob([JSON.stringify(data)], { type: 'application/json' });
    downloadBlob(fileName, blob);
}

