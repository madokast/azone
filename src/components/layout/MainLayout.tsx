import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { NavBar, TabBar, SafeArea } from 'antd-mobile';

export default function MainLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const path = location.pathname;

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
      <TabBar>
        <TabBar.Item
          key="home"
          icon={<div style={{ width: 24, height: 24, background: '#1677ff' }} />}
          title="首页"
          badge={1}
          onClick={() => navigate('/home')}
        />
        <TabBar.Item
          key="media"
          icon={<div style={{ width: 24, height: 24, background: '#1677ff' }} />}
          title="媒体"
          onClick={() => navigate('/media')}
        />
        <TabBar.Item
          key="me"
          icon={<div style={{ width: 24, height: 24, background: '#1677ff' }} />}
          title="我的"
          onClick={() => navigate('/me')}
        />
      </TabBar>
    </div>
  );
}