# Domain -> VPS (Ubuntu 24) + Nginx reverse proxy + HTTPS

This repo runs a small Node.js HTTP server that serves static pages from `public/`.

- Default app port: `1337` (see `src/server.ts` / `Dockerfile` / `docker-compose.yml`)
- The recommended production setup is:
  - Internet (80/443)
  - Nginx on the VPS
  - Nginx forwards to your app on `127.0.0.1:1337` (or to a Docker container)

---

## 1) DNS at Cloudflare (Registrar)

You bought the domain at Cloudflare Registrar; you still need **DNS records** that point the domain to your VPS public IP.

### 1.1 Collect the IPs

On your VPS provider panel you should have at least:

- **IPv4** (example: `203.0.113.10`)
- Optional **IPv6** (example: `2001:db8::10`)

### 1.2 Create DNS records

In Cloudflare dashboard:

- Go to your domain
- Go to **DNS**
- Add the following records:

#### Option A (recommended): apex + www

- `A` record
  - **Name:** `@`
  - **IPv4 address:** `<YOUR_VPS_IPV4>`
  - **Proxy status:** start with **DNS only** (gray cloud) while you set up TLS; you can enable proxy later.

- `CNAME` record
  - **Name:** `www`
  - **Target:** `@` (or your root domain, Cloudflare will accept either)
  - **Proxy status:** same as above

#### Option B (if you have IPv6): also add AAAA

- `AAAA` record
  - **Name:** `@`
  - **IPv6 address:** `<YOUR_VPS_IPV6>`

### 1.3 Wait for propagation

Propagation is often fast with Cloudflare, but can still take a few minutes.

From your local machine:

- `dig +short A yourdomain.com`
- `dig +short A www.yourdomain.com`

They should return your VPS IP(s).

---

## 2) Decide how you run the app on the VPS

You have 2 realistic choices:

### Option 1: Docker (matches this repo)

- You run your container (or compose) and expose `1337`.
- Nginx listens on `80/443` and proxies to the container.

**Important:** You do *not* need to publish `1337` to the internet. You can keep it local-only.

This repo already has CI/CD that builds a Docker image to GHCR and then deploys to your VPS via SSH by running `docker compose pull` + `docker compose up -d`.
See:

- `.github/workflows/docker-build.yml`
- `.github/workflows/deploy-stage.yml`
- `.github/workflows/deploy-production.yml`

### Option 2: systemd (Node process on the host)

- You build the TypeScript (`pnpm build`)
- You run `node dist/server.js` as a systemd service
- Nginx proxies to `127.0.0.1:1337`

---

## 3) VPS prerequisites (Ubuntu 24)

### 3.1 Firewall

Recommended ports open to the internet:

- `22/tcp` (SSH)
- `80/tcp` (HTTP)
- `443/tcp` (HTTPS)

If using `ufw`:

- `sudo ufw allow OpenSSH`
- `sudo ufw allow 80/tcp`
- `sudo ufw allow 443/tcp`
- `sudo ufw enable`

Do **not** open `1337` publicly if Nginx is in front.

### 3.2 Install Nginx

- `sudo apt update`
- `sudo apt install -y nginx`

### 3.3 Install Docker + Docker Compose plugin (for your current deploy workflows)

Your GitHub Actions deploy workflows expect that on the VPS you can run:

- `sudo docker compose pull`
- `sudo docker compose up -d --force-recreate`

Install Docker Engine + the Compose plugin using the official Docker docs for Ubuntu.

After install, verify:

- `docker --version`
- `docker compose version`

If your deploy user is not root, you can either:

- keep using `sudo docker ...` (matches your workflows)
- or add the user to the `docker` group (security tradeoff; do this only if you understand implications)

---

## 4) Nginx as reverse proxy

### 4.1 Create an Nginx site config

Create:

- `/etc/nginx/sites-available/yourdomain.com`

Example (HTTP only for now):

