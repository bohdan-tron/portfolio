export class MimeTypes {
  private static readonly types: Record<string, string> = {
    ".html": "text/html",
    ".css": "text/css",
    ".js": "application/javascript",
    ".json": "application/json",
    ".png": "image/png",
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".gif": "image/gif",
    ".svg": "image/svg+xml",
    ".ico": "image/x-icon",
    ".txt": "text/plain",
    ".pdf": "application/pdf",
    ".xml": "application/xml",
    ".webp": "image/webp",
    ".woff": "font/woff",
    ".woff2": "font/woff2",
    ".ttf": "font/ttf",
    ".eot": "application/vnd.ms-fontobject",
  };

  static getType(filePath: string): string {
    const ext = filePath.substring(filePath.lastIndexOf(".")).toLowerCase();
    return this.types[ext] || "application/octet-stream";
  }

  static isText(filePath: string): boolean {
    const mimeType = this.getType(filePath);
    return mimeType.startsWith("text/") || 
           mimeType === "application/javascript" || 
           mimeType === "application/json" ||
           mimeType === "application/xml";
  }
}
