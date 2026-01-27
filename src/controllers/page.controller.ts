import type http from "http";
import { FileReader } from "../utils/file-reader.js";
import { MimeTypes } from "../utils/mime-types.js";

export class PageController {
  static async servePage(
    res: http.ServerResponse,
    filePath: string,
  ): Promise<void> {
    try {
      const content = await FileReader.readFile(filePath);
      res.statusCode = 200;
      res.setHeader("Content-Type", MimeTypes.getType(filePath));
      res.end(content);
    } catch (error) {
      res.statusCode = 404;
      res.setHeader("Content-Type", "text/plain");
      res.end("Page not found");
    }
  }

  static async getIndexPage(
    req: http.IncomingMessage,
    res: http.ServerResponse,
  ): Promise<void> {
    await PageController.servePage(res, "public/index.html");
  }

  static async getBlogPage(
    req: http.IncomingMessage,
    res: http.ServerResponse,
  ): Promise<void> {
    await PageController.servePage(res, "public/blog.html");
  }

  static async getWhoamiPage(
    req: http.IncomingMessage,
    res: http.ServerResponse,
  ): Promise<void> {
    await PageController.servePage(res, "public/whoami.html");
  }
}
