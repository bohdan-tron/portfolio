import { IncomingMessage, ServerResponse } from "http";
import { WebSocketServer } from "ws";
import { WebSocketController } from "../controllers/websocket.controller.js";

export class WebSocketRoutes {
  private wsController: WebSocketController;
  private wss: WebSocketServer;

  constructor(server: any) {
    this.wss = new WebSocketServer({ server });
    this.wsController = new WebSocketController(this.wss);
  }

  public static initialize(server: any): WebSocketRoutes {
    return new WebSocketRoutes(server);
  }
}
