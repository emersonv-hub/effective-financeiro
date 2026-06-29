import { Bell, Moon, Sun, Menu } from 'lucide-react';
import { useUIStore } from '@/stores/uiStore';
import { useAuthStore } from '@/stores/authStore';

interface HeaderProps { title: string; }

export function Header({ title }: HeaderProps) {
  const { darkMode, toggleDarkMode, toggleMobileMenu } = useUIStore();
  const { profile } = useAuthStore();

  return (
    <header className="h-14 bg-white dark:bg-card border-b border-border flex items-center justify-between px-4 md:px-6">
      <div className="flex items-center gap-3">
        {/* Hamburger — só mobile */}
        <button
          onClick={toggleMobileMenu}
          className="md:hidden p-2 rounded-lg hover:bg-muted transition-colors text-muted-foreground"
          aria-label="Abrir menu"
        >
          <Menu size={20} />
        </button>
        <h1 className="text-base md:text-lg font-semibold text-foreground">{title}</h1>
      </div>

      <div className="flex items-center gap-2 md:gap-3">
        <button
          onClick={toggleDarkMode}
          className="p-2 rounded-lg hover:bg-muted transition-colors text-muted-foreground"
        >
          {darkMode ? <Sun size={18} /> : <Moon size={18} />}
        </button>
        <button className="p-2 rounded-lg hover:bg-muted transition-colors text-muted-foreground">
          <Bell size={18} />
        </button>
        {profile && (
          <div className="flex items-center gap-2">
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold"
              style={{ backgroundColor: profile.color }}
            >
              {profile.full_name.charAt(0).toUpperCase()}
            </div>
            <span className="text-sm font-medium hidden md:block">
              {profile.full_name.split(' ')[0]}
            </span>
          </div>
        )}
      </div>
    </header>
  );
}
