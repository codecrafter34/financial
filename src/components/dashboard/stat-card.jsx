'use client';

import { cn } from '@/lib/utils.js';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

export function StatCard({ 
  title, 
  value, 
  change, 
  icon: Icon, 
  variant = 'default',
  className 
}) {
  const variantStyles = {
    default: 'from-blue-500/20 to-purple-500/20',
    success: 'from-green-500/20 to-emerald-500/20',
    danger: 'from-red-500/20 to-orange-500/20',
    warning: 'from-yellow-500/20 to-amber-500/20',
  };
  
  const iconBgStyles = {
    default: 'bg-blue-500/20 text-blue-400',
    success: 'bg-green-500/20 text-green-400',
    danger: 'bg-red-500/20 text-red-400',
    warning: 'bg-yellow-500/20 text-yellow-400',
  };
  
  const getTrendIcon = () => {
    if (change === undefined) return null;
    if (change > 0) return <TrendingUp className="w-4 h-4 text-green-400" />;
    if (change < 0) return <TrendingDown className="w-4 h-4 text-red-400" />;
    return <Minus className="w-4 h-4 text-gray-400" />;
  };
  
  return (
    <div className={cn(
      'glass-card glass-card-hover p-6',
      className
    )}>
      <div className={cn(
        'absolute inset-0 rounded-2xl bg-gradient-to-br opacity-50',
        variantStyles[variant]
      )} />
      
      <div className="relative">
        <div className="flex items-center justify-between mb-4">
          <p className="text-xs sm:text-sm text-[var(--text-secondary)]">{title}</p>
          {Icon && (
            <div className={cn('p-2 rounded-lg', iconBgStyles[variant])}>
              <Icon className="w-5 h-5" />
            </div>
          )}
        </div>
        
        <p className="text-xl sm:text-2xl md:text-3xl font-bold mb-2">{value}</p>
        
        {change !== undefined && (
          <div className="flex items-center gap-2">
            {getTrendIcon()}
            <span className={cn(
              'text-sm font-medium',
              change > 0 && 'text-green-400',
              change < 0 && 'text-red-400',
              change === 0 && 'text-gray-400'
            )}>
              {change > 0 ? '+' : ''}{change.toFixed(1)}%
            </span>
            <span className="text-xs text-[var(--text-muted)]">vs last period</span>
          </div>
        )}
      </div>
    </div>
  );
}

// Loading skeleton
export function StatCardSkeleton() {
  return (
    <div className="glass-card p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="skeleton w-24 h-4" />
        <div className="skeleton w-10 h-10 rounded-lg" />
      </div>
      <div className="skeleton w-32 h-8 mb-2" />
      <div className="skeleton w-20 h-4" />
    </div>
  );
}
