import { lazy, Suspense } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from '@/contexts/AuthContext';
import { ProtectedLayout } from '@/components/ProtectedLayout';
import { RoleHome } from '@/components/RoleHome';

const LandingPage = lazy(() => import('@/features/landing/LandingPage'));
const LoginPage = lazy(() => import('@/features/auth/LoginPage'));
const MyDayPage = lazy(() => import('@/features/my-day/MyDayPage'));
const DashboardPage = lazy(() => import('@/features/dashboard/DashboardPage'));
const PropertiesPage = lazy(() => import('@/features/properties/PropertiesPage'));
const PropertyFormPage = lazy(() => import('@/features/properties/PropertyFormPage'));
const LogsPage = lazy(() => import('@/features/logs/LogsPage'));
const LogWorkPage = lazy(() => import('@/features/logs/LogWorkPage'));
const SchedulePage = lazy(() => import('@/features/schedule/SchedulePage'));
const TasksPage = lazy(() => import('@/features/tasks/TasksPage'));
const ChecklistsPage = lazy(() => import('@/features/checklists/ChecklistsPage'));
const IntegrityPage = lazy(() => import('@/features/integrity/IntegrityPage'));
const TeamPage = lazy(() => import('@/features/team/TeamPage'));
const ReportsPage = lazy(() => import('@/features/reports/ReportsPage'));

function PageLoader() {
  return (
    <div className="d-flex justify-content-center align-items-center p-5">
      <div className="spinner-border text-primary" role="status" />
    </div>
  );
}

export default function App() {
  return (
    <HashRouter>
      <AuthProvider>
        <Suspense fallback={<PageLoader />}>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route element={<ProtectedLayout />}>
              <Route path="/home" element={<RoleHome />} />
              <Route path="/my-day" element={<MyDayPage />} />
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/properties" element={<PropertiesPage />} />
              <Route path="/properties/new" element={<PropertyFormPage />} />
              <Route path="/properties/:id" element={<PropertyFormPage />} />
              <Route path="/logs" element={<LogsPage />} />
              <Route path="/logs/new" element={<LogWorkPage />} />
              <Route path="/schedule" element={<SchedulePage />} />
              <Route path="/tasks" element={<TasksPage />} />
              <Route path="/checklists" element={<ChecklistsPage />} />
              <Route path="/integrity" element={<IntegrityPage />} />
              <Route path="/team" element={<TeamPage />} />
              <Route path="/reports" element={<ReportsPage />} />
            </Route>
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </AuthProvider>
    </HashRouter>
  );
}
