# Portfolio workspace

Monorepo layout:

- `apps/backend` - Node.js + TypeScript server
- `apps/frontend` - static portfolio pages + web component authoring sources
- `apps/drawnguess` - draw-and-guess game UI static assets
- `packages/shared-config` - shared workspace config package placeholder

## Local development

```bash
pnpm dev:backend
pnpm dev:frontend
```

Or run all app scripts in parallel:

```bash
pnpm dev
```

## Docker

```bash
docker-compose up -d --build
docker-compose logs -f
```
