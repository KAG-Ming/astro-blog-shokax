// src/pages/rss.xml.ts
import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';
import type { APIContext } from 'astro';
import { marked } from 'marked'; // 确保本地或云端已 bun add marked

export async function GET(context: APIContext) {
  // 1. 获取所有非草稿的文章列表
  const posts = await getCollection('posts', ({ data }) => {
    return data.draft !== true;
  });

  // 2. 将文章按日期降序排列
  const sortedPosts = posts.sort((a, b) => b.data.date.getTime() - a.data.date.getTime());

  // 3. 直接使用规范映射
  const rssItems = sortedPosts.map((post) => {
    const rawMarkdown = post.body || '';
    // 用 marked 把 Markdown 转成干净、合法的标准 HTML 字符串
    const htmlContent = marked.parse(rawMarkdown);

    return {
      title: post.data.title,
      pubDate: post.data.date,
      description: post.data.description || '',
      link: `/posts/${post.id}/`,
      // 💡 重点：直接使用标准 content 属性，Astro 底层会自动包裹完美的 <content:encoded>
      content: htmlContent,
    };
  });

  return rss({
    title: "Onirexus' Blog",
    description: 'Out of Office',
    site: context.site ?? 'https://blog.onirexus.com',
    items: rssItems, 
    // 💡 重点：把刚才冲突的手动 xmlns 全都删掉！Astro 检测到上面的 content 属性后，
    // 自己会在生成的 XML 头部补上最精准、完全合法的 xmlns:content 命名空间。
    customData: `<language>en</language>`,
  });
}