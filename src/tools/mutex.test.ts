import { describe, it, expect } from "vitest";
import Mutex from "./mutex";

// 小工具：返回 [Promise, resolve, reject]，用来精细控制 fn 何时完成。
function deferred<T>(): {
  promise: Promise<T>,
  resolve: (value: T) => void,
  reject: (reason?: unknown) => void
} {
  let resolve!: (value: T) => void;
  let reject!: (reason?: unknown) => void;
  const promise = new Promise<T>((res, rej) => { resolve = res; reject = rej });
  return { promise, resolve, reject };
}

// 让 Node 事件循环走完当前轮次的所有微任务（promise then/finally 链）。
// 比连续 await Promise.resolve() 更可靠，能等到锁切换到下一个等待者。
function flushMicrotasks(): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, 0));
}

describe("Mutex.withLock", () => {
  it("should return the value produced by fn", async () => {
    const mutex = new Mutex();
    const value = await mutex.withLock(async () => 42);
    expect(value).toBe(42);
  })

  it("should propagate fn's error to the caller", async () => {
    const mutex = new Mutex();
    await expect(
      mutex.withLock(async () => { throw new Error("boom") })
    ).rejects.toThrow("boom");
  })

  it("should run concurrent calls one at a time (mutual exclusion)", async () => {
    const mutex = new Mutex();
    const events: string[] = [];

    // 用 deferred 控制 fn 退出时机，确保第二个并发调用确实在等第一个完成。
    const a = deferred<void>();
    const b = deferred<void>();

    const taskA = mutex.withLock(async () => {
      events.push("enter-A");
      await a.promise;
      events.push("exit-A");
    });

    const taskB = mutex.withLock(async () => {
      events.push("enter-B");
      await b.promise;
      events.push("exit-B");
    });

    // 给事件循环一点时间执行；如果有交错，B 会马上 enter
    await flushMicrotasks();
    expect(events).toEqual(["enter-A"]);

    a.resolve();
    await flushMicrotasks();
    expect(events).toEqual(["enter-A", "exit-A", "enter-B"]);

    b.resolve();
    await Promise.all([taskA, taskB]);
    expect(events).toEqual(["enter-A", "exit-A", "enter-B", "exit-B"]);
  })

  it("should preserve FIFO order across multiple callers", async () => {
    const mutex = new Mutex();
    const order: number[] = [];

    await Promise.all([1, 2, 3, 4].map(n => mutex.withLock(async () => {
      // 加一个微小延时，确保即使有调度差异也不会"碰巧"按顺序
      await new Promise(r => setTimeout(r, 5));
      order.push(n);
    })));

    expect(order).toEqual([1, 2, 3, 4]);
  })

  it("should release the lock even when fn throws", async () => {
    const mutex = new Mutex();

    await expect(
      mutex.withLock(async () => { throw new Error("boom") })
    ).rejects.toThrow("boom");

    // 如果锁泄漏，下面这次 withLock 永远等不到，测试会超时失败。
    const value = await mutex.withLock(async () => "ok");
    expect(value).toBe("ok");
  })
})
