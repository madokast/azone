import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { NavBar, TabBar, SafeArea } from 'antd-mobile';
import { useState, useEffect } from 'react';
import { AppOutline, PicturesOutline, UserSetOutline } from 'antd-mobile-icons';

export default function MainLayout() {
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

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <NavBar>
        {path === '/home' && '首页'}
        {path === '/media' && '媒体'}
        {path === '/me' && '我的'}
      </NavBar>

      <div style={{ flex: 1 }}>
        {/* Outlet 是 React Router DOM 中的组件，用于在嵌套路由中渲染子路由的内容 */}
        {/* 例如，当访问 /home 时，Outlet 会渲染 Home 组件 */}
        {/* 当访问 /media 时，Outlet 会渲染 Media 组件 */}
        {/* 当访问 /me 时，Outlet 会渲染 Me 组件 */}
        <Outlet />
      </div>

      <SafeArea position="bottom" />
      <TabBar 
        activeKey={activeKey}
        onChange={handleTabBarChange}
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
  );
}