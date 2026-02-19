import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Home from './Home';
import Media from './Media';
import Me from './Me';
import Post from './Post';
import MainLayout from '../components/layout/MainLayout';
import DetailLayout from '../components/layout/DetailLayout';

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        {/* 根路径重定向到首页 */}
        <Route path="/" element={<Navigate to="/home" replace />} />

        {/* 带 TabBar */}
        <Route element={<MainLayout />}>
          <Route path="/home" element={<Home />} />
          <Route path="/media" element={<Media />} />
          <Route path="/me" element={<Me />} />
        </Route>

        {/* 无 TabBar */}
        <Route element={<DetailLayout />}>
          <Route path="/home/post/:id" element={<Post articleMode />} />
        </Route>

        {/* 其他路径重定向到首页 */}
        <Route path="*" element={<Navigate to="/home" replace />} />
      </Routes>
    </BrowserRouter>
  );
}