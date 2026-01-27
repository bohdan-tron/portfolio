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

      case "/whoami":
      case "/whoami.html":
        await PageController.getWhoamiPage(req, res);
        return true;

      case "/styles/global.css":
        await PageController.servePage(res, "public/styles/global.css");
        return true;

      case "/components/site-header.js":
        await PageController.servePage(res, "public/components/site-header.js");
        return true;

      default:
        return false;
    }
  }
}
