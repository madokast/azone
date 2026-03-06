import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Home from './Home';
import Media from './Media';
import Me from './Me';
import MainLayout from '../components/MainLayout';
import { S3Config, type UiTheme } from '../services/settings';

type AppRouterProps = {
  theme: UiTheme;
  onThemeChange: (next: UiTheme) => void;
  s3Config: S3Config;
  onS3ConfigChange: (next: Partial<S3Config>) => void;
};

export default function AppRouter({ theme, onThemeChange, s3Config, onS3ConfigChange }: AppRouterProps) {
  return (
    <BrowserRouter>
      <Routes>
        {/* 根路径重定向到首页 */}
        <Route path="/" element={<Navigate to="/home" replace />} />

        {/* 带 TabBar */}
        <Route element={<MainLayout theme={theme} onThemeChange={onThemeChange} />}>
          <Route path="/home" element={<Home />} />
          <Route path="/media" element={<Media />} />
          <Route path="/me" element={<Me theme={theme} onThemeChange={onThemeChange} s3Config={s3Config} onS3ConfigChange={onS3ConfigChange} />} />
        </Route>

        {/* 其他路径重定向到首页 */}
        <Route path="*" element={<Navigate to="/home" replace />} />
      </Routes>
    </BrowserRouter>
  );
}