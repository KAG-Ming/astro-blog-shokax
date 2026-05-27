// src/pages/rss.xml.ts
import rss from '@astrojs/rss';
import { getCollection, render } from 'astro:content';
import type { APIContext } from 'astro';

export async function GET(context: APIContext) {
  // 1. 获取所有非草稿的文章列表
  const posts = await getCollection('posts', ({ data }) => {
    return data.draft !== true;
  });

  // 2. 将文章按日期降序排列
  const sortedPosts = posts.sort((a, b) => b.data.date.getTime() - a.data.date.getTime());

  // 3. 异步解析和组装 items
  const items = await Promise.all(
    sortedPosts.map(async (post) => {
      let htmlContent = '';
      
      try {
        // 尝试用 Astro v5 标准方案获取编译后的 HTML
        const rendered = await render(post);
        htmlContent = rendered?.html || '';
      } catch (e) {
        // 捕获潜在的渲染错误，防止整个 RSS 页面直接 500 挂掉
        htmlContent = '';
      }

      // 💡 备用方案：如果 render() 没拿到内容，去拿原始文本（通常 post.body 存在）
      // 如果 post.body 存在且 htmlContent 为空，做个最基础的换行规范化，防止格式太难看
      if (!htmlContent && 'body' in post && post.body) {
        htmlContent = (post.body as string)
          .replace(/&/g, '&amp;')
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;');
      }

      return {
        title: post.data.title,
        pubDate: post.data.date,
        description: post.data.description || '',
        link: `/posts/${post.id}/`,
        
        // 💡 核心操作：不再传 content 属性给插件，
        // 而是直接使用 customData 塞入一条带有 CDATA 保护的原生 XML 标签
        customData: `<content:encoded><![CDATA[${htmlContent}]]></content:encoded>`,
      };
    })
  );

  return rss({
    title: "Onirexus' Blog",
    description: 'Out of Office',
    site: context.site ?? 'https://blog.onirexus.com',
    items: items, 
    xmlns: {
      content: 'http://purl.org/rss/1.0/modules/content/',
    },
    customData: `<language>en</language>`,
  });
}