import { describe, expect, it } from "vitest";
import { ZipBuilder, unzipFiles } from "./zip";

const decoder = new TextDecoder();

describe("ZipBuilder", () => {
  it("should generate a zip that can be unzipped back to files", async () => {
    const zip = new ZipBuilder();

    zip.add("1.txt", "hello");
    zip.add("folder/2.txt", new TextEncoder().encode("world"));

    const data = await zip.generate();
    const files = await unzipFiles(data);

    expect(data).toBeInstanceOf(Uint8Array);
    expect(files.map(file => file.path).sort()).toEqual(["1.txt", "folder/2.txt"]);
    expect(decoder.decode(files.find(file => file.path === "1.txt")!.data)).toBe("hello");
    expect(decoder.decode(files.find(file => file.path === "folder/2.txt")!.data)).toBe("world");
  });

  it("should reject unsafe zip paths", () => {
    const zip = new ZipBuilder();

    expect(() => zip.add("/absolute.txt", "nope")).toThrow("Unsafe zip path");
    expect(() => zip.add("../outside.txt", "nope")).toThrow("Unsafe zip path");
    expect(() => zip.add("folder/../../outside.txt", "nope")).toThrow("Unsafe zip path");
  });

  it("should reject adding files after generate", async () => {
    const zip = new ZipBuilder();
    zip.add("1.txt", "hello");

    await zip.generate();

    expect(() => zip.add("2.txt", "world")).toThrow("Cannot add files after generate");
  });
});
