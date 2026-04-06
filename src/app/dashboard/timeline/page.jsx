'use client';

import { useEvents } from '@/lib/api';
import { useAuthStore } from '@/lib/store';
import { formatDate, formatRelativeTime, cn } from '@/lib/utils';
import { useState } from 'react';
import {
  Clock,
  Filter,
  ChevronLeft,
  ChevronRight,
  Calendar,
  User,
  LogIn,
  DollarSign,
  AlertTriangle,
  Lightbulb,
} from 'lucide-react';
import { EventAction } from '@prisma/client';

const actionIcons = {
  USER_LOGIN: LogIn,
  USER_LOGOUT: LogIn,
  USER_REGISTERED: User,
  TRANSACTION_CREATED: DollarSign,
  TRANSACTION_UPDATED: DollarSign,
  TRANSACTION_DELETED: DollarSign,
  ANOMALY_DETECTED: AlertTriangle,
  INSIGHT_GENERATED: Lightbulb,
};

const actionColors = {
  USER_LOGIN: 'bg-green-500/20 text-green-400 border-green-500/30',
  USER_LOGOUT: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
  USER_REGISTERED: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  TRANSACTION_CREATED: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  TRANSACTION_UPDATED: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  TRANSACTION_DELETED: 'bg-red-500/20 text-red-400 border-red-500/30',
  ANOMALY_DETECTED: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
  INSIGHT_GENERATED: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
};

export default function TimelinePage() {
  const { getEffectiveRole } = useAuthStore();
  const effectiveRole = getEffectiveRole();
  
  const [page, setPage] = useState(1);
  const [filterAction, setFilterAction] = useState('');
  
  const { data, isLoading } = useEvents({ page, limit: 30 });
  
  // Check permissions
  if (effectiveRole === 'VIEWER') {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <Clock className="w-16 h-16 mx-auto mb-4 text-[var(--text-muted)]" />
          <h2 className="text-2xl font-bold mb-2">Timeline Access Restricted</h2>
          <p className="text-[var(--text-secondary)]">
            Upgrade to Analyst role to access the activity timeline.
          </p>
        </div>
      </div>
    );
  }
  
  // Group events by date
  const groupedEvents = data?.events.reduce((groups, event) => {
    const date = new Date(event.createdAt).toLocaleDateString();
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(event);
    return groups;
  }, {}) || {};
  
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Activity Timeline</h1>
          <p className="text-[var(--text-secondary)] mt-1">
            Track all system events and activities
          </p>
        </div>
        
        <div className="flex items-center gap-4">
          <select
            value={filterAction}
            onChange={(e) => setFilterAction(e.target.value)}
            className="input-field w-auto"
          >
            <option value="">All Actions</option>
            <option value="USER">User Events</option>
            <option value="TRANSACTION">Transaction Events</option>
            <option value="ANOMALY">Anomaly Events</option>
          </select>
        </div>
      </div>
      
      {/* Timeline */}
      <div className="relative">
        {/* Timeline line */}
        <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-[var(--border)]" />
        
        {isLoading ? (
          <div className="space-y-8">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-start gap-6 animate-pulse">
                <div className="w-16 h-16 rounded-full bg-[var(--surface-2)]" />
                <div className="flex-1 glass-card p-4">
                  <div className="skeleton w-48 h-5 mb-2" />
                  <div className="skeleton w-full h-4 mb-1" />
                  <div className="skeleton w-24 h-3" />
                </div>
              </div>
            ))}
          </div>
        ) : Object.keys(groupedEvents).length === 0 ? (
          <div className="text-center py-12">
            <Clock className="w-12 h-12 mx-auto mb-4 text-[var(--text-muted)]" />
            <p className="text-[var(--text-secondary)]">No events found</p>
          </div>
        ) : (
          <div className="space-y-8">
            {Object.entries(groupedEvents).map(([date, events]) => (
              <div key={date}>
                {/* Date header */}
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-16 h-16 rounded-full bg-[var(--surface-2)] border border-[var(--border)] flex items-center justify-center z-10">
                    <Calendar className="w-6 h-6 text-[var(--primary)]" />
                  </div>
                  <h3 className="text-lg font-semibold">{date}</h3>
                </div>
                
                {/* Events for this date */}
                <div className="ml-20 space-y-4">
                  {events.map((event, i) => {
                    const Icon = actionIcons[event.action] || Clock;
                    const colorClass = actionColors[event.action] || 'bg-gray-500/20 text-gray-400 border-gray-500/30';
                    
                    // Filter
                    if (filterAction && !event.action.startsWith(filterAction)) {
                      return null;
                    }
                    
                    return (
                      <div 
                        key={event.id}
                        className={cn(
                          'glass-card p-4 border animate-fade-in',
                          colorClass.split(' ')[2]
                        )}
                        style={{ animationDelay: `${i * 0.05}s` }}
                      >
                        <div className="flex items-start gap-4">
                          <div className={cn('p-2 rounded-lg', colorClass.split(' ').slice(0, 2).join(' '))}>
                            <Icon className="w-5 h-5" />
                          </div>
                          
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-1">
                              <h4 className="font-medium">
                                {event.description || event.action.replace(/_/g, ' ')}
                              </h4>
                              <span className="text-xs text-[var(--text-muted)]">
                                {formatRelativeTime(event.createdAt)}
                              </span>
                            </div>
                            
                            {event.userName && (
                              <p className="text-sm text-[var(--text-secondary)] flex items-center gap-1">
                                <User className="w-3 h-3" />
                                {event.userName}
                              </p>
                            )}
                            
                            {event.payload && Object.keys(event.payload).length > 0 && (
                              <div className="mt-2 p-2 rounded-lg bg-[var(--surface-1)] text-xs font-mono text-[var(--text-muted)]">
                                {JSON.stringify(event.payload, null, 2)}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
        
        {/* Pagination */}
        {data && data.total > 30 && (
          <div className="flex items-center justify-center gap-4 mt-8">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="btn-secondary flex items-center gap-2"
            >
              <ChevronLeft className="w-4 h-4" />
              Previous
            </button>
            <span className="text-[var(--text-secondary)]">
              Page {page} of {Math.ceil(data.total / 30)}
            </span>
            <button
              onClick={() => setPage(p => p + 1)}
              disabled={page * 30 >= data.total}
              className="btn-secondary flex items-center gap-2"
            >
              Next
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
