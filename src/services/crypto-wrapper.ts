export default class SimpleCrypto {
  private keyPromise: Promise<CryptoKey>;

  constructor(password: string) {
    this.keyPromise = this.deriveKey(password);
  }

  private async deriveKey(password: string): Promise<CryptoKey> {
    const enc = new TextEncoder();
    const salt = enc.encode("static-salt"); // 可换成随机盐存储
    const keyMaterial = await crypto.subtle.importKey(
      "raw",
      enc.encode(password),
      { name: "PBKDF2" },
      false,
      ["deriveKey"]
    );
    return crypto.subtle.deriveKey(
      {
        name: "PBKDF2",
        salt,
        iterations: 100000,
        hash: "SHA-256",
      },
      keyMaterial,
      { name: "AES-GCM", length: 256 },
      false,
      ["encrypt", "decrypt"]
    );
  }

  // 核心加密方法，输入和输出都是 ArrayBuffer
  private async encryptBuffer(data: ArrayBuffer): Promise<ArrayBuffer> {
    const key = await this.keyPromise;
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const cipher = await crypto.subtle.encrypt({ name: "AES-GCM", iv }, key, data);
    // iv + cipher 组合返回
    const combined = new Uint8Array(iv.length + cipher.byteLength);
    combined.set(iv, 0);
    combined.set(new Uint8Array(cipher), iv.length);
    return combined.buffer;
  }

  private async decryptBuffer(data: ArrayBuffer): Promise<ArrayBuffer> {
    const key = await this.keyPromise;
    const combined = new Uint8Array(data);
    const iv = combined.slice(0, 12);
    const cipherData = combined.slice(12);
    return crypto.subtle.decrypt({ name: "AES-GCM", iv }, key, cipherData);
  }

  // 字符串加密/解密
  async encryptString(plainText: string): Promise<string> {
    const enc = new TextEncoder();
    const buffer = await this.encryptBuffer(enc.encode(plainText).buffer);
    return btoa(String.fromCharCode(...new Uint8Array(buffer)));
  }

  async decryptString(cipherText: string): Promise<string> {
    const buffer = Uint8Array.from(atob(cipherText), c => c.charCodeAt(0)).buffer;
    const decrypted = await this.decryptBuffer(buffer);
    return new TextDecoder().decode(decrypted);
  }

  // ArrayBuffer / Uint8Array 加密解密
  async encryptUint8Array(data: Uint8Array<ArrayBuffer>): Promise<Uint8Array<ArrayBuffer>> {
    const buffer = data.buffer;
    const encrypted = await this.encryptBuffer(buffer);
    return new Uint8Array(encrypted);
  }

  async decryptUint8Array(data: Uint8Array<ArrayBuffer>): Promise<Uint8Array<ArrayBuffer>> {
    const buffer = data.buffer;
    const decrypted = await this.decryptBuffer(buffer);
    return new Uint8Array(decrypted);
  }
}

