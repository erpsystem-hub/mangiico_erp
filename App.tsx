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
const BusinessDashboard = lazy(() => import('./pages/dashboards/BusinessDashboard'));
const ProductionDashboard = lazy(() => import('./pages/dashboards/ProductionDashboard'));
const FinanceDashboard = lazy(() => import('./pages/dashboards/FinanceDashboard'));

import { ProtectedRoute } from './components/auth/ProtectedRoute';
import FinanceModulePlaceholder from './pages/tai-chinh/FinanceModulePlaceholder';
import ProductionModulePlaceholder from './pages/san-xuat/ProductionModulePlaceholder';
import BusinessModulePlaceholder from './pages/kinh-doanh/BusinessModulePlaceholder';
const ProductAttributePage = lazy(() => import('./features/san-xuat/thuoc-tinh-hang-hoa/index'));
const MeasurementSpecPage = lazy(() => import('./features/san-xuat/thong-so-do/index'));
const ProductCategoryPage = lazy(() => import('./features/san-xuat/danh-muc-hang-hoa/index'));
const MaterialCategoryPage = lazy(() => import('./features/san-xuat/danh-muc-nguyen-lieu/index'));
const MaterialCatalogPage = lazy(() => import('./features/san-xuat/danh-sach-nguyen-lieu/index'));
const BomPage = lazy(() => import('./features/san-xuat/bom/index'));
const LenhSanXuatPage = lazy(() => import('./features/san-xuat/lenh-san-xuat/index'));
const DanhSachKhachHangPage = lazy(
  () => import('./features/kinh-doanh/danh-sach-khach-hang/index'),
);
const DanhSachNhaCungCapPage = lazy(
  () => import('./features/kinh-doanh/danh-sach-nha-cung-cap/index'),
);
const DonHangPage = lazy(() => import('./features/kinh-doanh/don-hang/index'));
const MuaNguyenLieuPage = lazy(() => import('./features/kinh-doanh/mua-nguyen-lieu/index'));
const FinanceCategoryPage = lazy(() => import('./features/tai-chinh/danh-muc-tai-chinh/index'));
const FinanceAccountPage = lazy(() => import('./features/tai-chinh/tai-khoan/index'));
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
const BranchPage = lazy(() => import('./features/he-thong/chi-nhanh/index'));
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

          <Route path="/kinh-doanh" element={<BusinessDashboard />} />
          <Route path="/kinh-doanh/don-hang" element={<DonHangPage />} />
          <Route
            path="/kinh-doanh/bao-cao-ban-hang"
            element={<BusinessModulePlaceholder moduleKey="bao-cao-ban-hang" />}
          />
          <Route path="/kinh-doanh/mua-nguyen-lieu" element={<MuaNguyenLieuPage />} />
          <Route
            path="/kinh-doanh/nhom-khach-hang"
            element={<Navigate to="/kinh-doanh/danh-sach-khach-hang?tab=nhom" replace />}
          />
          <Route path="/kinh-doanh/danh-sach-khach-hang" element={<DanhSachKhachHangPage />} />
          <Route
            path="/kinh-doanh/bao-cao-cong-no-khach-hang"
            element={<BusinessModulePlaceholder moduleKey="bao-cao-cong-no-khach-hang" />}
          />
          <Route
            path="/kinh-doanh/nhom-nha-cung-cap"
            element={<Navigate to="/kinh-doanh/danh-sach-nha-cung-cap?tab=nhom" replace />}
          />
          <Route path="/kinh-doanh/danh-sach-nha-cung-cap" element={<DanhSachNhaCungCapPage />} />
          <Route
            path="/kinh-doanh/bao-cao-cong-no-nha-cung-cap"
            element={<BusinessModulePlaceholder moduleKey="bao-cao-cong-no-nha-cung-cap" />}
          />
          <Route path="/san-xuat" element={<ProductionDashboard />} />
          <Route path="/san-xuat/lenh-san-xuat" element={<LenhSanXuatPage />} />
          <Route
            path="/san-xuat/bao-cao-san-xuat"
            element={<ProductionModulePlaceholder moduleKey="bao-cao-san-xuat" />}
          />
          <Route path="/san-xuat/phieu-kho" element={<ProductionModulePlaceholder moduleKey="phieu-kho" />} />
          <Route
            path="/san-xuat/bao-cao-kho"
            element={<ProductionModulePlaceholder moduleKey="bao-cao-kho" />}
          />
          <Route
            path="/san-xuat/danh-sach-kho"
            element={<ProductionModulePlaceholder moduleKey="danh-sach-kho" />}
          />
          <Route path="/san-xuat/danh-muc-hang-hoa" element={<ProductCategoryPage />} />
          <Route path="/san-xuat/thuoc-tinh-hang-hoa" element={<ProductAttributePage />} />
          <Route path="/san-xuat/thong-so-do" element={<MeasurementSpecPage />} />
          <Route path="/san-xuat/danh-muc-nguyen-lieu" element={<MaterialCategoryPage />} />
          <Route path="/san-xuat/danh-sach-nguyen-lieu" element={<MaterialCatalogPage />} />
          <Route path="/san-xuat/bom" element={<BomPage />} />
          <Route path="/tai-chinh" element={<FinanceDashboard />} />
          <Route path="/tai-chinh/so-thu-chi" element={<FinanceModulePlaceholder moduleKey="so-thu-chi" />} />
          <Route path="/tai-chinh/tai-khoan" element={<FinanceAccountPage />} />
          <Route path="/tai-chinh/danh-muc-tai-chinh" element={<FinanceCategoryPage />} />
          <Route
            path="/tai-chinh/tra-cuu-tai-khoan"
            element={<FinanceModulePlaceholder moduleKey="tra-cuu-tai-khoan" />}
          />
          <Route
            path="/tai-chinh/bao-cao-tai-chinh"
            element={<FinanceModulePlaceholder moduleKey="bao-cao-tai-chinh" />}
          />
          <Route path="/he-thong" element={<SystemDashboard />} />
          <Route path="/kinh-doanh-san-xuat" element={<Navigate to="/kinh-doanh" replace />} />
          <Route path="/he-thong/nhan-vien" element={<EmployeePage />} />
          <Route path="/he-thong/phong-ban" element={<DepartmentPage />} />
          <Route path="/he-thong/chuc-vu" element={<PositionPage />} />
          <Route path="/he-thong/thong-tin-to-chuc" element={<ThongTinToChucPage />} />
          <Route path="/he-thong/chi-nhanh" element={<BranchPage />} />
          <Route path="/he-thong/thong-tin-cong-ty" element={<Navigate to="/he-thong/thong-tin-to-chuc" replace />} />
          <Route path="/he-thong/phan-quyen" element={<SecurityPage />} />

          <Route path="/nhan-vien" element={<Navigate to="/he-thong/nhan-vien" replace />} />
          <Route path="/phong-ban" element={<Navigate to="/he-thong/phong-ban" replace />} />
          <Route path="/chuc-vu" element={<Navigate to="/he-thong/chuc-vu" replace />} />
          <Route path="/chi-nhanh" element={<Navigate to="/he-thong/chi-nhanh" replace />} />
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
