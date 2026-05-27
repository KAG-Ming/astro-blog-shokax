// cannot use path alias here because unocss can not resolve it
import { defineConfig } from "./toolkit/themeConfig";

export default defineConfig({
  siteName: "Onirexus' Blog",
  locale: "en",
  nav: [
    {
      href: "/",
      text: "Home",
      icon: "i-ri-home-line",
    },
    {
      text: "About",
      href: "/about/",
      icon: "i-ri-user-3-line",
    },
    {
      text: "Posts",
      href: "/random/",
      icon: "i-ri-quill-pen-line",
      dropbox: {
        enable: true,
        items: [
          {
            href: "/categories/",
            text: "Categories",
            icon: "i-ri-book-shelf-line",
          },
          {
            href: "/tags/",
            text: "Tags",
            icon: "i-ri-price-tag-3-line",
          },
          {
            href: "/archives/",
            text: "Archives",
            icon: "i-ri-archive-line",
          },
        ],
      },
    },
    {
      text: "Friends",
      href: "/friends/",
      icon: "i-ri-link",
    },
    {
      text: "Moments",
      href: "/moments/",
      icon: "i-ri-chat-quote-line",
    },
{
      text: "Tools",
      href: "javascript:void(0);",
      icon: "i-ri-tools-line",
      dropbox: {
        enable: true,
        items: [
          {
            href: "https://status.onirexus.com",
            text: "Server Status",
            icon: "i-ri-server-line",
          },
          {
            href: "https://dc1.cc.cd",
            text: "Online Clipboard",
            icon: "i-ri-clipboard-line",
          },
          {
            href: "https://oxe.us.ci",
            text: "Temporary Email",
            icon: "i-ri-mail-open-line",
          },
        ],
      },
    },
    {
      text: "Statistics",
      href: "/statistics/",
      icon: "i-ri-bar-chart-box-line",
    },
    {
      text: "RSS",
      href: "https://blog.onirexus.com/rss.xml",
      icon: "i-ri-rss-line",
    },
  ],
  brand: {
    title: "Onirexus' Blog",
    subtitle: "E Lucevan Le Stelle.",
    logo: "✨",
  },
  cover: {
    enable: true,
    preload: true,
    fixedCover: {
      enable: false,
      url: "cover-4",
    },
    nextGradientCover: false,
  },
  sidebar: {
    author: "Onirexus",
    description: " ₍˄·͈༝·͈˄*₎◞ ̑̑",
    social: {
      github: {
        url: "https://github.com/KAG-Ming",
        icon: "i-ri-github-line",
      },
      telegram: {
        url: "https://twitter.com/yourname",
        icon: "i-ri-telegram-2-line",
      },
      email: {
        url: "mailto:topaz@onirexus.com",
        icon: "i-ri-mail-line",
      },
    },
  },
  footer: {
    since: 2025,
    icon: {
      name: "sakura rotate",
      color: "var(--color-pink)",
    },
    count: true,
    powered: false,
    icp: {
      enable: false,
      icpnumber: "津ICP备2022001375号",
      icpurl: "https://beian.miit.gov.cn/",
    },
  },
  tagCloud: {
    startColor: "var(--grey-6)",
    endColor: "var(--color-blue)",
  },
  widgets: {
    randomPosts: false,
    recentComments: false,
    recentCommentsLimit: 10,
  },
  comments: {
    enable: false,
    waline: {
      serverURL: "",
      lang: "zh-CN",
    },
  },
  hyc: {
    enable: false,
    aiSummary: {
      enable: true,
      title: "AI 摘要",
      showModel: true,
    },
    aiRecommend: {
      enable: true,
      limit: 3,
      minSimilarity: 0.4,
    },
  },
  diagnostics: {
    suppressFsWatcherMaxListenersWarning: true,
  },
  nyxPlayer: {
    enable: false,
    preset: "shokax",
    darkModeTarget: ':root[data-theme="dark"]',
    urls: [
      {
        name: "默认歌单",
        url: "https://music.163.com/#/playlist?id=2943811283",
      },
    ],
  },
  visibilityTitle: {
    enable: false,
    leaveTitle: "👀 你先忙，我等你回来~",
    returnTitle: "🎉 欢迎回来！",
    restoreDelay: 3000,
  },
  home: {
    selectedCategories: [
      {
        name: "Computer Science",
        cover: "/images/cs-cover.jpg",
      },
      {
        name: "Academics",
        cover: "/images/academics-cover.jpg",
      },
    ],
    pageSize: 5,
    title: {
      behavior: "default",
      customTitle: "",
    },
  },
  layout: {
    mode: "three-column",
    rightSidebar: {
      order: [
        "announcement",
        "search",
        "calendar",
        "recentMoments",
        "randomPosts",
        "tagCloud",
      ],
      announcement: true,
      search: true,
      calendar: false,
      recentMoments: true,
      randomPosts: true,
      tagCloud: true,
    },
  },
  friends: {
    title: "友链",
    description: "卡片式展示，支持站点预览与主题色点缀。",
    links: [
      {
        url: "https://astro.build/",
        title: "Astro",
        desc: "全站体验轻快的静态站点框架，适合内容型站点与博客。",
        author: "Astro Team",
        avatar: "https://avatars.githubusercontent.com/u/44914786?s=200&v=4",
        color: "var(--color-orange)",
        siteImage: "https://astro.build/assets/press/astro-logo-dark.svg",
      },
      {
        url: "https://svelte.dev/",
        title: "Svelte",
        desc: "编译时框架，现代与简洁，组件写起来很顺手。",
        author: "Svelte Team",
        avatar: "https://avatars.githubusercontent.com/u/23617963?s=200&v=4",
        color: "var(--color-red)",
      },
      {
        url: "https://vite.dev/",
        title: "Vite",
        desc: "快速的前端开发构建工具，HMR 体验很棒。",
        author: "Vite Team",
        avatar: "https://avatars.githubusercontent.com/u/65625612?s=200&v=4",
        color: "var(--color-blue)",
      },
      {
        url: "https://bun.sh/",
        title: "Bun",
        desc: "一体化 JavaScript 运行时，速度与工具链兼备。",
        author: "Bun Team",
        avatar: "https://avatars.githubusercontent.com/u/108928776?s=200&v=4",
        color: "var(--color-green)",
        siteImage: "https://bun.sh/logo.svg",
      },
    ],
  },
  copyright: {
    license: "CC-BY-NC-SA-4.0",
    show: true,
  },
});
