import type http from "http";
import { PageController } from "../controllers/page.controller.js";

export class StaticRoutes {
  static async handleRequest(
    req: http.IncomingMessage,
    res: http.ServerResponse,
  ): Promise<boolean> {
    const url = req.url || "/";

    switch (url) {
      case "/":
      case "/index.html":
        await PageController.getIndexPage(req, res);
        return true;

      case "/blog":
      case "/blog.html":
        await PageController.getBlogPage(req, res);
        return true;

      case "/styles/global.css":
        await PageController.servePage(res, "public/styles/global.css");
        return true;

      default:
        return false;
    }
  }
}
