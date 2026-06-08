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
      text: "Moments",
      href: "/moments/",
      icon: "i-ri-chat-quote-line",
    },
    {
      text: "About",
      href: "/about/",
      icon: "i-ri-user-3-line",
    },
    {
      text: "Friends",
      href: "/friends/",
      icon: "i-ri-link",
    },
    {
      text: "Statistics",
      href: "/statistics/",
      icon: "i-ri-bar-chart-box-line",
    },
    {
      text: "Tools",
      href: "#",
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
      text: "RSS",
      href: "/rss.xml",
      icon: "i-ri-rss-line",
    },
  ],
  brand: {
    title: "Onirexus' Blog",
    subtitle: "Hic sunt leones",
    logo: "",
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
    description: "An 1-IP blog tracking my tinkering logs, life, and thoughts.",
    social: {
      github: {
        url: "https://github.com/KAG-Ming",
        icon: "i-ri-github-line",
        color: "#101411",
      },
      telegram: {
        url: "https://t.me/Onirexus",
        icon: "i-ri-telegram-2-line",
        color: "#0088cc",
      },
      matrix: {
        url: "https://matrix.to/#/@onyx9766:matrix.org",
        icon: "i-tabler-brand-matrix",
        color: "#0BBD8C",
      },
      email: {
        url: "mailto:topaz@onirexus.com",
        icon: "i-ri-mail-line",
        color: "#FF0233",
      },
      rss: {
        url: "/rss.xml",
        icon: "i-ri-rss-line",
        color: "#F87900",
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
    enable: true,
    waline: {
      serverURL: "https://waline.reimu.qzz.io",
      lang: "en",
      dark: "auto",
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
  },
  home: {
    selectedCategories: [
      {
        name: "Computer Science",
        cover: "/cs-cover.avif",
      },
      {
        name: "Academics",
        cover: "/academics-cover.jpg",
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
      recentMoments: false,
      randomPosts: false,
      tagCloud: true,
    },
  },
  friends: {
    title: "Links",
    description: "",
    links: [
      {
        url: "https://Ashlord.com",
        title: "solaireh3",
        desc: "愛しの君とこの世のはたて",
        author: "solaireh3",
        avatar: "https://img.ashlord.com/537-1.gif",
        color: "#C3B1E1",
        // siteImage: "https://astro.build/assets/press/astro-logo-dark.svg",
      },
      {
        url: "https://blog.samhou.moe/",
        title: "SamHou's Blog",
        desc: "Sleep for a better life.",
        author: "SamHou",
        avatar: "https://img.samhou.top/SamHou.png",
        color: "var(--color-blue)",
      },
      {
        url: "https://moran-neko.moe/",
        title: "默然の补给站",
        desc: "一个野生的互联网存档点",
        author: "默然",
        avatar: "https://moran-neko.moe/img/mortis.ico",
        color: "#C1E1D1",
      },
      {
        url: "https://xnmoe.com",
        title: "NNNullptr南",
        desc: "数学生的古早拼贴风格网站",
        author: "NNNullptr南",
        avatar: "https://www.xnmoe.com/assets/images/pfp.png",
        color: "#FFC5D3",
        //siteImage: "https://bun.sh/logo.svg",
      },
      {
        url: "https://blog.geekzs.com",
        title: "极客宗山",
        desc: "记录&沉淀",
        author: "宗山",
        avatar: "https://img.geekzs.com/avatar/avatar.png",
        color: "#1D1F21",
        //siteImage: "https://bun.sh/logo.svg",
      },
      {
        url: "https://www.huanhq.com/",
        title: "HuanHQ",
        desc: "开发者，产品折腾者，细节控，内容创作者",
        author: "HuanHQ",
        avatar: "https://avatars.githubusercontent.com/u/186523549?v=4",
        color: "var(--color-red)",
      },
    ],
  },
  copyright: {
    license: "CC-BY-NC-SA-4.0",
    show: true,
  },
});
