import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { NavBar, TabBar, SafeArea } from 'antd-mobile';
import './MainLayout.css';

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
      <TabBar style={{ borderTop: '1px solid #f0f0f0' }}>
        <TabBar.Item
          key="home"
          icon={<img src="/tab-bar/home.svg" style={{ width: 24, height: 24 }} />}
          badge={1}
          onClick={() => navigate('/home')}
          active={path === '/home'}
          className={`tab-bar-item ${path === '/home' ? 'active' : ''}`}
          style={{
            position: 'relative',
            paddingBottom: '8px'
          }}
          activeStyle={{
            position: 'relative',
            paddingBottom: '8px'
          }}
        />
        <TabBar.Item
          key="media"
          icon={<img src="/tab-bar/media.svg" style={{ width: 24, height: 24 }} />}
          onClick={() => navigate('/media')}
          active={path === '/media'}
          className={`tab-bar-item ${path === '/media' ? 'active' : ''}`}
          style={{
            position: 'relative',
            paddingBottom: '8px'
          }}
          activeStyle={{
            position: 'relative',
            paddingBottom: '8px'
          }}
        />
        <TabBar.Item
          key="me"
          icon={<img src="/tab-bar/me.svg" style={{ width: 24, height: 24 }} />}
          onClick={() => navigate('/me')}
          active={path === '/me'}
          className={`tab-bar-item ${path === '/me' ? 'active' : ''}`}
          style={{
            position: 'relative',
            paddingBottom: '8px'
          }}
          activeStyle={{
            position: 'relative',
            paddingBottom: '8px'
          }}
        />
      </TabBar>
    </div>
  );
}