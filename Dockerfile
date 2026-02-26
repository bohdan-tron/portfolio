FROM node:24-bookworm-slim AS builder

WORKDIR /app
RUN corepack enable

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml turbo.json ./
COPY apps ./apps
COPY packages ./packages

RUN pnpm install --frozen-lockfile
RUN pnpm --filter @portfolio/frontend build
RUN pnpm --filter @portfolio/backend build

FROM node:24-bookworm-slim AS runtime

WORKDIR /app
ENV NODE_ENV=production
ENV PORT=1337
RUN corepack enable

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml turbo.json ./
COPY apps/backend/package.json ./apps/backend/package.json
COPY apps/frontend/package.json ./apps/frontend/package.json
COPY apps/drawnguess/package.json ./apps/drawnguess/package.json
COPY packages/shared-config/package.json ./packages/shared-config/package.json

RUN pnpm install --filter @portfolio/backend --prod --frozen-lockfile

COPY --from=builder /app/apps/backend/dist ./apps/backend/dist
COPY --from=builder /app/apps/frontend/public ./apps/frontend/public
COPY --from=builder /app/apps/drawnguess/public ./apps/drawnguess/public

EXPOSE 1337
CMD ["node", "apps/backend/dist/server.js"]
