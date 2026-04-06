'use client';

import { useUsers } from '@/lib/api';
import { useAuthStore } from '@/lib/store';
import { formatDate, cn } from '@/lib/utils';
import { useState } from 'react';
import {
  Users,
  Shield,
  Search,
  ChevronLeft,
  ChevronRight,
  UserCog,
  ShieldCheck,
  ShieldAlert,
} from 'lucide-react';
import { Role, UserStatus } from '@prisma/client';

const roleIcons = {
  VIEWER: ShieldAlert,
  ANALYST: Shield,
  ADMIN: ShieldCheck,
};

const roleColors = {
  VIEWER: 'bg-blue-500/20 text-blue-400',
  ANALYST: 'bg-purple-500/20 text-purple-400',
  ADMIN: 'bg-red-500/20 text-red-400',
};

const statusColors = {
  ACTIVE: 'bg-green-500/20 text-green-400',
  INACTIVE: 'bg-gray-500/20 text-gray-400',
  SUSPENDED: 'bg-red-500/20 text-red-400',
};

export default function AdminPage() {
  const { user: currentUser, getEffectiveRole } = useAuthStore();
  const effectiveRole = getEffectiveRole();
  
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  
  const { data, isLoading } = useUsers(page, 20);
  
  // Check permissions
  if (effectiveRole !== 'ADMIN') {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <Shield className="w-16 h-16 mx-auto mb-4 text-[var(--text-muted)]" />
          <h2 className="text-2xl font-bold mb-2">Admin Access Required</h2>
          <p className="text-[var(--text-secondary)]">
            Only administrators can access user management.
          </p>
        </div>
      </div>
    );
  }
  
  const filteredUsers = data?.users.filter(user => 
    !search || 
    user.name.toLowerCase().includes(search.toLowerCase()) ||
    user.email.toLowerCase().includes(search.toLowerCase())
  ) || [];
  
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">User Management</h1>
          <p className="text-[var(--text-secondary)] mt-1">
            Manage users and their access levels
          </p>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="glass-card px-4 py-2 flex items-center gap-2">
            <Users className="w-5 h-5 text-[var(--primary)]" />
            <span className="font-medium">{data?.total || 0}</span>
            <span className="text-[var(--text-muted)]">Total Users</span>
          </div>
        </div>
      </div>
      
      {/* Search */}
      <div className="glass-card p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--text-muted)]" />
          <input
            type="text"
            placeholder="Search users by name or email..."
            className="input-field pl-10"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>
      
      {/* Users Table */}
      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[var(--border)]">
                <th className="text-left p-4 text-sm font-medium text-[var(--text-secondary)]">User</th>
                <th className="text-left p-4 text-sm font-medium text-[var(--text-secondary)]">Role</th>
                <th className="text-left p-4 text-sm font-medium text-[var(--text-secondary)]">Status</th>
                <th className="text-left p-4 text-sm font-medium text-[var(--text-secondary)]">Last Active</th>
                <th className="text-left p-4 text-sm font-medium text-[var(--text-secondary)]">Last Action</th>
                <th className="text-left p-4 text-sm font-medium text-[var(--text-secondary)]">Joined</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="border-b border-[var(--border)]">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="skeleton w-10 h-10 rounded-full" />
                        <div>
                          <div className="skeleton w-32 h-4 mb-1" />
                          <div className="skeleton w-40 h-3" />
                        </div>
                      </div>
                    </td>
                    <td className="p-4"><div className="skeleton w-20 h-6" /></td>
                    <td className="p-4"><div className="skeleton w-16 h-6" /></td>
                    <td className="p-4"><div className="skeleton w-24 h-4" /></td>
                    <td className="p-4"><div className="skeleton w-28 h-4" /></td>
                    <td className="p-4"><div className="skeleton w-20 h-4" /></td>
                  </tr>
                ))
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-[var(--text-muted)]">
                    No users found
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user, i) => {
                  const RoleIcon = roleIcons[user.role];
                  const isCurrentUser = user.id === currentUser?.id;
                  
                  return (
                    <tr 
                      key={user.id}
                      className={cn(
                        'border-b border-[var(--border)] hover:bg-[var(--surface-2)] transition-colors animate-fade-in',
                        isCurrentUser && 'bg-[var(--primary-light)]'
                      )}
                      style={{ animationDelay: `${i * 0.02}s` }}
                    >
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-medium">
                            {user.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-medium flex items-center gap-2">
                              {user.name}
                              {isCurrentUser && (
                                <span className="text-xs text-[var(--primary)]">(You)</span>
                              )}
                            </p>
                            <p className="text-sm text-[var(--text-muted)]">{user.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <span className={cn('badge flex items-center gap-1 w-fit', roleColors[user.role])}>
                          <RoleIcon className="w-3 h-3" />
                          {user.role}
                        </span>
                      </td>
                      <td className="p-4">
                        <span className={cn('badge', statusColors[user.status])}>
                          {user.status}
                        </span>
                      </td>
                      <td className="p-4 text-sm text-[var(--text-secondary)]">
                        {user.lastActiveAt 
                          ? formatDate(user.lastActiveAt, { hour: '2-digit', minute: '2-digit' })
                          : 'Never'}
                      </td>
                      <td className="p-4 text-sm text-[var(--text-secondary)]">
                        {user.lastAction || '-'}
                      </td>
                      <td className="p-4 text-sm text-[var(--text-secondary)]">
                        {formatDate(user.createdAt)}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination */}
        {data && data.total > 20 && (
          <div className="flex items-center justify-between p-4 border-t border-[var(--border)]">
            <p className="text-sm text-[var(--text-muted)]">
              Showing {(page - 1) * 20 + 1} to {Math.min(page * 20, data.total)} of {data.total}
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="p-2 rounded-lg hover:bg-[var(--surface-2)] disabled:opacity-50"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <span className="px-3 py-1 bg-[var(--surface-2)] rounded-lg text-sm">
                {page}
              </span>
              <button
                onClick={() => setPage(p => p + 1)}
                disabled={page * 20 >= data.total}
                className="p-2 rounded-lg hover:bg-[var(--surface-2)] disabled:opacity-50"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}
      </div>
      
      {/* Role permissions info */}
      <div className="glass-card p-6">
        <h3 className="text-lg font-semibold mb-4">Role Permissions</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-4 rounded-lg bg-blue-500/10 border border-blue-500/20">
            <div className="flex items-center gap-2 mb-3">
              <ShieldAlert className="w-5 h-5 text-blue-400" />
              <h4 className="font-medium text-blue-400">Viewer</h4>
            </div>
            <ul className="text-sm text-[var(--text-secondary)] space-y-1">
              <li>• View dashboard data</li>
              <li>• View own transactions</li>
              <li>• Basic analytics only</li>
            </ul>
          </div>
          
          <div className="p-4 rounded-lg bg-purple-500/10 border border-purple-500/20">
            <div className="flex items-center gap-2 mb-3">
              <Shield className="w-5 h-5 text-purple-400" />
              <h4 className="font-medium text-purple-400">Analyst</h4>
            </div>
            <ul className="text-sm text-[var(--text-secondary)] space-y-1">
              <li>• All Viewer permissions</li>
              <li>• Access AI insights</li>
              <li>• View trends & health score</li>
              <li>• Access activity timeline</li>
            </ul>
          </div>
          
          <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/20">
            <div className="flex items-center gap-2 mb-3">
              <ShieldCheck className="w-5 h-5 text-red-400" />
              <h4 className="font-medium text-red-400">Admin</h4>
            </div>
            <ul className="text-sm text-[var(--text-secondary)] space-y-1">
              <li>• All Analyst permissions</li>
              <li>• Create/edit/delete transactions</li>
              <li>• Manage users</li>
              <li>• View as other roles</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
