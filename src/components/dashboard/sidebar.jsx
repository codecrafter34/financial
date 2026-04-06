'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  ArrowLeftRight, 
  TrendingUp, 
  Clock, 
  Users, 
  LogOut,
  ChevronDown,
  Eye,
  Shield
} from 'lucide-react';
import { useAuthStore } from '@/lib/store.js';
import { cn } from '@/lib/utils.js';
import { useState } from 'react';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard, roles: ['VIEWER', 'ANALYST', 'ADMIN'] },
  { name: 'Transactions', href: '/dashboard/transactions', icon: ArrowLeftRight, roles: ['VIEWER', 'ANALYST', 'ADMIN'] },
  { name: 'Analytics', href: '/dashboard/analytics', icon: TrendingUp, roles: ['ANALYST', 'ADMIN'] },
  { name: 'Timeline', href: '/dashboard/timeline', icon: Clock, roles: ['ANALYST', 'ADMIN'] },
  { name: 'Users', href: '/dashboard/admin', icon: Users, roles: ['ADMIN'] },
];

const roleColors = {
  VIEWER: 'bg-blue-500/20 text-blue-400',
  ANALYST: 'bg-purple-500/20 text-purple-400',
  ADMIN: 'bg-red-500/20 text-red-400',
};

export function Sidebar() {
  const pathname = usePathname();
  const { user, logout, viewAsRole, setViewAsRole, getEffectiveRole } = useAuthStore();
  const [showViewAs, setShowViewAs] = useState(false);
  
  const effectiveRole = getEffectiveRole();
  
  const filteredNavigation = navigation.filter(
    (item) => effectiveRole && item.roles.includes(effectiveRole)
  );
  
  return (
    <aside className="fixed left-0 top-0 h-full w-64 glass-card rounded-none border-r border-[var(--border)] flex flex-col z-50">
      {/* Logo */}
      <div className="p-6 border-b border-[var(--border)]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
            <Shield className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="font-bold text-lg gradient-text">IFCS</h1>
            <p className="text-xs text-[var(--text-muted)]">Finance Control</p>
          </div>
        </div>
      </div>
      
      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1">
        {filteredNavigation.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                'sidebar-link',
                isActive && 'active'
              )}
            >
              <item.icon className="w-5 h-5" />
              <span>{item.name}</span>
            </Link>
          );
        })}
      </nav>
      
      {/* View As (Admin only) */}
      {user?.role === 'ADMIN' && (
        <div className="p-4 border-t border-[var(--border)]">
          <button
            onClick={() => setShowViewAs(!showViewAs)}
            className="w-full flex items-center justify-between px-3 py-2 rounded-lg bg-[var(--surface-2)] text-sm"
          >
            <div className="flex items-center gap-2">
              <Eye className="w-4 h-4 text-[var(--text-muted)]" />
              <span>View as: {viewAsRole || 'Admin'}</span>
            </div>
            <ChevronDown className={cn('w-4 h-4 transition-transform', showViewAs && 'rotate-180')} />
          </button>
          
          {showViewAs && (
            <div className="mt-2 space-y-1 animate-fade-in">
              {['ADMIN', 'ANALYST', 'VIEWER'].map((role) => (
                <button
                  key={role}
                  onClick={() => {
                    setViewAsRole(role === 'ADMIN' ? null : role);
                    setShowViewAs(false);
                  }}
                  className={cn(
                    'w-full text-left px-3 py-2 rounded-lg text-sm transition-colors',
                    (viewAsRole === role || (!viewAsRole && role === 'ADMIN'))
                      ? 'bg-[var(--primary-light)] text-[var(--primary)]'
                      : 'hover:bg-[var(--surface-3)]'
                  )}
                >
                  {role}
                </button>
              ))}
            </div>
          )}
        </div>
      )}
      
      {/* User info */}
      <div className="p-4 border-t border-[var(--border)]">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-medium">
            {user?.name?.charAt(0).toUpperCase() || 'U'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-medium truncate">{user?.name}</p>
            <span className={cn('badge text-xs', roleColors[user?.role || 'VIEWER'])}>
              {viewAsRole ? `${viewAsRole} (simulated)` : user?.role}
            </span>
          </div>
        </div>
        <button
          onClick={logout}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-[var(--surface-2)] text-[var(--text-secondary)] hover:text-[var(--danger)] hover:bg-red-500/10 transition-colors"
        >
          <LogOut className="w-4 h-4" />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
}
