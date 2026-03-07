import CryptoWrapper from './crypto-wrapper';
import { describe, it, expect } from "vitest"

const crypto = new CryptoWrapper("azone");

describe("SimpleCrypto", () => {
    it("should encrypt and decrypt Uint8Array", async () => {
        const data = new Uint8Array([1, 2, 3]);
        const encrypted = await crypto.encryptUint8Array(data);
        const decrypted = await crypto.decryptUint8Array(encrypted);
        expect(decrypted).toEqual(data);
    })

    it("should encrypt and decrypt long Uint8Array", async () => {
        const now = Date.now();
        const longData = Uint8Array.from(
            { length: 5 * 1024 - 111 },
            (_, i) => i % 256
        );
        console.log(`create data ${Date.now() - now}ms`)
        const encrypted = await crypto.encryptUint8Array(longData);
        console.log(`encryptUint8Array ${Date.now() - now}ms`)
        const decrypted = await crypto.decryptUint8Array(encrypted);
        console.log(`decryptUint8Array ${Date.now() - now}ms`)
        expect(decrypted).toEqual(longData);
        console.log(`expect ${Date.now() - now}ms`)
    })

    it("should encrypt and decrypt string", async () => {
        const data = "hello world";
        const encrypted = await crypto.encryptString(data);
        const decrypted = await crypto.decryptString(encrypted);
        expect(decrypted).toEqual(data);
    })

    it("should encrypt and decrypt long string", async () => {
        const longData = "a".repeat(5 * 1024 + 123); // 5KB 数据
        const encrypted = await crypto.encryptString(longData);
        const decrypted = await crypto.decryptString(encrypted);
        expect(decrypted).toEqual(longData);
    })
})
