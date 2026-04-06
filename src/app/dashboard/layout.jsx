'use client';

import { Sidebar } from '@/components/dashboard/sidebar';
import { useAuthStore } from '@/lib/store';
import { useTheme } from '@/components/theme-provider';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect } from 'react';
import { Sun, Moon, Bell, Search } from 'lucide-react';

export default function DashboardLayout({ children }) {
  const hasHydrated = useAuthStore((s) => s._hasHydrated);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const user = useAuthStore((s) => s.user);
  const router = useRouter();
  const pathname = usePathname();
  const { theme, toggleTheme } = useTheme();
  
  useEffect(() => {
    if (hasHydrated && !isAuthenticated) {
      router.push('/login');
    }
  }, [hasHydrated, isAuthenticated, router]);
  
  // Show loading while hydrating from localStorage
  if (!hasHydrated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--background)]">
        <div className="text-center">
          <div className="animate-spin w-10 h-10 border-3 border-[var(--primary)] border-t-transparent rounded-full mx-auto mb-4" />
          <p className="text-[var(--text-secondary)]">Loading...</p>
        </div>
      </div>
    );
  }
  
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--background)]">
        <div className="text-center">
          <div className="animate-spin w-10 h-10 border-3 border-[var(--primary)] border-t-transparent rounded-full mx-auto mb-4" />
          <p className="text-[var(--text-secondary)]">Redirecting to login...</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-[var(--background)]">
      <Sidebar />
      
      {/* Top Header Bar */}
      <header className="fixed top-0 left-64 right-0 h-16 glass-card rounded-none border-b border-[var(--border)] z-40 flex items-center justify-between px-6">
        {/* Search */}
        <div className="relative w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--text-muted)]" />
          <input
            type="text"
            placeholder="Search transactions, analytics..."
            className="input-field pl-10 py-2 bg-[var(--surface-2)]"
          />
        </div>
        
        {/* Right Side */}
        <div className="flex items-center gap-3">
          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="p-2.5 rounded-xl bg-[var(--surface-2)] border border-[var(--border)] hover:border-[var(--primary)] transition-all btn-3d"
            title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {theme === 'dark' ? (
              <Sun className="w-5 h-5 text-yellow-500" />
            ) : (
              <Moon className="w-5 h-5 text-indigo-600" />
            )}
          </button>
          
          {/* Notifications */}
          <button className="p-2.5 rounded-xl bg-[var(--surface-2)] border border-[var(--border)] hover:border-[var(--primary)] transition-all relative">
            <Bell className="w-5 h-5 text-[var(--text-secondary)]" />
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-[10px] text-white flex items-center justify-center">3</span>
          </button>
          
          {/* User Info */}
          <div className="flex items-center gap-3 pl-3 border-l border-[var(--border)]">
            <div className="text-right">
              <p className="text-sm font-medium">{user?.name}</p>
              <p className="text-xs text-[var(--text-muted)]">{user?.role}</p>
            </div>
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-medium">
              {user?.name?.charAt(0).toUpperCase() || 'U'}
            </div>
          </div>
        </div>
      </header>
      
      <main className="ml-64 pt-16 p-8">
        <div key={pathname} className="page-transition">
          {children}
        </div>
      </main>
    </div>
  );
}
