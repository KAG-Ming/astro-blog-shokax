// src/pages/rss.xml.ts
import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';
import type { APIContext } from 'astro';

export async function GET(context: APIContext) {
  // 1. 获取所有非草稿的文章列表
  const posts = await getCollection('posts', ({ data }) => {
    return data.draft !== true; // 过滤掉草稿文章
  });

  // 2. 将文章按日期降序排列（最新发布的在前）
  const sortedPosts = posts.sort((a, b) => b.data.date.getTime() - a.data.date.getTime());

  return rss({
    // 这里的标题和描述可以根据你自己的博客信息进行修改
    title: "Onirexus' Blog",
    description: 'Out of Office',
    
    // 自动获取 astro.config.mjs 里配置的 site 域名
    site: context.site ?? 'https://blog.onirexus.com',
    
    // 3. 映射 ShokaX 的内容字段
    items: sortedPosts.map((post) => ({
      title: post.data.title,             // 文章标题
      pubDate: post.data.date,            // 发布时间（对应你 schema 里的 date 字段）
      description: post.data.description || '', // 文章摘要
      
      // 注意：ShokaX 的文章路由在 pages/posts/[...slug].astro 下
      // 所以链接必须拼成 /posts/你的文章slug/
      link: `/posts/${post.id}/`, 
    })),
    
    // 自定义 XML 元数据（可选，加入语言声明）
    customData: `<language>en</language>`,
  });
}