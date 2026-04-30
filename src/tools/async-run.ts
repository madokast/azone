export function asyncRun(task: () => void | Promise<void>): void {
  setTimeout(() => {
    Promise.resolve()
      .then(task)
      .catch(() => undefined);
  }, 0);
}
