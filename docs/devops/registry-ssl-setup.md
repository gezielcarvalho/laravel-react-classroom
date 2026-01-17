# Registry TLS & nginx Full-Chain Setup

Purpose: document how to install and serve a wildcard TLS certificate for the QA registry proxy, produce a proper full-chain file, configure nginx to present the full chain, make Docker trust the certificate, and validate pushes to the registry UI.

**Scope**: nginx reverse proxy (external), `registry:2` (backend HTTP on port 5000), registry UI (`registry_ui`) served via proxy at `/ui/`, and Docker clients (Jenkins host and build agents).

**Files edited in this repo**:

- `docs/devops/qa-infra-nginx.conf` — nginx site config (now references `fullchain.pem`).
- `docs/devops/docker-compose.infra.yaml` — added `registry` and `registry_ui` services.

## Prerequisites

- **Wildcard certificate files**: you must have the leaf certificate and the private key on the proxy host. The wildcard should cover `*.sabresoftware.com.br` (or your domain).
- **Intermediate / CA chain**: a PEM file with the intermediate(s) (from your CA vendor) or a way to fetch them.
- Access to the proxy host (to place files under `/etc/nginx/ssl/`) and permission to reload nginx.

## Goals

- Serve a TLS endpoint `https://qa-harbor.sabresoftware.com.br` that terminates TLS and proxies `/v2/` and `/ui/` to backend services.
- Ensure Docker clients trust the presented certificate so pushes succeed without insecure-registry flags.

## Step 1 — Build a fullchain PEM (leaf first)

If you already received `fullchain.pem` from your CA vendor, copy it to `/etc/nginx/ssl/fullchain.pem` and skip to Step 2.

If you only have the leaf cert (`leaf.crt`) and the intermediate(s) (`intermediate.pem`), create `fullchain.pem` as follows:

```bash
# Example: place certs under /etc/nginx/ssl
sudo mkdir -p /etc/nginx/ssl
sudo bash -c 'cat /etc/nginx/ssl/leaf.crt /etc/nginx/ssl/intermediate.pem > /etc/nginx/ssl/fullchain.pem'
sudo chmod 644 /etc/nginx/ssl/fullchain.pem
sudo chown root:root /etc/nginx/ssl/fullchain.pem
```

If you captured the chain with `openssl s_client` into `/tmp/allcerts.pem`, extract and build fullchain:

```bash
cd /tmp
awk 'BEGIN{c=0} /-----BEGIN CERTIFICATE-----/{c++} {print > "/tmp/cert" c ".pem"}' allcerts.pem
# cert1.pem = leaf, cert2.pem = intermediate
sudo bash -c 'cat /tmp/cert1.pem /tmp/cert2.pem > /etc/nginx/ssl/fullchain.pem'
```

## Step 2 — Ensure nginx uses the full chain

Edit your site config (`/etc/nginx/sites-available/qa-infrastructure` or the path you use) and set:

```
ssl_certificate /etc/nginx/ssl/fullchain.pem;
ssl_certificate_key /etc/nginx/ssl/your_private_key.key;
```

We updated the repo config at `docs/devops/qa-infra-nginx.conf` to reference `/etc/nginx/ssl/fullchain.pem`.

Then test and reload nginx:

```bash
sudo nginx -t
sudo systemctl reload nginx
```

Verify the presented chain (should show no verification error and `Verify return code: 0 (ok)`):

```bash
openssl s_client -connect qa-harbor.sabresoftware.com.br:443 -servername qa-harbor.sabresoftware.com.br -showcerts
```

## Step 3 — Make Docker trust the certificate (if CA is internal)

If the certificate is issued by a public CA (Let's Encrypt, Sectigo, etc.) and the chain is correct, Docker clients will usually trust it automatically. If you use an internal CA or your Docker hosts still reject the chain, do the following on every Docker host (Jenkins manager, agents):

1. Install the CA into system trust (Ubuntu):

```bash
sudo cp /path/to/ca.crt /usr/local/share/ca-certificates/qa-harbor-ca.crt
sudo update-ca-certificates
```

2. Add CA cert specifically for Docker (ensures Docker daemon verifies registry domain):

```bash
sudo mkdir -p /etc/docker/certs.d/qa-harbor.sabresoftware.com.br:443
sudo cp /path/to/ca.crt /etc/docker/certs.d/qa-harbor.sabresoftware.com.br:443/ca.crt
sudo systemctl restart docker
```

Notes:

- Use `qa-harbor.sabresoftware.com.br` and port `443` in the certs.d directory because we push/pull via the TLS host (no :5000 port). If you ever run TLS on a different port, name the directory accordingly (domain:port).

## Step 4 — Push images via TLS (recommended)

Tag and push without the `:5000` port so nginx terminates TLS on 443:

```bash
docker tag alpine:3.18 qa-harbor.sabresoftware.com.br/test/alpine:3.18
docker push qa-harbor.sabresoftware.com.br/test/alpine:3.18
```

If you intentionally want HTTP on port 5000 for dev only, add this to the Docker daemon `daemon.json` on each host (not recommended for production):

```json
{
  "insecure-registries": ["qa-harbor.sabresoftware.com.br:5000"]
}
```

and then `sudo systemctl restart docker`.

## Step 5 — UI and proxy notes

- The UI in this repo (`joxit/docker-registry-ui`) is served at host port `8081` and proxied under `/ui/` by the external nginx config. The UI must reference the proxied API path (we set `REGISTRY_URL=/` and `NGINX_PROXY_PASS_URL=http://registry:5000` in `docs/devops/docker-compose.infra.yaml`).
- Ensure your external nginx has the `/ui/` `location` block forwarding to `127.0.0.1:8081` (or manager IP) and that the `location /v2/` forwards to the registry backend.

## Automation & renewal

- If you use Let's Encrypt / Certbot, configure certbot to write `fullchain.pem` and `privkey.pem` to `/etc/nginx/ssl/` and add a post-renewal hook to reload nginx:

```
certbot renew --quiet --deploy-hook "systemctl reload nginx"
```

- If your certificate is provided manually, include the `fullchain` creation and `nginx -s reload` in your renewal process.

## Troubleshooting

- Browser shows MIXED_CONTENT: Means UI loaded over HTTPS but JS tried to call an HTTP registry URL; ensure UI's `REGISTRY_URL` points to the proxied (HTTPS) path or configure `NGINX_PROXY_PASS_URL` so the UI uses the proxy.
- docker push fails with `http: server gave HTTP response to HTTPS client`: you pushed to `:5000` (HTTP) while client expected HTTPS. Push via TLS host (no port) or add insecure-registry.
- `openssl s_client` shows `unable to verify the first certificate`: server not presenting intermediate(s) — create `fullchain.pem` and update nginx config.

## Quick checklist (summary)

- [ ] Build `fullchain.pem` (leaf + intermediate) and place in `/etc/nginx/ssl/`.
- [ ] Update nginx `ssl_certificate` to use `fullchain.pem` and `ssl_certificate_key` to private key.
- [ ] `nginx -t` and reload nginx.
- [ ] Add CA to Docker trust if internal CA.
- [ ] Push images using TLS host (no port) and confirm they appear in the UI.

---

If you want, I can add a small script `docs/devops/install-fullchain.sh` that automates the fullchain creation, file placement, permission setting, and `nginx` reload. Tell me if you want that script and whether the certificate/intermediate filenames are fixed on the host.
