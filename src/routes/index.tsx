import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Home from './Home';
import Media from './Media';
import Me from './Me';
import MainLayout from '../components/MainLayout';
import { type UiTheme } from '../storage/settings';

type AppRouterProps = {
  theme: UiTheme;
  onThemeChange: (next: UiTheme) => void;
};

export default function AppRouter({ theme, onThemeChange }: AppRouterProps) {
  return (
    <BrowserRouter>
      <Routes>
        {/* 根路径重定向到首页 */}
        <Route path="/" element={<Navigate to="/home" replace />} />

        {/* 带 TabBar */}
        <Route element={<MainLayout theme={theme} onThemeChange={onThemeChange} />}>
          <Route path="/home" element={<Home />} />
          <Route path="/media" element={<Media />} />
          <Route path="/me" element={<Me theme={theme} onThemeChange={onThemeChange} />} />
        </Route>

        {/* 其他路径重定向到首页 */}
        <Route path="*" element={<Navigate to="/home" replace />} />
      </Routes>
    </BrowserRouter>
  );
}