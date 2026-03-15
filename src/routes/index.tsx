import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { EncryptConfig, S3Config, type UiTheme } from '../services/settings';
import React from 'react';
import { PostService } from '../services/posts';
import { AttachmentService } from '../services/attachments';

const MainLayout = React.lazy(() => import('../components/MainLayout'));
const Home = React.lazy(() => import('./Home'));
const Media = React.lazy(() => import('./Media'));
const Me = React.lazy(() => import('./Me'));


type AppRouterProps = {
  theme: UiTheme;
  onThemeChange: (next: UiTheme) => void;
  s3Config: S3Config;
  onS3ConfigChange: (next: Partial<S3Config>) => void;
  encryptConfig: EncryptConfig;
  onEncryptConfigChange: (next: Partial<EncryptConfig>) => void;
  postService: PostService;
  attachmentService: AttachmentService;
};

export default function AppRouter(
  { theme, onThemeChange,
    s3Config, onS3ConfigChange,
    encryptConfig, onEncryptConfigChange,
    postService, attachmentService }: AppRouterProps) {
  return (
    <BrowserRouter>
      <Routes>
        {/* 根路径重定向到首页 */}
        <Route path="/" element={<Navigate to="/home" replace />} />

        {/* 带 TabBar */}
        <Route element={<MainLayout theme={theme} onThemeChange={onThemeChange} />}>
          <Route path="/home" element={<Home postService={postService} attachmentService={attachmentService} />} />
          <Route path="/media" element={<Media />} />
          <Route path="/me" element={<Me
            theme={theme} onThemeChange={onThemeChange}
            s3Config={s3Config} onS3ConfigChange={onS3ConfigChange}
            encryptConfig={encryptConfig} onEncryptConfigChange={onEncryptConfigChange}
          />} />
        </Route>

        {/* 其他路径重定向到首页 */}
        <Route path="*" element={<Navigate to="/home" replace />} />
      </Routes>
    </BrowserRouter>
  );
}