```nginx
server {
  listen 80;
  listen [::]:80;

  server_name yourdomain.com www.yourdomain.com;

  # Optional: increase for larger headers (cookies), usually not needed here
  # large_client_header_buffers 4 16k;

  location / {
    proxy_pass http://127.0.0.1:1337;

    proxy_http_version 1.1;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;

    # If you add websockets later, keep these
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection "upgrade";
  }
}
```

### 4.2 Production + staging on the same VPS (recommended)

If you want both environments on one VPS:

- production: `yourdomain.com` + `www.yourdomain.com` -> app on `127.0.0.1:1337`
- staging: `staging.yourdomain.com` -> app on `127.0.0.1:1338` (example)

This matches a simple Compose setup where:

- prod runs with `HOST_PORT=1337` and `IMAGE_TAG=main`
- stage runs with `HOST_PORT=1338` and `IMAGE_TAG=stage`

#### Example Nginx config (HTTP only) for prod

Create `/etc/nginx/sites-available/yourdomain.com`:

```nginx
server {
  listen 80;
  listen [::]:80;

  server_name yourdomain.com www.yourdomain.com;

  location / {
    proxy_pass http://127.0.0.1:1337;

    proxy_http_version 1.1;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
  }
}
```

#### Example Nginx config (HTTP only) for staging subdomain

Create `/etc/nginx/sites-available/staging.yourdomain.com`:

```nginx
server {
  listen 80;
  listen [::]:80;

  server_name staging.yourdomain.com;

  location / {
    proxy_pass http://127.0.0.1:1338;

    proxy_http_version 1.1;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
  }
}
```

Enable both:

- `sudo ln -s /etc/nginx/sites-available/yourdomain.com /etc/nginx/sites-enabled/yourdomain.com`
- `sudo ln -s /etc/nginx/sites-available/staging.yourdomain.com /etc/nginx/sites-enabled/staging.yourdomain.com`
- `sudo nginx -t`
- `sudo systemctl reload nginx`

At this point `http://yourdomain.com` should reach your app (assuming the app is running on the VPS).

---

## 5) HTTPS (Let’s Encrypt)

### 5.1 Install certbot

- `sudo apt install -y certbot python3-certbot-nginx`

### 5.2 Issue the certificate

- `sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com`
- `sudo certbot --nginx -d staging.yourdomain.com`

Certbot will:

- edit your Nginx config
- add the TLS `server { listen 443 ssl; ... }` block
- configure HTTP->HTTPS redirects (you can choose this option)

### 5.3 Auto-renewal

Ubuntu installs a timer for certbot renewal. Verify:

- `sudo systemctl status certbot.timer`

---

## 6) Running the app behind Nginx

### 6.1 If you run via Docker Compose

For production you typically:

- do **not** bind `1337` publicly
- bind it to localhost only, or use a Docker network

#### Simple improvement (bind to localhost)

In `docker-compose.yml`, change ports from:

- `"1337:1337"`

to:

- `"127.0.0.1:${HOST_PORT:-1337}:1337"`

This makes the app reachable only from the VPS itself (Nginx can still reach it).

### 6.2 How your GitHub Actions deploys to the VPS (current setup)

Your CI/CD pipeline is:

- `Docker Build` workflow builds an image and pushes it to `ghcr.io/<owner>/<repo>` for `stage` and `main` branches.
- `Deploy Stage` triggers after a successful build of the `stage` branch.
- `Deploy Production` triggers after a successful build of the `main` branch.

On the VPS, the workflow SSHes into your server and runs (simplified):

- `cd "$APP_PATH"`
- `export IMAGE_NAME="ghcr.io/<owner>/<repo>"`
- `export IMAGE_TAG="stage"` or `"main"`
- `sudo docker compose pull`
- `sudo docker compose up -d --force-recreate`
- `sudo docker image prune -f`

#### What must exist on the VPS for this to work

- A folder on the VPS that contains your `docker-compose.yml` (the workflow uses `cd "${{ secrets.*_VM_APP_PATH }}"`).
- Docker + docker compose plugin installed.
- The VPS must be able to pull private images from GHCR (if your package is private).

#### GHCR auth on the VPS

If your GHCR image is private, you must log in on the VPS at least once:

