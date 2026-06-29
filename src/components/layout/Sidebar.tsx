import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Calendar, Users, ClipboardCheck,
  DollarSign, BarChart3, Settings, LogOut, ChevronLeft, ChevronRight, FileText,
} from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import { useUIStore } from '@/stores/uiStore';
import { usePermissionsStore } from '@/stores/permissionsStore';
import { Logo } from '@/components/Logo';
import { cn } from '@/lib/utils';

const navItems = [
  { to: '/dashboard',     module: 'dashboard',    icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/agenda',        module: 'agenda',        icon: Calendar,        label: 'Agenda' },
  { to: '/pacientes',     module: 'pacientes',     icon: Users,           label: 'Pacientes' },
  { to: '/presenca',      module: 'presenca',      icon: ClipboardCheck,  label: 'Presença' },
  { to: '/financeiro',    module: 'financeiro',    icon: DollarSign,      label: 'Financeiro' },
  { to: '/relatorios',    module: 'relatorios',    icon: BarChart3,       label: 'Relatórios' },
  { to: '/contratos',     module: 'contratos',     icon: FileText,        label: 'Contratos' },
  { to: '/configuracoes', module: 'configuracoes', icon: Settings,        label: 'Configurações' },
];

export function Sidebar() {
  const { profile, signOut } = useAuthStore();
  const { sidebarCollapsed, mobileMenuOpen, toggleSidebar, closeMobileMenu } = useUIStore();
  const { canAccess } = usePermissionsStore();
  const navigate = useNavigate();

  const visible = navItems.filter(item => profile && canAccess(item.module, profile.role));

  function handleNavClick() {
    closeMobileMenu();
  }

  return (
    <>
      {/* Overlay mobile */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 md:hidden"
          onClick={closeMobileMenu}
        />
      )}

      <aside
        className={cn(
          'flex flex-col h-screen bg-[#1a1f2e] border-r border-[#232a3b] fixed left-0 top-0 z-40 transition-all duration-300',
          // Mobile: drawer desliza pela esquerda
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0',
          // Desktop: largura colapsa
          sidebarCollapsed ? 'w-64 md:w-16' : 'w-64 md:w-56',
        )}
      >
        {/* Logo */}
        <div className="flex items-center justify-between px-3 py-4 border-b border-[#232a3b]">
          <Logo size="sm" iconOnly={sidebarCollapsed} theme="dark" />
          <button
            onClick={toggleSidebar}
            className="hidden md:block text-[#728a9f] hover:text-white transition-colors ml-auto"
          >
            {sidebarCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 py-4 space-y-1 overflow-y-auto">
          {visible.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              onClick={handleNavClick}
              className={({ isActive }) => cn(
                'flex items-center gap-3 px-3 py-2.5 mx-2 rounded-lg text-sm font-medium transition-all',
                isActive
                  ? 'bg-[#2250fc] text-white shadow-md'
                  : 'text-[#9aa5be] hover:bg-[#232a3b] hover:text-white'
              )}
            >
              <Icon size={18} className="shrink-0" />
              {/* No desktop colapsado, esconde label; no mobile sempre mostra */}
              <span className={cn('truncate', sidebarCollapsed ? 'md:hidden' : '')}>
                {label}
              </span>
            </NavLink>
          ))}
        </nav>

        {/* User + signout */}
        <div className="border-t border-[#232a3b] p-3">
          {profile && (
            <div className={cn('flex items-center gap-2 mb-3 px-1', sidebarCollapsed && 'md:hidden')}>
              <div
                className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0"
                style={{ backgroundColor: profile.color }}
              >
                {profile.full_name.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-white truncate">{profile.full_name}</p>
                <p className="text-[10px] text-[#728a9f] truncate capitalize">{profile.role}</p>
              </div>
            </div>
          )}
          <button
            onClick={() => { signOut(); navigate('/login'); }}
            className="flex items-center gap-3 px-3 py-2 w-full rounded-lg text-[#9aa5be] hover:bg-red-500/10 hover:text-red-400 transition-all text-sm"
          >
            <LogOut size={16} className="shrink-0" />
            <span className={cn(sidebarCollapsed ? 'md:hidden' : '')}>Sair</span>
          </button>
        </div>
      </aside>
    </>
  );
}
