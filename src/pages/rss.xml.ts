import rss from "@astrojs/rss";
import type { APIContext } from "astro";
import { getCollection, render, type CollectionEntry } from "astro:content";

import themeConfig from "@/theme.config";
import { createPostContentContainer } from "@/toolkit/posts/createPostContentContainer";
import { toPostHref } from "@/toolkit/posts/url";

export const prerender = true;

const FALLBACK_SITE = "https://blog.onirexus.com";
const ENCRYPTED_POST_DESCRIPTION =
  "This post is encrypted. Please open it on the website to read it.";

function getSiteUrl(context: APIContext): URL {
  return new URL(context.site?.toString() ?? FALLBACK_SITE);
}

function decodeHtmlAttribute(value: string): string {
  return value
    .replaceAll("&amp;", "&")
    .replaceAll("&quot;", '"')
    .replaceAll("&#34;", '"')
    .replaceAll("&apos;", "'")
    .replaceAll("&#39;", "'")
    .replaceAll("&lt;", "<")
    .replaceAll("&gt;", ">");
}

function escapeHtmlAttribute(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll('"', "&quot;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

function isSpecialUrl(value: string): boolean {
  return /^(mailto|tel|data|blob):/i.test(value);
}

function isHttpUrl(value: string): boolean {
  return /^https?:\/\//i.test(value);
}

function toAbsoluteUrl(value: string, siteUrl: URL, pageUrl: URL): string {
  const decodedValue = decodeHtmlAttribute(value.trim());

  if (!decodedValue) {
    return value;
  }

  if (/^javascript:/i.test(decodedValue)) {
    return "#";
  }

  if (isSpecialUrl(decodedValue) || isHttpUrl(decodedValue)) {
    return decodedValue;
  }

  try {
    if (decodedValue.startsWith("//")) {
      return new URL(decodedValue, siteUrl).toString();
    }

    if (decodedValue.startsWith("#")) {
      return new URL(decodedValue, pageUrl).toString();
    }

    if (decodedValue.startsWith("/")) {
      return new URL(decodedValue, siteUrl).toString();
    }

    return new URL(decodedValue, pageUrl).toString();
  } catch {
    return value;
  }
}

function absolutizeSrcset(value: string, siteUrl: URL, pageUrl: URL): string {
  return value
    .split(",")
    .map((candidate) => {
      const parts = candidate.trim().split(/\s+/);
      const [url, ...descriptors] = parts;

      if (!url) {
        return candidate;
      }

      return [toAbsoluteUrl(url, siteUrl, pageUrl), ...descriptors].join(" ");
    })
    .join(", ");
}

function absolutizeHtmlUrls(html: string, siteUrl: URL, pageUrl: URL): string {
  return html
    .replace(
      /\s(href|src)=(["'])([^"']*)\2/g,
      (_match: string, attribute: string, quote: string, value: string) => {
        const absoluteUrl = toAbsoluteUrl(value, siteUrl, pageUrl);

        return ` ${attribute}=${quote}${escapeHtmlAttribute(absoluteUrl)}${quote}`;
      },
    )
    .replace(
      /\s(srcset)=(["'])([^"']*)\2/g,
      (_match: string, attribute: string, quote: string, value: string) => {
        const absoluteSrcset = absolutizeSrcset(value, siteUrl, pageUrl);

        return ` ${attribute}=${quote}${escapeHtmlAttribute(absoluteSrcset)}${quote}`;
      },
    );
}

function cleanHtmlForRss(html: string): string {
  return (
    html
      // RSS 阅读器通常不会执行脚本；删掉交互/样式专用内容。
      .replace(/<script\b[\s\S]*?<\/script\s*>/gi, "")
      .replace(/<style\b[\s\S]*?<\/style\s*>/gi, "")
      .replace(/<iframe\b[\s\S]*?<\/iframe\s*>/gi, "")
      // 去掉 onclick/onload 等事件属性。保留 class/style，尽量保住 Shiki 和 KaTeX 显示效果。
      .replace(/\s+on[a-z]+\s*=\s*(['"])[\s\S]*?\1/gi, "")
      .replace(/\s+on[a-z]+\s*=\s*[^\s>]+/gi, "")
  );
}

function getPostCategories(
  post: CollectionEntry<"posts">,
): string[] | undefined {
  const values = [...(post.data.categories ?? []), ...(post.data.tags ?? [])]
    .map((value) => value.trim())
    .filter(Boolean);

  const uniqueValues = Array.from(new Set(values));

  return uniqueValues.length > 0 ? uniqueValues : undefined;
}

export async function GET(context: APIContext) {
  const siteUrl = getSiteUrl(context);

  const posts = await getCollection("posts", ({ data }) => {
    return data.draft !== true;
  });

  const sortedPosts = posts.sort(
    (a, b) => b.data.date.getTime() - a.data.date.getTime(),
  );

  const container = await createPostContentContainer();

  const items = await Promise.all(
    sortedPosts.map(async (post) => {
      const postPath = toPostHref(post.id);
      const postUrl = new URL(postPath, siteUrl);

      if (post.data.encrypted) {
        const encryptedContent = `<p>${ENCRYPTED_POST_DESCRIPTION}</p><p><a href="${escapeHtmlAttribute(
          postUrl.toString(),
        )}">Read on website</a></p>`;

        return {
          title: post.data.title,
          pubDate: post.data.date,
          link: postPath,
          categories: getPostCategories(post),

          // 兼容只读 description 的阅读器
          description: encryptedContent,

          // 标准全文字段
          content: encryptedContent,
        };
      }

      const { Content } = await render(post);
      const renderedHtml = await container.renderToString(Content);

      const fullContent = cleanHtmlForRss(
        absolutizeHtmlUrls(renderedHtml, siteUrl, postUrl),
      );

      return {
        title: post.data.title,
        pubDate: post.data.date,
        link: postPath,
        categories: getPostCategories(post),

        // 关键：为了最大阅读器兼容，把全文也放进 description。
        // @astrojs/rss 会负责 XML entity 编码，不要自己手动 escapeXmlText。
        description: fullContent,

        // 关键：标准全文字段，会输出为 <content:encoded>。
        content: fullContent,
      };
    }),
  );

  return rss({
    title: themeConfig.siteName || "Onirexus' Blog",
    description:
      themeConfig.sidebar?.description ||
      "An 1-IP blog tracking my tinkering logs, life, and thoughts.",
    site: siteUrl,
    items,
    customData: `<language>${themeConfig.locale || "en"}</language>`,
  });
}
