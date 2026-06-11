---
title: Configuring IPV6-only VPS
categories:
  - Homelab
tags:
  - vps
  - ipv6
author: Onirexus
date: 2026-05-27 20:35:06
cover: ./cover.avif
description: Four practical ways to enable IPV6-only VPS to have IPv4 access.
---
Some VPSs only offer IPv6 access, which introducing several routing and connectivity challenges. Below are four practical methods to configure an IPv6-only VPS to grant it seamless IPv4 outbound access.

## 1 Install Cloudflare WARP
WARP is a wireguard-based VPN service offered by Cloudflare. It creates a network interface that routes IPv4 traffic through Cloudflare's global network.

You can deploy it using a popular shell script:
```bash
wget -N [https://gitlab.com/fscarmen/warp/-/raw/main/menu.sh](https://gitlab.com/fscarmen/warp/-/raw/main/menu.sh) && bash menu.sh
```

Note: If your VPS cannot bootstrap the network to fetch the remote script due to IPv4 limitations, download the script locally first and transfer it via SFTP, or use an IPv6-supported mirror.

## 2 Utilizing Public NAT64 DNS
Certain public DNS providers offer DNS64/NAT64 translation, enabling IPv6-only hosts to synthesize IPv6 addresses for IPv4-only domains.

For systems managed by systemd-resolved (e.g., modern Ubuntu/Debian), edit the configuration directly:

```bash
# Edit /etc/systemd/resolved.conf to append DNS under the [Resolve] section
sudo sed -i 's/#DNS=/DNS=2001:67c:2b0::4 2001:67c:2b0::6/' /etc/systemd/resolved.conf

# Restart the service to apply changes
sudo systemctl restart systemd-resolved
```

## 3 Modifying the Static Hosts File
If your specific use case only requires accessing targeted IPv4 domains (such as GitHub for developer environments), mapping domain names directly via fixed NAT64 translated prefixes inside the /etc/hosts file is an efficient, zero-overhead solution.
```bash
cat << EOF >> /etc/hosts
2a01:4f8:c010:d56::2 github.com
2a01:4f8:c010:d56::3 api.github.com
2a01:4f8:c010:d56::4 codeload.github.com
2a01:4f8:c010:d56::6 ghcr.io
2a01:4f8:c010:d56::7 pkg.github.com npm.pkg.github.com maven.pkg.github.com nuget.pkg.github.com rubygems.pkg.github.com
2a01:4f8:c010:d56::8 uploads.github.com
2606:50c0:8000::133 objects.githubusercontent.com [www.objects.githubusercontent.com](https://www.objects.githubusercontent.com) release-assets.githubusercontent.com gist.githubusercontent.com repository-images.githubusercontent.com camo.githubusercontent.com private-user-images.githubusercontent.com avatars0.githubusercontent.com avatars1.githubusercontent.com avatars2.githubusercontent.com avatars3.githubusercontent.com cloud.githubusercontent.com desktop.githubusercontent.com support.github.com
2606:50c0:8000::154 support-assets.githubassets.com github.githubassets.com opengraph.githubassets.com github-registry-files.githubusercontent.com github-cloud.githubusercontent.com
EOF
```

Warning: These IPv6 mapping addresses are bound to generic NAT64 translation gateways and can break if upstream routing parameters or CDN infrastructure changes.
