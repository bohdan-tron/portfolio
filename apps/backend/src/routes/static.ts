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

      // case "/blog":
      // case "/blog.html":
      //   await PageController.getBlogPage(req, res);
      //   return true;

      case "/whoami":
      case "/whoami.html":
        await PageController.getWhoamiPage(req, res);
        return true;

      case "/croco":
      case "/croco.html":
        await PageController.getCrocoPage(req, res);
        return true;

      case "/styles/global.css":
        await PageController.servePage(res, "apps/frontend/public/styles/global.css");
        return true;

      case "/components/site-header.js":
        await PageController.servePage(res, "apps/frontend/public/components/site-header.js");
        return true;

      case "/js/game-client.js":
        await PageController.servePage(res, "apps/drawnguess/public/js/game-client.js");
        return true;

      case "/js/websocket-client.js":
        await PageController.servePage(res, "apps/drawnguess/public/js/websocket-client.js");
        return true;

      default:
        return false;
    }
  }
}
