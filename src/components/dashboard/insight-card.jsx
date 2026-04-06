'use client';

import { cn } from '@/lib/utils.js';
import { 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle, 
  Lightbulb, 
  Trophy,
  Clock
} from 'lucide-react';
import { formatRelativeTime } from '@/lib/utils.js';

const iconMap = {
  spending_spike: TrendingUp,
  category_anomaly: AlertTriangle,
  pattern: Lightbulb,
  recommendation: Lightbulb,
  achievement: Trophy,
};

const severityStyles = {
  info: {
    bg: 'bg-blue-500/10',
    border: 'border-blue-500/20',
    icon: 'text-blue-400',
    badge: 'badge-info',
  },
  warning: {
    bg: 'bg-yellow-500/10',
    border: 'border-yellow-500/20',
    icon: 'text-yellow-400',
    badge: 'badge-warning',
  },
  critical: {
    bg: 'bg-red-500/10',
    border: 'border-red-500/20',
    icon: 'text-red-400',
    badge: 'badge-danger',
  },
  success: {
    bg: 'bg-green-500/10',
    border: 'border-green-500/20',
    icon: 'text-green-400',
    badge: 'badge-success',
  },
};

export function InsightCard({ insight, className }) {
  const Icon = iconMap[insight.type] || Lightbulb;
  const styles = severityStyles[insight.severity];
  
  return (
    <div className={cn(
      'glass-card p-5 border',
      styles.bg,
      styles.border,
      'animate-fade-in',
      className
    )}>
      <div className="flex items-start gap-4">
        <div className={cn('p-2 rounded-lg', styles.bg)}>
          <Icon className={cn('w-5 h-5', styles.icon)} />
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h4 className="font-semibold">{insight.title}</h4>
            <span className={cn('badge', styles.badge)}>
              {insight.severity}
            </span>
          </div>
          
          <p className="text-sm text-[var(--text-secondary)] mb-3">
            {insight.description}
          </p>
          
          <div className="flex items-center gap-2 text-xs text-[var(--text-muted)]">
            <Clock className="w-3 h-3" />
            <span>{formatRelativeTime(insight.generatedAt)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// Multiple insights container
export function InsightsPanel({ insights, maxDisplay = 5, className }) {
  const displayInsights = insights.slice(0, maxDisplay);
  
  if (insights.length === 0) {
    return (
      <div className={cn('glass-card p-6 text-center', className)}>
        <Lightbulb className="w-12 h-12 mx-auto mb-3 text-[var(--text-muted)]" />
        <p className="text-[var(--text-secondary)]">No insights available yet</p>
        <p className="text-sm text-[var(--text-muted)]">
          Keep logging transactions to generate insights
        </p>
      </div>
    );
  }
  
  return (
    <div className={cn('space-y-4 stagger-children', className)}>
      {displayInsights.map((insight) => (
        <InsightCard key={insight.id} insight={insight} />
      ))}
      
      {insights.length > maxDisplay && (
        <p className="text-sm text-center text-[var(--text-muted)]">
          +{insights.length - maxDisplay} more insights
        </p>
      )}
    </div>
  );
}

// Loading skeleton
export function InsightCardSkeleton() {
  return (
    <div className="glass-card p-5">
      <div className="flex items-start gap-4">
        <div className="skeleton w-10 h-10 rounded-lg" />
        <div className="flex-1">
          <div className="skeleton w-48 h-5 mb-2" />
          <div className="skeleton w-full h-4 mb-1" />
          <div className="skeleton w-3/4 h-4" />
        </div>
      </div>
    </div>
  );
}
