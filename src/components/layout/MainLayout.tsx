import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { NavBar, TabBar, SafeArea } from 'antd-mobile';
import { useState, useEffect } from 'react';

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
        <Outlet />
      </div>

      <SafeArea position="bottom" />
      <TabBar 
        activeKey={activeKey}
        onChange={handleTabBarChange}
      >
        <TabBar.Item
          key="home"
          icon={<img src="/tab-bar/home.svg" style={{ width: 24, height: 24 }} />}
          badge={1}
        />
        <TabBar.Item
          key="media"
          icon={<img src="/tab-bar/media.svg" style={{ width: 24, height: 24 }} />}
        />
        <TabBar.Item
          key="me"
          icon={<img src="/tab-bar/me.svg" style={{ width: 24, height: 24 }} />}
        />
      </TabBar>
    </div>
  );
}