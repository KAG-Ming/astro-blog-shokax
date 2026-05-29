import type { PluginInitFunction } from "@hyacine/helper/runtime";
import { getInjectPointSelector } from "@hyacine/helper/runtime";

interface SiteUptimeRuntimeOptions {
  siteCreatedAt: string;
  prefixText: string;
}

/**
 * 计算站点存在时间并格式化输出
 * @param createdAt 建站时间
 * @param prefixText 前缀文本
 * @returns 格式化的时间字符串，例如 "该站点已经存在了 1年2月3日4小时5分钟6秒"
 */
function calculateUptime(createdAt: Date, prefixText: string): string {
  const now = new Date();
  const diff = now.getTime() - createdAt.getTime();

  if (diff < 0) {
    return `${prefixText} 0秒`;
  }

  // 计算各个时间单位
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  const months = Math.floor(days / 30);
  const years = Math.floor(months / 12);

  // 计算余数
  const remainingMonths = months % 12;
  const remainingDays = days % 30;
  const remainingHours = hours % 24;
  const remainingMinutes = minutes % 60;
  const remainingSeconds = seconds % 60;

  // 构建时间字符串
  const parts: string[] = [];

  if (years > 0) parts.push(`${years}年`);
  if (remainingMonths > 0) parts.push(`${remainingMonths}月`);
  if (remainingDays > 0) parts.push(`${remainingDays}日`);
  if (remainingHours > 0) parts.push(`${remainingHours}小时`);
  if (remainingMinutes > 0) parts.push(`${remainingMinutes}分钟`);
  if (remainingSeconds > 0 || parts.length === 0) parts.push(`${remainingSeconds}秒`);

  return `${prefixText} ${parts.join("")}`;
}

/**
 * 创建并插入站点运行时间显示元素
 */
function createUptimeElement(options: SiteUptimeRuntimeOptions): HTMLElement {
  const container = document.createElement("div");
  container.className = "site-uptime";
  container.style.cssText = "margin: 0.5rem 0; font-size: 0.9em;";

  const createdAt = new Date(options.siteCreatedAt);

  // 初始渲染
  container.textContent = calculateUptime(createdAt, options.prefixText);

  // 每秒更新一次
  const intervalId = setInterval(() => {
    container.textContent = calculateUptime(createdAt, options.prefixText);
  }, 1000);

  // 清理函数：当元素从 DOM 中移除时清除定时器
  const observer = new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      for (const node of mutation.removedNodes) {
        if (node === container) {
          clearInterval(intervalId);
          observer.disconnect();
        }
      }
    }
  });

  // 观察父节点的变化
  if (container.parentNode) {
    observer.observe(container.parentNode, { childList: true });
  }

  return container;
}

/**
 * Runtime-only 插件初始化函数
 */
export const init: PluginInitFunction<SiteUptimeRuntimeOptions> = (options) => {
  // 等待 DOM 加载完成
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => {
      const element = createUptimeElement(options);
      const selector = getInjectPointSelector("footer-status");
      const targetElement = document.querySelector(selector);
      if (targetElement) {
        targetElement.appendChild(element);
      }
    });
  } else {
    const element = createUptimeElement(options);
    const selector = getInjectPointSelector("footer-status");
    const targetElement = document.querySelector(selector);
    if (targetElement) {
      targetElement.appendChild(element);
    }
  }
};