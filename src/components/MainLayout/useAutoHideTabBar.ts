import { useEffect, useRef, useState } from 'react';
import {
  getNextTabBarState,
  TAB_BAR_SCROLL_THRESHOLD,
  TAB_BAR_TOP_SHOW_OFFSET,
} from './scroll';

export function useAutoHideTabBar() {
  // 上一次被认为“有效”的滚动位置，用来判断滚动方向。
  const lastScrollY = useRef(0);

  // scroll 事件很频繁，先记录最新位置，等 requestAnimationFrame 统一处理。
  const pendingScrollY = useRef(0);

  // 当前已预约的动画帧 ID；非 null 表示本帧已经安排过处理逻辑。
  const scrollFrameId = useRef<number | null>(null);

  // 给滚动回调读取的可见状态快照；ref 更新不会触发重新渲染。
  const isTabBarVisibleRef = useRef(true);

  // 真正驱动界面样式的 React 状态；变化后会重新渲染调用方组件。
  const [isTabBarVisible, setIsTabBarVisible] = useState(true);

  // 处理滚动事件：触摸、滚轮、拖动滚动条都会触发 window scroll。
  useEffect(() => {
    lastScrollY.current = window.scrollY;
    pendingScrollY.current = window.scrollY;

    const handleScroll = () => {
      pendingScrollY.current = window.scrollY;

      if (scrollFrameId.current !== null) return;

      // requestAnimationFrame 是浏览器提供的 API，用来把代码安排到下一次屏幕刷新前执行。
      // 这里用它把高频 scroll 事件合并到每一帧最多处理一次。
      scrollFrameId.current = window.requestAnimationFrame(() => {
        scrollFrameId.current = null;

        const currentY = pendingScrollY.current;
        const action = getNextTabBarState({
          currentY,
          lastY: lastScrollY.current,
          isVisible: isTabBarVisibleRef.current,
        });
        const hasMeaningfulScroll =
          Math.abs(currentY - lastScrollY.current) >= TAB_BAR_SCROLL_THRESHOLD;

        if (currentY <= TAB_BAR_TOP_SHOW_OFFSET || hasMeaningfulScroll) {
          lastScrollY.current = currentY;
        }

        if (action === 'keep') return;

        const nextVisible = action === 'show';
        isTabBarVisibleRef.current = nextVisible;
        setIsTabBarVisible(nextVisible);
      });
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (scrollFrameId.current !== null) {
        window.cancelAnimationFrame(scrollFrameId.current);
      }
    };
  }, []);

  return isTabBarVisible;
}
