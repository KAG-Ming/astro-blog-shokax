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
    description: 'A 1-IP blog tracking my tinkering logs, life, and thoughts.',

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