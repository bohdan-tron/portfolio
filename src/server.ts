import http from "http";
import { pinoHttp } from "pino-http";
import { StaticRoutes } from "./routes/static.js";

const logger = pinoHttp();

const handleServer = async (
  req: http.IncomingMessage,
  res: http.ServerResponse,
) => {
  logger(req, res);

  const handled = await StaticRoutes.handleRequest(req, res);

  if (!handled) {
    res.statusCode = 404;
    res.setHeader("Content-Type", "text/plain");
    res.end("Not Found");
  }
};

const server = http.createServer(handleServer);

const port = Number(process.env.PORT) || 1337;
const host = process.env.HOST || "0.0.0.0";

server.listen(port, host, () => {
  console.log(`Server running at http://${host}:${port}/`);
});
