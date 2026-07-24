declare module "jszip" {
  class JSZip {
    file(name: string, data: Uint8Array | Buffer): JSZip;
    generateAsync(options: { type: "nodebuffer" }): Promise<Buffer>;
  }

  export default JSZip;
}
