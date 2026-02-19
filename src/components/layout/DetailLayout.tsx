import { Outlet, useNavigate } from 'react-router-dom';
import { NavBar } from 'antd-mobile';

export default function DetailLayout() {
  const navigate = useNavigate();

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <NavBar
        onBack={() => navigate(-1)}
      >
        Detail
      </NavBar>

      <div style={{ flex: 1 }}>
        <Outlet />
      </div>
    </div>
  );
}