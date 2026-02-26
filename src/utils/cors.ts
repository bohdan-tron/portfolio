import type http from "http";

export const applyCors = (
  req: http.IncomingMessage,
  res: http.ServerResponse,
) => {
  const allowedOrigins =
    process.env.NODE_ENV === "production"
      ? [
          "https://tronbdan.com",
          "https://www.tronbdan.com",
          "https://staging.tronbdan.com",
        ]
      : ["http://localhost:3000", "http://localhost:1337"];

  const origin = req.headers.origin;
  if (origin && allowedOrigins.includes(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
  }

  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, DELETE, OPTIONS",
  );
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
};
