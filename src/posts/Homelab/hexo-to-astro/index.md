---
title: Migrating ShokaX Theme Blog From Hexo to Astro
categories:
  - Homelab
tags:
  - blog
  - hexo
  - astro
author: Onirexus
date: 2026-05-28 00:05:02
description: Record troubleshooting of migrating shokax-theme blog from Hexo to Astro.
---
Seeing that [shokaX-hexo](https://docs.shokax.kaitaku.xyz/) is planning to migrate to Astro, I decided to migrate my own blog as well. Astro offers superior performance compared to Hexo and represents modern best practices, whereas Hexo is becoming a bit outdated.

Following the recommendations from ShokaX, I performed the migration roughly in the following order. You can refer to the official.[ ShokaX Astro Blog Theme](https://docs.astro.kaitaku.xyz/)

# 1. Setting Up the Astro Environment

Locally install `bun.sh`:
```shell
curl -fsSL https://bun.sh/install | bash
# or
npm install -g bun
```

Then fork the [ShokaX github repo](https://github.com/theme-shoka-x/astro-blog-shokax) to your own account, then `git clone` it.
```shell
git clone https://github.com/your-user-name/astro-blog-shokax.git
cd astro-blog-shokax
```

Install requirements and launch the development environment:
```shell
bun install
bun run dev
```

Now you can visit http://localhost:4321 in your browser to preview your blog.

# 2. Copying Articles To New Directory
Hexo articles reside in `source/_posts/`, while Astro stores them in `src/posts`. The directory structures are mostly similar. Just copy your markdown files to the new directory (the existing subdirectory structure can be preserved). Move pictures to `src/assets/images`.

After doing this, you may encounter several build errors. While most solutions can be found in the official docs, some undocumented issues I occurred are recorded below:

## 1. Front-matter: Cover, Tags & Categories

Cover can't be a remote URL. You can download the images and use the relative path. Or ShokaX may add this feature in the future.

And Tags and Categories must be wrapped by `[]` now.

## 2. Callouts Only Render In .mdx

If you use callouts in a plain .md file, the styling and effects will not render properly. Use .mdx extensions for these files.

# 3. Configuring Astro

It's highly recommended that not to modify the default setting `src/toolkit/themeConfig.defaults.ts` directly. Instead, copy it to `src/theme.config.ts` and edit here. And change `export const DEFAULT_THEME_CONFIG: ShokaXThemeConfig = {` to `export default defineConfig({`.

While editing this configuration file, you might encounter unexpected build errors. If that happens, you can manually clear the cache and rebuild: `rm -rf .astro && bun run build`.

Most configurations are detailed in the official documentation, so I will only highlight the unlisted ones here:

## 1. Disabling Navigation Bar Link Actions

The official docs mention that href cannot be null. To prevent a parent navigation menu from triggering a redirect when clicked, configure it with `href: "javascript:void(0);"`. Here is an example of a plain drop-down menu:

```ts
  {
      text: "Tools",
      href: "javascript:void(0);",
      icon: "i-ri-tools-line",
      dropbox: {
        enable: true,
        items: [
          {
            href: "url1",
            text: "Server Status",
            icon: "i-ri-server-line",
          },
          {
            href: "url2",
            text: "Online Clipboard",
            icon: "i-ri-clipboard-line",
          },
          {
            href: "url3",
            text: "Temporary Email",
            icon: "i-ri-mail-open-line",
          },
        ],
      },
    },
```

## 2. Changing Favicon

To replace the default favicon, create a `public` folder and place your `favicon.svg` inside it. If your icon is not in SVG format, you can either convert it or replace the filename and update the corresponding link tag in `src/layouts/Layout.astro`:
```html
<link rel="icon" type="image/svg+xml" href="/favicon.svg" />
```

## 3. Modifying the Site Establishment Time

In `hyacine.plugin.ts` edit `siteCreatedAt`:
```ts
  plugins: [
    SiteUpTime({
      siteCreatedAt: "2025-03-03T00:00:00Z",
    }),
    MouseFirework({
      colors: [
        "rgba(255,182,185,.9)",
        "rgba(250,227,217,.9)",
        "rgba(187,222,214,.9)",
        "rgba(138,198,209,.9)",
      ],
      count: 30,
      radius: 16,
    }),
  ],
});
```

# 4. Deploy to CloudFlare Pages

Commit your changes to git:
```shell
git add . && git commit
```

If you forgot to fork the official repository initially, you can create a completely empty repository on GitHub and update your remote URL as follows:
```shell
git remote set-url origin git@github.com:/your-user-name/your-repo-name.git
```

And push to github:
```shell
git push -u origin main
```

Log in to cloudflare dashboard, select `Pages`, and `Connect to Git`. Select github and your repo, `Framework preset` select Astro, `Build command` : `bun install && bun run build`. This selection is detailed in official docs.

# 5. Managing Future Upgrades

Add official repo to upstream:
```shell
git remote add upstream https://github.com/theme-shoka-x/astro-blog-shokax.git
```

When there is a new official version, run this:
```shell
git fetch upstream

git checkout main

git merge upstream/main
```

Resolve any potential merge conflicts, then commit and push the updates:
```shell
git add . && git commit && git push -u origin main
```

# 6. Extensions

## 1. RSS
Add this extension:
```shell
bun add @astrojs/rss
```

Create a new file `src/pages/rss.xml.ts`:
```ts
import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';
import type { APIContext } from 'astro';

export async function GET(context: APIContext) {
  const posts = await getCollection('posts', ({ data }) => {
    return data.draft !== true;
  });

  const sortedPosts = posts.sort((a, b) => b.data.date.getTime() - a.data.date.getTime());

  return rss({
    title: "Onirexus' Blog",
    description: '',

    site: context.site ?? 'https://blog.onirexus.com',

    items: sortedPosts.map((post) => ({
      title: post.data.title,
      pubDate: post.data.date,
      description: post.data.description || '',

      link: `/posts/${post.id}/`, 
    })),

    customData: `<language>en</language>`,
  });
}
```

The subscription URL is `https://yourdomain.com/rss.xml`.
## 2. Waline Comments
The official docs is here: [Waline \| Waline](https://waline.js.org/)

At first, I considered using the Vercel + Neon setup mentioned in the quick start guide since it's very convenient. However, a persistent and mysterious 500 error kept bothering me no matter what I tried. As a result, I switched to a self-hosted plan. But soon after, other annoying bugs occurred, leading me to suspect there might be issues with their official JS scripts or Docker images.

The latest official docker image version `1.40.0` has some bugs, so I downgraded to `1.39.3`:
```yaml
services:
  waline:
    container_name: waline
    image: lizheming/waline:1.39.3
    restart: unless-stopped
    ports:
      - 127.0.0.1:8360:8360
    volumes:
      - ./data:/app/data
    environment:
      TZ: 'Asia/Shanghai'
      SQLITE_PATH: '/app/data'
      JWT_TOKEN: 'your token'
      SITE_NAME: 'waline'
      SITE_URL: 'waline site url'
      SECURE_DOMAINS: 'walinedomain.com, blogdomain.com'
      AUTHOR_EMAIL: 'mail@example.com'
```

Next, I set up an Nginx reverse proxy and configured Cloudflare Origin Certificates, then filled in the comment fields in the Shokax configuration file.

However, if you stop here, you'll encounter a `no such table: wl_Comment` error when attempting to post a comment. You can fix this by manually downloading the official SQLite template:
```shell
sudo curl -L -o ./data/waline.sqlite https://github.com/walinejs/waline/raw/main/assets/waline.sqlite

sudo chmod 666 ./data/waline.sqlite
```

Unfortunately, I later found that the /ui/ page failed to render, displaying only a blank screen. Since I couldn't resolve this issue, I decided to give up on the web dashboard and now manually manage the comments directly inside the SQLite database instead.