import { afterEach, describe, expect, it, vi } from "vitest";
import { asyncRun } from "./async-run";

describe("asyncRun", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it("should run the task in a later macrotask", async () => {
    vi.useFakeTimers();
    const events: string[] = [];

    asyncRun(() => {
      events.push("task");
    });
    events.push("after-call");

    expect(events).toEqual(["after-call"]);

    await vi.runAllTimersAsync();
    expect(events).toEqual(["after-call", "task"]);
  });

  it("should ignore sync and async errors", async () => {
    vi.useFakeTimers();
    const events: string[] = [];

    asyncRun(() => {
      throw new Error("sync error");
    });
    asyncRun(async () => {
      throw new Error("async error");
    });
    asyncRun(() => {
      events.push("after-errors");
    });

    await vi.runAllTimersAsync();
    expect(events).toEqual(["after-errors"]);
  });
});
