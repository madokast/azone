// 强制约定：传给 ObjectStorage.list 的 prefix 必须以 "/" 结尾。
// 目的：
//   1. 统一各实现/各调用点的目录写法，避免 IndexDB 等缓存层因 "foo" 与 "foo/" 而存两份；
//   2. 调用方违反约定时尽早抛错，避免静默匹配到非预期的兄弟前缀（如 "foo" 误匹 "foobar/..."）。
// 一次 endsWith 检查耗时纳秒级，远低于 list 自身 IO 开销，无需 gate。
export function mustEndWithSlash(prefix: string): void {
    if (!prefix.endsWith("/")) {
        throw new Error(
            `ObjectStorage.list prefix must end with "/", got: ${JSON.stringify(prefix)}`
        );
    }
}
