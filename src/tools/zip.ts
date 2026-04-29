import JSZip from "jszip";

export type ZipData = string | Uint8Array | ArrayBuffer | Blob;

export interface UnzippedFile {
  path: string;
  data: Uint8Array;
}

export class ZipBuilder {
  private readonly zip = new JSZip();
  private generated = false;

  add(path: string, data: ZipData): this {
    if (this.generated) {
      throw new Error("Cannot add files after generate");
    }

    assertSafeZipPath(path);
    this.zip.file(path, data);
    return this;
  }

  async generate(): Promise<Uint8Array> {
    this.generated = true;
    return this.zip.generateAsync({ type: "uint8array" });
  }
}

export async function unzipFiles(data: Uint8Array | ArrayBuffer | Blob): Promise<UnzippedFile[]> {
  const zip = await JSZip.loadAsync(data);
  const files = Object.values(zip.files).filter(file => !file.dir);

  return Promise.all(files.map(async file => ({
    path: file.name,
    data: await file.async("uint8array"),
  })));
}

function assertSafeZipPath(path: string): void {
  const parts = path.split("/");
  if (path.startsWith("/") || parts.some(part => part === "..")) {
    throw new Error(`Unsafe zip path: ${path}`);
  }
}
