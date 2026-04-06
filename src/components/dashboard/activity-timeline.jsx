'use client';

import { cn, formatRelativeTime } from '@/lib/utils.js';
import { 
  LogIn, 
  LogOut, 
  UserPlus, 
  UserCog, 
  DollarSign, 
  Edit, 
  Trash2, 
  RotateCcw,
  AlertTriangle,
  Lightbulb,
  Heart,
  ShieldAlert,
  Eye
} from 'lucide-react';

const actionIcons = {
  USER_LOGIN: LogIn,
  USER_LOGOUT: LogOut,
  USER_REGISTERED: UserPlus,
  USER_CREATED: UserPlus,
  USER_UPDATED: UserCog,
  USER_DELETED: Trash2,
  USER_ROLE_CHANGED: UserCog,
  USER_STATUS_CHANGED: UserCog,
  TRANSACTION_CREATED: DollarSign,
  TRANSACTION_UPDATED: Edit,
  TRANSACTION_DELETED: Trash2,
  TRANSACTION_RESTORED: RotateCcw,
  ANOMALY_DETECTED: AlertTriangle,
  INSIGHT_GENERATED: Lightbulb,
  HEALTH_SCORE_CALCULATED: Heart,
  PERMISSION_DENIED: ShieldAlert,
  VIEW_AS_ACTIVATED: Eye,
};

const actionColors = {
  USER_LOGIN: 'bg-green-500/20 text-green-400',
  USER_LOGOUT: 'bg-gray-500/20 text-gray-400',
  USER_REGISTERED: 'bg-blue-500/20 text-blue-400',
  USER_CREATED: 'bg-blue-500/20 text-blue-400',
  USER_UPDATED: 'bg-purple-500/20 text-purple-400',
  USER_DELETED: 'bg-red-500/20 text-red-400',
  USER_ROLE_CHANGED: 'bg-purple-500/20 text-purple-400',
  USER_STATUS_CHANGED: 'bg-yellow-500/20 text-yellow-400',
  TRANSACTION_CREATED: 'bg-green-500/20 text-green-400',
  TRANSACTION_UPDATED: 'bg-blue-500/20 text-blue-400',
  TRANSACTION_DELETED: 'bg-red-500/20 text-red-400',
  TRANSACTION_RESTORED: 'bg-cyan-500/20 text-cyan-400',
  ANOMALY_DETECTED: 'bg-orange-500/20 text-orange-400',
  INSIGHT_GENERATED: 'bg-yellow-500/20 text-yellow-400',
  HEALTH_SCORE_CALCULATED: 'bg-pink-500/20 text-pink-400',
  PERMISSION_DENIED: 'bg-red-500/20 text-red-400',
  VIEW_AS_ACTIVATED: 'bg-purple-500/20 text-purple-400',
};

export function ActivityTimeline({ events, maxDisplay = 10, className }) {
  const displayEvents = events.slice(0, maxDisplay);
  
  if (events.length === 0) {
    return (
      <div className={cn('glass-card p-6 text-center', className)}>
        <p className="text-[var(--text-secondary)]">No activity yet</p>
      </div>
    );
  }
  
  return (
    <div className={cn('glass-card p-6', className)}>
      <h3 className="text-lg font-semibold mb-6">Activity Timeline</h3>
      
      <div className="space-y-1">
        {displayEvents.map((event, index) => {
          const Icon = actionIcons[event.action] || DollarSign;
          const colorClass = actionColors[event.action] || 'bg-gray-500/20 text-gray-400';
          
          return (
            <div 
              key={event.id} 
              className="timeline-item pb-6 animate-fade-in"
              style={{ animationDelay: `${index * 0.05}s` }}
            >
              <div 
                className="absolute left-0 top-0.5 w-3 h-3 rounded-full flex items-center justify-center"
                style={{ 
                  background: 'var(--primary)',
                  boxShadow: '0 0 10px rgba(59, 130, 246, 0.5)' 
                }}
              />
              
              <div className="flex items-start gap-3">
                <div className={cn('p-2 rounded-lg flex-shrink-0', colorClass)}>
                  <Icon className="w-4 h-4" />
                </div>
                
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium">
                    {event.description || event.action.replace(/_/g, ' ')}
                  </p>
                  
                  <div className="flex items-center gap-3 mt-1">
                    {event.userName && (
                      <span className="text-xs text-[var(--text-muted)]">
                        by {event.userName}
                      </span>
                    )}
                    <span className="text-xs text-[var(--text-muted)]">
                      {formatRelativeTime(event.createdAt)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      
      {events.length > maxDisplay && (
        <p className="text-sm text-center text-[var(--text-muted)] pt-4 border-t border-[var(--border)]">
          +{events.length - maxDisplay} more events
        </p>
      )}
    </div>
  );
}

// Loading skeleton
export function ActivityTimelineSkeleton() {
  return (
    <div className="glass-card p-6">
      <div className="skeleton w-40 h-6 mb-6" />
      <div className="space-y-4">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="flex items-start gap-3">
            <div className="skeleton w-10 h-10 rounded-lg" />
            <div className="flex-1">
              <div className="skeleton w-3/4 h-4 mb-2" />
              <div className="skeleton w-1/2 h-3" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
