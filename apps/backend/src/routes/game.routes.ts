import type { IncomingMessage, ServerResponse } from "node:http";
import { parse } from "node:url";
import { GameController } from "../controllers/game.controller.js";

export class GameRoutes {
  private gameController: GameController;

  constructor() {
    this.gameController = new GameController();
  }

  public async handleRequest(
    req: IncomingMessage,
    res: ServerResponse,
  ): Promise<boolean> {
    const parsedUrl = parse(req.url || "", true);
    const pathname = parsedUrl.pathname;

    if (!pathname?.startsWith("/api/game")) {
      return false;
    }

    try {
      switch (req.method) {
        case "GET":
          if (pathname === "/api/game/rooms") {
            this.gameController.getAllRooms(req, res);
            return true;
          }
          if (pathname.startsWith("/api/game/room/")) {
            this.gameController.getRoomByCode(req, res);
            return true;
          }
          break;

        case "POST":
          if (pathname === "/api/game/validate") {
            this.gameController.validateRoomCode(req, res);
            return true;
          }
          break;
      }
    } catch (error) {
      console.error("GameRoutes error:", error);
      res.statusCode = 500;
      res.setHeader("Content-Type", "application/json");
      res.end(JSON.stringify({ error: "Internal server error" }));
      return true;
    }

    return false;
  }
}
