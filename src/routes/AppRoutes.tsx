import { lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';

import { PublicLayout } from '@/layouts/PublicLayout';
import { DashboardLayout } from '@/layouts/DashboardLayout';
import { AdminLayout } from '@/layouts/AdminLayout';
import { ProtectedRoute } from '@/routes/ProtectedRoute';
import { AdminRoute } from '@/routes/AdminRoute';

import { LoadingState } from '@/components/ui/LoadingState';

const Home = lazy(() => import('@/pages/Home').then((module) => ({ default: module.Home })));
const Menu = lazy(() => import('@/pages/Menu').then((module) => ({ default: module.Menu })));
const Booking = lazy(() => import('@/pages/Booking').then((module) => ({ default: module.Booking })));
const Login = lazy(() => import('@/pages/Login').then((module) => ({ default: module.Login })));
const Register = lazy(() => import('@/pages/Register').then((module) => ({ default: module.Register })));
const NotFound = lazy(() => import('@/pages/NotFound').then((module) => ({ default: module.NotFound })));

const ClientDashboard = lazy(() => import('@/pages/client/Dashboard').then((module) => ({ default: module.ClientDashboard })));
const ClientReservations = lazy(() => import('@/pages/client/Reservations').then((module) => ({ default: module.ClientReservations })));
const ClientNotifications = lazy(() => import('@/pages/client/Notifications').then((module) => ({ default: module.ClientNotifications })));

const AdminDashboard = lazy(() => import('@/pages/admin/AdminDashboard').then((module) => ({ default: module.AdminDashboard })));
const AdminCalendar = lazy(() => import('@/pages/admin/AdminCalendar').then((module) => ({ default: module.AdminCalendar })));
const AdminMenu = lazy(() => import('@/pages/admin/AdminMenu').then((module) => ({ default: module.AdminMenu })));
const AdminDining = lazy(() => import('@/pages/admin/AdminDining').then((module) => ({ default: module.AdminDining })));
const AdminClients = lazy(() => import('@/pages/admin/AdminClients').then((module) => ({ default: module.AdminClients })));
const AdminSettings = lazy(() => import('@/pages/admin/AdminSettings').then((module) => ({ default: module.AdminSettings })));

export function AppRoutes() {
  return (
    <Suspense fallback={<LoadingState />}>
      <Routes>
        {/* Autenticazione (senza layout pubblico) */}
        <Route path="/login" element={<Login />} />
        <Route path="/registrati" element={<Register />} />

        {/* Sito pubblico */}
        <Route element={<PublicLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/menu" element={<Menu />} />
          <Route path="/prenota" element={<Booking />} />
        </Route>

        {/* Area cliente (protetta) */}
        <Route element={<ProtectedRoute />}>
          <Route element={<DashboardLayout />}>
            <Route path="/dashboard" element={<ClientDashboard />} />
            <Route path="/dashboard/prenotazioni" element={<ClientReservations />} />
            <Route path="/dashboard/notifiche" element={<ClientNotifications />} />
          </Route>
        </Route>

        {/* Area admin (solo admin) */}
        <Route element={<AdminRoute />}>
          <Route element={<AdminLayout />}>
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/admin/calendario" element={<AdminCalendar />} />
            <Route path="/admin/menu" element={<AdminMenu />} />
            <Route path="/admin/sale-tavoli" element={<AdminDining />} />
            <Route path="/admin/clienti" element={<AdminClients />} />
            <Route path="/admin/impostazioni" element={<AdminSettings />} />
          </Route>
        </Route>

        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  );
}