- `sudo docker login ghcr.io -u <YOUR_GITHUB_USERNAME> -p <YOUR_GHCR_TOKEN>`

Create `<YOUR_GHCR_TOKEN>` as a GitHub Personal Access Token with at least:

- `read:packages`

If the package is public, login is typically not required.

### 6.3 If you run via systemd (no Docker)

High-level service example (you will need to adapt paths/user):

- create a user like `web`
- app folder like `/opt/portfolio`
- service `portfolio.service` running `node dist/server.js`

Nginx still proxies to `127.0.0.1:1337`.

### 6.4 GitHub environment variables and secrets you need

Your workflows reference the following. You must set these in GitHub:

**Environment variables** (GitHub Environments):

- `stage` environment:
  - `vars.STAGE_URL`
- `production` environment:
  - `vars.PRODUCTION_URL`

**Secrets** (GitHub Environments):

- Stage:
  - `secrets.STAGE_VM_HOST`
  - `secrets.STAGE_VM_USER`
  - `secrets.STAGE_VM_SSH_KEY`
  - `secrets.STAGE_VM_PORT`
  - `secrets.STAGE_VM_APP_PATH`
- Production:
  - `secrets.PROD_VM_HOST`
  - `secrets.PROD_VM_USER`
  - `secrets.PROD_VM_SSH_KEY`
  - `secrets.PROD_VM_PORT`
  - `secrets.PROD_VM_APP_PATH`

---

## 7) Do you need a load balancer for this project?

### What you have

This repo serves static HTML/CSS from `public/` via a Node server. There is no heavy dynamic backend logic visible here.

### Recommendation

- For this project: **you do not need a load balancer**.
- You do want a **reverse proxy** (Nginx / Caddy) for:
  - HTTPS termination (TLS)
  - HTTP->HTTPS redirect
  - security headers / sane defaults
  - gzip/brotli (optional)
  - simple rate limiting (optional)

A “load balancer” becomes relevant when you run **multiple app instances** and need to distribute traffic.

---

## 8) Reverse proxy / load balancer options (pros/cons)

### Option A: Nginx (reverse proxy) (recommended for you)

- Pros:
  - very common on Ubuntu
  - excellent docs + ecosystem
  - works great as TLS terminator + reverse proxy
  - can load balance later if needed
- Cons:
  - config is more verbose than Caddy

### Option B: Caddy (reverse proxy)

- Pros:
  - simplest HTTPS: automatic certificates with very little config
  - great developer UX
- Cons:
  - less “default” than Nginx on many VPS guides
  - fewer battle-tested examples in some enterprise setups

### Option C: HAProxy (load balancer)

- Pros:
  - extremely good at L4/L7 load balancing
  - very efficient for multi-instance backends
- Cons:
  - not needed for a single-instance static site
  - typically paired with Nginx/Apache for edge concerns, or used alone in more complex setups

### Option D: Cloudflare Proxy / CDN (in front of your VPS)

- Pros:
  - DDoS protection, caching, WAF (depending on plan)
  - can hide your origin IP (when proxied)
  - easy SSL modes
- Cons:
  - extra moving parts; need to understand SSL mode (Full / Full (strict))
  - you still need a working origin server config

---

## 9) Practical “best” setup for this repo

### Minimal, solid production setup

- Cloudflare DNS:
  - `A @ -> VPS IPv4`
  - `CNAME www -> @`
- VPS:
  - Run your app (Docker or systemd) on `127.0.0.1:1337`
  - Nginx on `80/443`
  - Certbot TLS

### When to upgrade to real load balancing

Consider it if:

- you need zero-downtime deploys across multiple instances
- you get enough traffic that one instance is not enough
- you want redundancy (one instance down, site still works)

Then you can:

- run 2+ containers
- configure Nginx upstreams (simple) or HAProxy (more advanced)

---

## 10) Open questions (answer these and I can tailor the config)

- What is your domain name (apex) and do you want `www`?
- What VPS provider and do you have IPv6?
- Are you running the app via Docker (recommended here) or via systemd?
- Do you want Cloudflare orange-cloud proxy enabled or DNS-only?
