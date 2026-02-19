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
          icon={<img src="/tab-bar/home.svg" style={{ width: 24, height: 24 }} />}
          title="首页"
          badge={1}
          onClick={() => navigate('/home')}
        />
        <TabBar.Item
          key="media"
          icon={<img src="/tab-bar/media.svg" style={{ width: 24, height: 24 }} />}
          title="媒体"
          onClick={() => navigate('/media')}
        />
        <TabBar.Item
          key="me"
          icon={<img src="/tab-bar/me.svg" style={{ width: 24, height: 24 }} />}
          title="我的"
          onClick={() => navigate('/me')}
        />
      </TabBar>
    </div>
  );
}