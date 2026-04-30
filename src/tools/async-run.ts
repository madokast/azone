// Run fire-and-forget work in a later macrotask.
// Errors are intentionally ignored because callers cannot observe the result.
export function asyncRun(task: () => void | Promise<void>): void {
  setTimeout(() => {
    Promise.resolve()
      .then(task)
      .catch(() => undefined);
  }, 0);
}
