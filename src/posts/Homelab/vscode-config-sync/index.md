---
title: Syncing Configuration Between VSCode Remote-SSH and Code-server
categories:
  - Homelab
tags:
  - vscode
author: Onirexus
date: 2026-05-27 04:59:55
cover: ./cover.avif
description: How to sync VSCode Remote-SSH and code-server's config.
---

I use VSCode Remote-SSH to connect to VPS to code, so that I can use the same environment in a new PC. However, a problem arises when I only have a tablet on hand, as there is no desktop version of VSCode available for tablets. To bridge this gap, I turned to the `code-server` project, which provides a browser-based VSCode client. Naturally, my next step was to sync my configurations between Remote-SSH and code-server.

## 1 Installing VSCode Remote-SSH

Install Remote-SSH extension in local VSCode and click the blue button in the bottom left corner to install the VSCode server on your VPS.

## 2 Installing Code-server

To make syncing the environments easier, I chose a native installation over Docker. Simply run the official installation script.

```bash
curl -fsSL https://code-server.dev/install.sh | sh
```

## 3 Linking Extensions and Configurations

```bash
mkdir -p ~/.local/share/code-server/User/

# link extensions
ln -s ~/.vscode-server/extensions ~/.local/share/code-server/extensions

# link configurations
ln -s ~/.vscode-server/data/Machine/settings.json ~/.local/share/code-server/User/settings.json

# link snippets
ln -s ~/.vscode-server/data/User/snippets ~/.local/share/code-server/User/snippets
```

In practice, I found that the settings.json formats between the two are slightly incompatible. However, since I rarely change these configurations, I just ignored this minor issue.

## 4 Using the Microsoft Official Marketplace

First, edit environment variables:

```bash
sudo systemctl edit code-server@$USER
```

Insert the following snippet inside the specified block (as indicated by the systemd comments):

```toml
[Service]
Environment='EXTENSIONS_GALLERY={"serviceUrl":"https://marketplace.visualstudio.com/_apis/public/gallery","itemUrl":"https://marketplace.visualstudio.com/items","resourceUrlTemplate":"https://%%7Bpublisher%%7D.vscode-unpkg.net/%%7Bpublisher%%7D/%%7Bname%%7D/%%7Bversion%%7D/%%7Bpath%%7D","controlUrl":"","recommendationsUrl":""}'
```

Restart the service：

```bash
sudo systemctl daemon-reload
sudo systemctl restart code-server@$USER
```

## 5 Configuring Code-server

Open the configuration file：

```bash
vim ~/.config/code-server/config.yaml
```

Edit port and passsword. For security reasons, I bound the address to 127.0.0.1 so it isn't exposed directly to the public web. I will handle external access using an Nginx reverse proxy later.

```yaml
bind-addr: 127.0.0.1:8080
auth: password
password: "YourPassword"
cert: false
```

Manually start the service:

```bash
sudo systemctl enable --now code-server@$USER
sudo systemctl status code-server@$USER
```

## 6 Setting Up the Nginx Reverse Proxy

I'm using a Cloudflare origin certificate, stored in `/etc/nginx/ssl/example_com`.

Edit Nginx's configuration:

```bash
sudo vim /etc/nginx/conf.d/codeserver.conf
```

```nginx
server {
    listen 80;
    server_name code.example.com;
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl;
    http2 on;
    server_name code.example.com;

    ssl_certificate /etc/nginx/ssl/example_com/fullchain.pem;
    ssl_certificate_key /etc/nginx/ssl/example_com/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers off;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;

    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;

    client_max_body_size 0;
    proxy_buffering off;
    proxy_request_buffering off;
    proxy_connect_timeout 3600s;
    proxy_send_timeout 3600s;
    proxy_read_timeout 3600s;

    access_log /var/log/nginx/codeserver.access.log;
    error_log  /var/log/nginx/codeserver.error.log;

    location / {
        proxy_pass http://127.0.0.1:8080;

        proxy_set_header Host $host;
        proxy_set_header CF-Connecting-IP $http_cf_connecting_ip;
        proxy_set_header X-Real-IP $http_cf_connecting_ip;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto https;

        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }
}
```

Verify the syntax:

```bash
sudo nginx -t
```

Reload Nginx:

```bash
sudo systemctl reload nginx
```
