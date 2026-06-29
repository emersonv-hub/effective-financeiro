import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'sonner';
import { useAuth } from '@/hooks/useAuth';
import { supabaseMisconfigured } from '@/lib/supabase';
import { Layout } from '@/components/layout/Layout';
import { ProtectedRoute } from '@/components/common/ProtectedRoute';
import Login from '@/pages/auth/Login';
import ResetPassword from '@/pages/auth/ResetPassword';
import Dashboard from '@/pages/Dashboard';
import Agenda from '@/pages/Agenda';
import Patients from '@/pages/Patients';
import PatientDetail from '@/pages/PatientDetail';
import Attendance from '@/pages/Attendance';
import Financial from '@/pages/Financial';
import Reports from '@/pages/Reports';
import Contracts from '@/pages/Contracts';
import Settings from '@/pages/Settings';

function AppRoutes() {
  useAuth();
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route element={<ProtectedRoute />}>
        <Route element={<Layout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/agenda" element={<Agenda />} />
          <Route path="/pacientes" element={<Patients />} />
          <Route path="/pacientes/:id" element={<PatientDetail />} />
          <Route path="/presenca" element={<ProtectedRoute module="presenca" />}>
            <Route index element={<Attendance />} />
          </Route>
          <Route path="/financeiro" element={<ProtectedRoute module="financeiro" />}>
            <Route index element={<Financial />} />
          </Route>
          <Route path="/relatorios" element={<ProtectedRoute module="relatorios" />}>
            <Route index element={<Reports />} />
          </Route>
          <Route path="/contratos" element={<ProtectedRoute module="contratos" />}>
            <Route index element={<Contracts />} />
          </Route>
          <Route path="/configuracoes" element={<ProtectedRoute roles={['admin']} />}>
            <Route index element={<Settings />} />
          </Route>
        </Route>
      </Route>
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}

export default function App() {
  if (supabaseMisconfigured) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-lg p-8 space-y-4 text-center">
          <div className="w-14 h-14 rounded-full bg-red-100 flex items-center justify-center mx-auto">
            <span className="text-2xl">⚠️</span>
          </div>
          <h1 className="text-xl font-bold text-gray-800">Configuração Necessária</h1>
          <p className="text-sm text-gray-500">
            As variáveis de ambiente do Supabase não estão configuradas.
            Adicione <code className="bg-gray-100 px-1 rounded text-xs">VITE_SUPABASE_URL</code> e{' '}
            <code className="bg-gray-100 px-1 rounded text-xs">VITE_SUPABASE_ANON_KEY</code> nas
            configurações do projeto.
          </p>
        </div>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <AppRoutes />
      <Toaster richColors position="top-right" />
    </BrowserRouter>
  );
}
