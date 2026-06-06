---
date: 2025-03-03 15:56:50
author: Onirexus
title: "Hexo ShokaX Theme: Troubleshooting Notes"
tags:
  - blog
  - hexo
categories:
  - Homelab
description: Record troubleshooting when I configure hexo-shokax theme.
---
During the process of configuring my Hexo blog, I ran into a few standard hurdles. Inspired by several troubleshooting posts [shokaX 主题插件配置踩坑指北](https://yuan-uyume.github.io/2023/08/27/zhibei/shokaX%E4%B8%BB%E9%A2%98%E6%8F%92%E4%BB%B6%E9%85%8D%E7%BD%AE%E8%B8%A9%E5%9D%91%E6%8C%87%E5%8C%97/) , I decided to compile my own solutions and workarounds to save others some time.

## ShokaX Default Markdown Settings Filtering HTML Tags

Ref：[Hexo-Shoka 主题拓展、美化及常见问题详解 - Hexo - 博客 \| starsei = 猫不吃鱼 = 夜色难免黑凉，前行必有曙光。](http://blog.starsei.com/blog/hexo/shoka/)
In the official ShokaX documentation, the default Markdown renderer configuration looks like this:

```yml
markdown:
  render:
    html: false
    xhtmlOut: true
    breaks: true
    linkify: true
    typographer:
    quotes: "“”‘’"
  plugins:
    - plugin:
        name: markdown-it-toc-and-anchor
        enable: true
        options:
          tocClassName: "toc"
          anchorClassName: "anchor"
    - plugin:
        name: markdown-it-multimd-table
        enable: true
        options:
          multiline: true
          rowspan: true
          headerless: true
    - plugin:
        name: ./markdown-it-furigana
        enable: true
        options:
          fallbackParens: "()"
    - plugin:
        name: ./markdown-it-spoiler
        enable: true
        options:
          title: "你知道得太多了"
```

Because html is set to false by default, any embedded raw HTML code will fail to render unless it is wrapped in an explicit Hexo raw block:

```markdown
&#123;​% raw %​&#125;
&#123;​% endraw %​&#125;
```

Alternatively, you can simply change the html configuration option to true.

Note: Characters like {} are reserved tokens in Hexo's Markdown engine. If you want to display them as plain text without triggering rendering errors, replace them with their HTML entities: &#123; and &#125;.

## Live2D

I use this: [GitHub - EYHN/hexo-helper-live2d: Add the Sseexxyyy live2d to your hexo!](https://github.com/EYHN/hexo-helper-live2d)
This particular plugin provides minimal, lightweight functionality. If you are looking for advanced interactive features, you might want to look into alternatives like live2d-widget.

Install the core plugin dependency:

```bash
npm install --save hexo-helper-live2d
```

I opted to load custom character assets. If you prefer to use default pre-configured models, the plugin repo has detailed instructions.
Download BangDream models: [如何将 Mygo 人物导入 Live2DViewerEx - 哔哩哔哩](https://www.bilibili.com/opus/849430057414819841)。其中 Ave Mujica 的模型编号是 337-341。懒得自己整理也可以直接用这里的链接, 包含 bangdream 截至 2024 年 4 月的所有模型文件（若链接失效请在下方留言或以主页其他方式与我联系！）：[BanG Dream 全团 live2d-截至 2024-04.zip - 1.4 GB](https://uploadrar.com/ja016h2o7ncu)密码：lihua

Once you extract the assets, create a new directory named live2d_models at the root of your Hexo project. Organize them by character folders (e.g., `live2d_models/sakiko/` and `live2d_models/mutsumi/`).

Next, open your root` _config.yml` and configure the module properties as follows:

```yml
live2d:
  enable: true
  scriptFrom: local
  pluginRootPath: live2dw/ # 插件在站点上的根目录 (相对路径)
  pluginJsPath: lib/ # 脚本文件相对与插件根目录路径
  pluginModelPath: assets/ # 模型文件相对与插件根目录路径
  #scriptFrom: xxx/lib/L2Dwidget.min.js # 你的自定义 url
  tagMode: false # 标签模式，是否仅替换 live2d tag 标签而非插入到所有页面中
  debug: false # 调试，是否在控制台输出日志
  model:
    # use: live2d-widget-model-haru # 使用的 Live2d 模型名称
    use: sakiko # 你的自定义 url
  display:
    position: left #显示位置
    width: 300
    height: 600
    hOffset: 0
    vOffset: -50
  mobile:
    show: false # 手机中是否展示
  react:
    opacity: 1.0 # 模型透明度
  dialog:
    enable: false
    hitokoto: true
```

## Integrating the hexo-graph Plugin

hexo-graph generates beautiful visual analytics for your blog, capturing post heatmaps, monthly frequency, category distributions, and tag weight clouds. It functions similarly to the official hexo-shokax-posts-statistics add-on but scales with a sleeker ECharts design aesthetic.

You can grab the setup documentation directly from their source repository [GitHub - codepzj/hexo-graph: hexo-graph，一个基于 echarts，集成博客热力图，博客月份统计图，分类统计图，标签统计图的多元化插件。](https://github.com/codepzj/hexo-graph)

## Algolia

Here is a quick tip regarding a rookie mistake I made during initial setup: when you register a fresh Algolia account, you are required to complete their "Get Started" onboarding sequence before unlocking API control. Instead of pulling your hair out trying to import custom production schemas, simply select their "load example data" option to bypass the wizard instantly.

For integration, the ShokaX configuration block requires the following setup:

```yml
algolia:
  appId: #Your appId
  apiKey: #Your apiKey
  adminApiKey: #Your adminApiKey
  chunkSize: 5000
  indexName: #"shokaX"
  fields:
    - title #必须配置
    - path #必须配置
    - categories #推荐配置
    - content:strip:truncate,0,2000
    - gallery
    - photos
    - tags
```

Make sure you explicitly declare `fields.title`, `fields.path`directly under the fields array structure exactly as shown above.

## Troubleshooting hexo-shokax-create-time Discrepancy
I made another silly oversight here: I copy-pasted the documentation string `createTime: "YYYY/MM/DD HH:MM:SS"` blindly into my config, only to find the site rendering component blank. It took me a while to realize that this value is a placeholder meant to be replaced with your actual site creation timestamp!

Furthermore, make sure this parameter is placed inside `_config.shokax.yml`, not the global `_config.yml`. If you wish to customize the label string, you can modify the template directly inside `./viewers/create-time.pug`.

## hexo-shokax-busuanzi
After configuring the standard Busuanzi visitor counter (hexo-shokax-busuanzi), the view metrics simply refused to render. This occurs due to a script loading conflict with the Live2D plugin.

To fix this, edit your local template file at `./node_modules/hexo-shokax-busuanzi/busuanzi.pug` and strip out the element IDs inside the span parentheses. The modified layout code should look like this:

```pug
script(src='https://unpkg.com/busuanzi@2.3.0/bsz.pure.mini.js')
div(id="busuanzi-wrap")
    if !theme.busuanzi || theme.busuanzi.pv.enable
        span(class='ic i-eye')
        span()
            != (theme.busuanzi && theme.busuanzi.pv.title) || '本站访问量'
            != ' '
            span(id="busuanzi_value_site_pv")
            != ' '
            != (theme.busuanzi && theme.busuanzi.pv.quantifier) || '次'
    if !theme.busuanzi || (theme.busuanzi.pv.enable && theme.busuanzi.uv.enable)
        != ' | '
    if !theme.busuanzi || theme.busuanzi.uv.enable
        span(class='ic i-user')
        span()
            != (theme.busuanzi && theme.busuanzi.uv.title) || '本站访客量'
            != ' '
            span(id="busuanzi_value_site_uv")
            != ' '
            != (theme.busuanzi && theme.busuanzi.uv.quantifier) || '次'
```
Once reloaded, the counters should trigger properly.

Note: When debugging on http://localhost:4000/, your analytics count might show an astronomically high fallback number. Don't worry about it—the counter will normalize once pushed to production.

Unresolved Bug: The Busuanzi counter currently breaks and drops packets when accessing the site through a proxy/VPN. The theme author suggested self-hosting the tracking API backend, which I might look into when I have some free time. :-P

## Customizing Core Pug Templates

### Completely Removing the Cat Loading Animation

Even though the theme allows you to toggle off the loading overlay via configuration properties, the asset overhead scripts still run behind the scenes. To completely eliminate the cat layout component:

Navigate to `themes/shokax/layout/_partials/loading.pug` and comment out or remove the `div(class="cat")` block entirely:

```pug
div(id="loading")
    //- div(class="cat")
    //-     div(class="body")
    //-     div(class="head")
    //-         div(class="face")
    //-     div(class="foot")
    //-         div(class="tummy-end")
    //-         div(class="bottom")
    //-         div(class="legs left")
    //-         div(class="legs right")
    //-     div(class="paw")
    //-         div(class="hands left")
    //-         div(class="hands right")
```

### Modifying the Browser Tab Title Hover Format

After configuring title and alternate strings across the setup files, I noticed that the default mouse-hover title format renders clunkily as `alternate=title`. To change the delimiter to a clean pipe (`|`), adjust the corresponding evaluation statement inside `themes/shokax/layout/_partials/layout.pug`: `!=${alternate?alternate + " | ":""}${title}${subtitle?" | "+subtitle:""}`

## Asset Optimization Tools

For matching multi-platform favicons and general images, here are some incredibly helpful asset-conversion utilities that I use during layout builds:

- [Favicon.ico](https://www.logosc.cn/favicon-generato)
- [CloudConvert](https://cloudconvert.com/)
- [Convertio](https://convertio.co/zh/)

## TODO

1. Self-hosting a custom Busuanzi API counter endpoint.
2. Refactoring the underlying CSS theme color variables.
