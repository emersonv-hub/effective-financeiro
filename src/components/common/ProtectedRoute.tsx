import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';
import { usePermissionsStore } from '@/stores/permissionsStore';
import type { UserRole } from '@/types';
import { Loader2 } from 'lucide-react';

interface Props {
  roles?: UserRole[];
  module?: string;
}

export function ProtectedRoute({ roles, module }: Props) {
  const { user, profile, loading } = useAuthStore();
  const { canAccess, loaded } = usePermissionsStore();

  // Admin sempre tem acesso — não precisa aguardar permissões carregarem
  const needsPermissionLoad = module && !loaded && profile?.role !== 'admin';

  if (loading || needsPermissionLoad) return (
    <div className="min-h-screen flex items-center justify-center">
      <Loader2 className="animate-spin text-[#2250fc]" size={32} />
    </div>
  );

  if (!user) return <Navigate to="/login" replace />;

  if (roles && profile && !roles.includes(profile.role))
    return <Navigate to="/dashboard" replace />;

  if (module && profile && !canAccess(module, profile.role))
    return <Navigate to="/dashboard" replace />;

  return <Outlet />;
}
