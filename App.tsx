import React, { Suspense, lazy } from 'react';
import { Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { Toaster } from 'sonner';
import Layout from './components/layout/Layout';
import ConfirmDialog from './components/shared/ConfirmDialog';
import PwaRegister from './components/shared/PwaRegister';

const Login = lazy(() => import('./pages/Login'));
const Profile = lazy(() => import('./pages/Profile'));
const Settings = lazy(() => import('./pages/Settings'));
const Home = lazy(() => import('./pages/Home'));
const LicenseInfo = lazy(() => import('./pages/LicenseInfo'));
const NotificationPage = lazy(() => import('./pages/NotificationPage'));
const SystemDashboard = lazy(() => import('./pages/dashboards/SystemDashboard'));

import { ProtectedRoute } from './components/auth/ProtectedRoute';
import {
  ThemeSynchronizer,
  MetadataSynchronizer,
  LanguageSynchronizer,
  ThongTinToChucSynchronizer,
  useResolvedTheme,
} from './lib/app-sync';
import { PermissionMatrixSynchronizer } from './components/auth/PermissionMatrixSynchronizer';
import { AuthSessionSynchronizer } from './components/auth/AuthSessionSynchronizer';

const EmployeePage = lazy(() => import('./features/he-thong/nhan-vien/index'));
const ThongTinToChucPage = lazy(() => import('./features/he-thong/thong-tin-to-chuc/index'));
const SecurityPage = lazy(() => import('./features/he-thong/phan-quyen/index'));
const DepartmentPage = lazy(() => import('./features/he-thong/phong-ban/index'));
const PositionPage = lazy(() => import('./features/he-thong/chuc-vu/index'));
const NotFoundPage = lazy(() => import('./pages/NotFound'));

const PageFallback = () => (
  <div className="flex flex-col items-center justify-center min-h-[40vh]" aria-busy="true" aria-label="Đang mở trang">
    <div className="h-10 w-10 rounded-full border-2 border-primary/30 border-t-primary animate-spin" />
  </div>
);

/** Layout + bảo vệ đăng nhập — dùng Outlet thay vì Routes lồng trong `path="/*"` để các path tuyệt đối khớp đúng (RR 6/7). */
const AppShell = () => (
  <ProtectedRoute>
    <Layout>
      <Suspense fallback={<PageFallback />}>
        <Outlet />
      </Suspense>
    </Layout>
  </ProtectedRoute>
);

const App = () => {
  const resolvedTheme = useResolvedTheme();
  return (
    <>
      <ThemeSynchronizer />
      <MetadataSynchronizer />
      <ThongTinToChucSynchronizer />
      <LanguageSynchronizer />
      <PermissionMatrixSynchronizer />
      <AuthSessionSynchronizer />
      <ConfirmDialog />
      <PwaRegister />
      <Toaster position="top-right" richColors theme={resolvedTheme} />
      <Routes>
        <Route path="/dang-nhap" element={<Login />} />
        <Route path="/login" element={<Navigate to="/dang-nhap" replace />} />
        <Route path="/dang-ky" element={<Navigate to="/dang-nhap" replace />} />
        <Route path="/register" element={<Navigate to="/dang-nhap" replace />} />
        <Route element={<AppShell />}>
          <Route path="/" element={<Home />} />
          <Route path="/thong-tin-ban-quyen" element={<LicenseInfo />} />

          <Route path="/he-thong" element={<SystemDashboard />} />
          <Route path="/he-thong/nhan-vien" element={<EmployeePage />} />
          <Route path="/he-thong/phong-ban" element={<DepartmentPage />} />
          <Route path="/he-thong/chuc-vu" element={<PositionPage />} />
          <Route path="/he-thong/thong-tin-to-chuc" element={<ThongTinToChucPage />} />
          <Route path="/he-thong/thong-tin-cong-ty" element={<Navigate to="/he-thong/thong-tin-to-chuc" replace />} />
          <Route path="/he-thong/phan-quyen" element={<SecurityPage />} />

          <Route path="/nhan-vien" element={<Navigate to="/he-thong/nhan-vien" replace />} />
          <Route path="/phong-ban" element={<Navigate to="/he-thong/phong-ban" replace />} />
          <Route path="/chuc-vu" element={<Navigate to="/he-thong/chuc-vu" replace />} />
          <Route path="/thong-tin-cong-ty" element={<Navigate to="/he-thong/thong-tin-to-chuc" replace />} />
          <Route path="/phan-quyen" element={<Navigate to="/he-thong/phan-quyen" replace />} />

          <Route path="/ho-so" element={<Profile />} />
          <Route path="/cai-dat" element={<Settings />} />
          <Route path="/thong-bao" element={<NotificationPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </>
  );
};

export default App;
