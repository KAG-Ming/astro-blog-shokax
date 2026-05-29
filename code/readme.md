# @hyacine/site-uptime

一个用于在页脚显示站点运行时间的 Hyacine 插件。

## 功能

- 📊 实时显示站点已运行的时间（精确到秒）
- 🎨 自动计算年、月、日、小时、分钟、秒
- 🔄 每秒自动更新
- 🌐 Runtime-only 插件，无需服务器端渲染
- ⚙️ 可自定义前缀文本

## 安装

```bash
bun add @hyacine/site-uptime
```

## 使用方法

### 基础配置

在你的 `hyacine.plugin.ts` 或 `hyacine.plugin.mjs` 文件中配置插件：

```typescript
import { defineConfig } from "@hyacine/core";
import siteUptime from "@hyacine/site-uptime";

export default defineConfig({
  injectPoints: {
    "footer-status": ".footer-status", // 你的页脚状态区域选择器
    // ... 其他注入点
  },
  plugins: [
    {
      plugin: siteUptime,
      options: {
        siteCreatedAt: "2024-01-01T00:00:00Z",
        prefixText: "本站已持续运行", // 自定义前缀
      },
    },
  ],
});
```

### 配置选项

#### `SiteUptimeOptions`

| 选项            | 类型     | 必填 | 默认值               | 说明                                                                                      |
| --------------- | -------- | ---- | -------------------- | ----------------------------------------------------------------------------------------- |
| `siteCreatedAt` | `string` | ✅   | -                    | 建站时间，必须是合法的 Date 字符串表达式（如 `"2024-01-01"` 或 `"2024-01-01T00:00:00Z"`） |
| `prefixText`    | `string` | ❌   | `"该站点已经存在了"` | 显示在时间前的文本                                                                        |

## 显示效果

根据站点运行时间，插件会显示类似以下格式的文本：

- 短期运行：`该站点已经存在了 5日12小时30分钟45秒`
- 中期运行：`该站点已经存在了 2月15日8小时20分钟10秒`
- 长期运行：`该站点已经存在了 1年3月22日16小时45分钟30秒`

## 注入点

此插件默认注入到 `footer-status` 注入点。你需要在你的布局模板中确保该注入点存在。

### Astro 示例

```astro
<!-- 在你的 Layout.astro 中 -->
<footer>
  <div class="footer-status">
    <!-- 插件内容将注入到这里 -->
  </div>
</footer>
```

## 技术细节

- **插件类型**：Runtime-only
- **注入点**：footer-status
- **更新频率**：每秒更新一次
- **时间计算**：基于客户端时间，自动处理时区

## 注意事项

1. **日期格式**：`siteCreatedAt` 必须是合法的日期字符串，建议使用 ISO 8601 格式（如 `"2024-01-01T00:00:00Z"`）
2. **时区处理**：时间计算基于用户的本地时间，确保建站时间使用合适的时区
3. **性能优化**：定时器在元素从 DOM 移除时会自动清理，避免内存泄漏

## 开发

```bash
# 格式化代码
bun run format

# 检查代码质量
bun run lint

# 构建
bun run build
```

## 许可证

MIT

## 贡献

欢迎提交 Issue 和 Pull Request！