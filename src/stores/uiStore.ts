import { create } from 'zustand';

interface UIState {
  sidebarCollapsed: boolean;
  mobileMenuOpen: boolean;
  darkMode: boolean;
  toggleSidebar: () => void;
  toggleMobileMenu: () => void;
  closeMobileMenu: () => void;
  toggleDarkMode: () => void;
}

export const useUIStore = create<UIState>((set, get) => ({
  sidebarCollapsed: false,
  mobileMenuOpen: false,
  darkMode: false,

  toggleSidebar: () => set({ sidebarCollapsed: !get().sidebarCollapsed }),

  toggleMobileMenu: () => set({ mobileMenuOpen: !get().mobileMenuOpen }),

  closeMobileMenu: () => set({ mobileMenuOpen: false }),

  toggleDarkMode: () => {
    const next = !get().darkMode;
    set({ darkMode: next });
    document.documentElement.classList.toggle('dark', next);
  },
}));
