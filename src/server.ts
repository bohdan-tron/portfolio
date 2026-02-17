import http from "http";
import { pinoHttp } from "pino-http";
import { GameRoutes } from "./routes/game.routes.js";
import { StaticRoutes } from "./routes/static.js";
import { applyCors } from "./utils/cors.js";
import { WebSocketInitializer } from "./websocket/websocket-initializer.js";

const logger = pinoHttp();

const handleServer = async (
  req: http.IncomingMessage,
  res: http.ServerResponse,
) => {
  applyCors(req, res);

  if (req.method === "OPTIONS") {
    res.statusCode = 200;
    res.end();
    return;
  }

  logger(req, res);

  const gameRoutes = new GameRoutes();
  const gameHandled = await gameRoutes.handleRequest(req, res);
  if (gameHandled) return;

  const staticHandled = await StaticRoutes.handleRequest(req, res);
  if (staticHandled) return;

  res.statusCode = 404;
  res.setHeader("Content-Type", "text/plain");
  res.end("Not Found");
};

const server = http.createServer(handleServer);

// Initialize WebSocket routes
WebSocketInitializer.initialize(server);

const port = Number(process.env.PORT) || 1337;
const host = process.env.HOST || "0.0.0.0";

server.listen(port, host, () => {
  console.log(`Server running at http://${host}:${port}/`);
  console.log(`WebSocket server initialized`);
});
