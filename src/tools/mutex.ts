
export default class Mutex {
  private lock = Promise.resolve();

  async withLock<T>(fn: () => Promise<T>): Promise<T> {
    const unlock = this.lock;
    let resolver!: (value: void | PromiseLike<void>) => void;
    this.lock = new Promise(res => { resolver = res });
    return unlock.then(() => fn()).finally(() => resolver());
  }
}
