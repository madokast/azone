export type TabBarScrollAction = "show" | "hide" | "keep";

// 忽略小于 8px 的滚动变化，避免手指轻微抖动或滚轮小幅滚动导致 TabBar 闪烁。
export const TAB_BAR_SCROLL_THRESHOLD = 8;

// 页面距离顶部 8px 以内时强制显示 TabBar，避免用户回到顶部后底部导航仍然隐藏。
export const TAB_BAR_TOP_SHOW_OFFSET = 8;

type GetNextTabBarStateOptions = {
  // 当前这次滚动后的 window.scrollY。
  currentY: number;

  // 上一次被认为“有效”的滚动位置，用来和 currentY 比较滚动方向。
  lastY: number;

  // TabBar 当前是否可见，用来避免重复触发同一个显示/隐藏状态。
  isVisible: boolean;

  // 判断有效滚动的最小距离；默认使用 TAB_BAR_SCROLL_THRESHOLD。
  threshold?: number;

  // 距离页面顶部多少像素以内强制显示 TabBar；默认使用 TAB_BAR_TOP_SHOW_OFFSET。
  topShowOffset?: number;
};

/**
 * 根据滚动位置判断 TabBar 下一步应该显示、隐藏，还是保持当前状态。
 *
 * 调用时机：window 触发 scroll 后，在 requestAnimationFrame 回调里调用。
 * 这样手指滑动、鼠标滚轮、拖动滚动条都会走同一套判断逻辑，同时避免高频滚动事件频繁更新 React state。
 */
export function getNextTabBarState({
  currentY,
  lastY,
  isVisible,
  threshold = TAB_BAR_SCROLL_THRESHOLD,
  topShowOffset = TAB_BAR_TOP_SHOW_OFFSET,
}: GetNextTabBarStateOptions): TabBarScrollAction {
  // 接近顶部时优先显示导航，这是用户最容易需要切换页面的位置。
  if (currentY <= topShowOffset) {
    return isVisible ? "keep" : "show";
  }

  const deltaY = currentY - lastY;

  // 小幅滚动通常来自手抖、惯性滚动尾段或滚轮细小刻度，保持当前状态更稳定。
  if (Math.abs(deltaY) < threshold) {
    return "keep";
  }

  // scrollY 变大代表向下滚动：内容向下看，隐藏底部栏让出阅读空间。
  if (deltaY > 0) {
    return isVisible ? "hide" : "keep";
  }

  // scrollY 变小代表向上滚动：用户可能想回到导航或切换页面，显示底部栏。
  return isVisible ? "keep" : "show";
}
