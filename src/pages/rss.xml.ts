// src/pages/rss.xml.ts
import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';
import type { APIContext } from 'astro';
import { marked } from 'marked'; // 💡 引入标准的 Markdown 转 HTML 工具

export async function GET(context: APIContext) {
  // 1. 获取所有非草稿的文章列表
  const posts = await getCollection('posts', ({ data }) => {
    return data.draft !== true;
  });

  // 2. 将文章按日期降序排列
  const sortedPosts = posts.sort((a, b) => b.data.date.getTime() - a.data.date.getTime());

  // 3. 映射条目，将纯 Markdown 源码完美解析为 HTML
  const items = sortedPosts.map((post) => {
    const rawMarkdown = post.body || '';
    
    // 💡 关键修复：使用 marked 把文章正文的 Markdown 转换成真正的 HTML 字符串
    // 这样进入 CDATA 的就是 🚀标准的 🚀人类可读的 🚀带标签的 HTML
    const htmlContent = marked.parse(rawMarkdown);

    return {
      title: post.data.title,
      pubDate: post.data.date,
      description: post.data.description || '',
      link: `/posts/${post.id}/`,
      
      // 塞入已经完美转换好的 HTML 正文
      customData: `<content:encoded><![CDATA[${htmlContent}]]></content:encoded>`,
    };
  });

  return rss({
    title: "Onirexus' Blog",
    description: 'Out of Office',
    site: context.site ?? '[https://blog.onirexus.com](https://blog.onirexus.com)',
    items: items, 
    xmlns: {
      content: '[http://purl.org/rss/1.0/modules/content/](http://purl.org/rss/1.0/modules/content/)',
    },
    customData: `<language>en</language>`,
  });
}