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
        color: "#24292f",
      },
      telegram: {
        url: "https://t.me/Onirexus",
        icon: "i-ri-telegram-2-line",
        color: "#0088cc",
      },
      email: {
        url: "mailto:topaz@onirexus.com",
        icon: "i-ri-mail-line",
        color: "#FF0233",
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
        cover: "./src/assets/images/cs/cs-cover.jpg",
      },
      {
        name: "Academics",
        cover: "./src/assets/images/academics/academics-cover.jpg",
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
    title: "Links",
    description: "",
    links: [
      {
        url: "https://astro.build/",
        title: "Astro",
        desc: "The web framework for content-driven websites",
        author: "Astro Team",
        avatar: "https://avatars.githubusercontent.com/u/44914786?s=200&v=4",
        color: "var(--color-orange)",
        siteImage: "https://astro.build/assets/press/astro-logo-dark.svg",
      },
      {
        url: "https://docs.shokax.kaitaku.xyz/",
        title: "ShokaX",
        desc: "A Modern and Customizable Blog Theme",
        author: "ShokaX Team",
        avatar: "https://avatars.githubusercontent.com/u/129762903?s=280&v=4",
        color: "var(--color-blue)",
      },
      {
        url: "https://shoka.lostyu.me",
        title: "優萌初華",
        desc: "琉璃的医学 & 编程笔记",
        author: "霜月琉璃",
        avatar: "https://cdn.jsdelivr.net/gh/amehime/shoka@latest/images/avatar.jpg",
        color: "#e9546b",
      },
      {
        url: "https://bun.sh/",
        title: "Bun",
        desc: "A fast, incrementally adoptable all-in-one JavaScript, TypeScript & JSX toolkit.",
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
