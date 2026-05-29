import type { PluginManifest } from "@hyacine/core";

export interface SiteUptimeOptions {
  /**
   * 建站时间，合法的 Date 字符串表达式
   * @example "2024-01-01T00:00:00Z"
   * @example "2024-01-01"
   */
  siteCreatedAt: string;

  /**
   * 自定义前缀文本，默认为 "该站点已经存在了"
   * @default "该站点已经存在了"
   */
  prefixText?: string;
}

export default (options: SiteUptimeOptions): PluginManifest => {
  // 验证 siteCreatedAt 是否为合法的日期字符串
  const createdDate = new Date(options.siteCreatedAt);
  if (Number.isNaN(createdDate.getTime())) {
    throw new Error(
      `[site-uptime] Invalid siteCreatedAt: "${options.siteCreatedAt}". Please provide a valid date string.`,
    );
  }

  return {
    name: "@hyacine/site-uptime",
    version: "0.0.1",
    minRenderCapability: "runtime-only",
    entry: [
      {
        type: "runtime-only",
        injectPoint: "footer-status",
        path: new URL("./runtime.ts", import.meta.url).href,
        name: "site-uptime-runtime",
        options: {
          siteCreatedAt: options.siteCreatedAt,
          prefixText: options.prefixText || "该站点已经存在了",
        },
      },
    ],
  };
};
