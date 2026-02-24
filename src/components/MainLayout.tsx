import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { NavBar, TabBar } from 'antd-mobile';
import { useState, useEffect, useRef } from 'react';
import { AppOutline, PicturesOutline, UserSetOutline } from 'antd-mobile-icons';
import { type UiTheme } from '../storage/settings';
import { appColor } from '../styles/theme-tokens'

type MainLayoutProps = {
  theme: UiTheme;
  onThemeChange: (next: UiTheme) => void;
};

export default function MainLayout({ theme, onThemeChange }: MainLayoutProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const path = location.pathname;

  // 根据路径设置初始激活的 key
  const getActiveKey = () => {
    if (path === '/home') return 'home';
    if (path === '/media') return 'media';
    if (path === '/me') return 'me';
    return 'home';
  };

  const [activeKey, setActiveKey] = useState(getActiveKey());

  // 当路径变化时更新激活状态
  useEffect(() => {
    setActiveKey(getActiveKey());
  }, [path]);

  // 处理 TabBar 变化
  const handleTabBarChange = (key: string) => {
    setActiveKey(key);
    if (key === 'home') navigate('/home');
    if (key === 'media') navigate('/media');
    if (key === 'me') navigate('/me');
  };

  // 处理滚动事件
  const lastScrollY = useRef(0);
  const [tabBarOpacity, setTabBarOpacity] = useState(1);
  const [hideTabBar, setHideTabBar] = useState(false);
  useEffect(() => {
    const handleScroll = () => {
      const currScrollY = window.scrollY;
      // 当滚动方向为上时，显示 TabBar；否则隐藏
      setTabBarOpacity(currScrollY > lastScrollY.current ? 0 : 1);
      lastScrollY.current = currScrollY;
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);
  useEffect(() => {
    if (tabBarOpacity === 0) {
      setTimeout(() => {
        setHideTabBar(true);
      }, 300);
    } else {
      setHideTabBar(false);
    }
  }, [tabBarOpacity]);

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <NavBar back={null}>
        {path === '/home' && 'Home'}
        {path === '/media' && 'Media'}
        {path === '/me' && 'Me'}
      </NavBar>

      <div style={{ flex: 1 }}>
        {/* Outlet 是 React Router DOM 中的组件，用于在嵌套路由中渲染子路由的内容 */}
        {/* 例如，当访问 /home 时，Outlet 会渲染 Home 组件 */}
        {/* 当访问 /media 时，Outlet 会渲染 Media 组件 */}
        {/* 当访问 /me 时，Outlet 会渲染 Me 组件 */}
        <Outlet context={{ theme, onThemeChange }} />
      </div>

      <div style={{
        position: 'sticky',
        bottom: 0,
        backgroundColor: appColor.bg,
        opacity: tabBarOpacity,
        transition: 'opacity 1s ease'
      }} hidden={hideTabBar}>
        <TabBar
          activeKey={activeKey}
          onChange={handleTabBarChange}
          safeArea
        >
          <TabBar.Item
            key="home"
            icon={<AppOutline />}
            badge={1}
          />
          <TabBar.Item
            key="media"
            icon={<PicturesOutline />}
          />
          <TabBar.Item
            key="me"
            icon={<UserSetOutline />}
          />
        </TabBar>
      </div>
    </div>
  );
}