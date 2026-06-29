import { Outlet, useLocation } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { useUIStore } from '@/stores/uiStore';
import { cn } from '@/lib/utils';

const pageTitles: Record<string, string> = {
  '/dashboard':     'Dashboard',
  '/agenda':        'Agenda',
  '/pacientes':     'Pacientes',
  '/presenca':      'Controle de Presença',
  '/financeiro':    'Financeiro',
  '/relatorios':    'Relatórios',
  '/contratos':     'Contratos',
  '/configuracoes': 'Configurações',
};

export function Layout() {
  const { sidebarCollapsed } = useUIStore();
  const location = useLocation();
  const title = Object.entries(pageTitles).find(([path]) => location.pathname.startsWith(path))?.[1] ?? 'FisioManager';

  return (
    <div className="min-h-screen bg-background flex">
      <Sidebar />
      {/* Mobile: sem margem (sidebar é overlay). Desktop: margem da sidebar fixa */}
      <div
        className={cn(
          'flex-1 flex flex-col min-h-screen transition-all duration-300',
          sidebarCollapsed ? 'md:ml-16' : 'md:ml-56',
        )}
      >
        <Header title={title} />
        <main className="flex-1 p-4 md:p-6 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
