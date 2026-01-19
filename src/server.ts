import http from "http";
import { pinoHttp } from "pino-http";
import { StaticRoutes } from "./routes/static.js";

const logger = pinoHttp();

const handleServer = async (req: http.IncomingMessage, res: http.ServerResponse) => {
  logger(req, res);
  
  const handled = await StaticRoutes.handleRequest(req, res);
  
  if (!handled) {
    res.statusCode = 404;
    res.setHeader("Content-Type", "text/plain");
    res.end("Not Found");
  }
}

const server = http.createServer(handleServer);

server.listen(process.env.PORT || 1337, () => {
  console.log(`Server running at http://localhost:${process.env.PORT || 1337}/`);
})