import { IncomingMessage, ServerResponse } from "http";
import { WebSocketServer } from "ws";
import { WebSocketController } from "./websocket.controller.js";

// factory/setup pattern for initializing the WebSocket infrastructure
export class WebSocketInitializer {
  private wsController: WebSocketController;
  private wss: WebSocketServer;

  constructor(server: any) {
    this.wss = new WebSocketServer({ server });
    this.wsController = new WebSocketController(this.wss);
  }

  public static initialize(server: any): WebSocketInitializer {
    return new WebSocketInitializer(server);
  }
}
