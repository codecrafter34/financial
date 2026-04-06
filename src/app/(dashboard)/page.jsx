'use client';

import { useSummary, useTrends, useHealthScore, useInsights, useEvents } from '@/lib/api';
import { useAuthStore } from '@/lib/store';
import { formatCurrency } from '@/lib/utils';
import { StatCard, StatCardSkeleton } from '@/components/dashboard/stat-card';
import { InsightsPanel, InsightCardSkeleton } from '@/components/dashboard/insight-card';
import { HealthScoreRing, HealthScoreRingSkeleton } from '@/components/dashboard/health-score-ring';
import { ActivityTimeline, ActivityTimelineSkeleton } from '@/components/dashboard/activity-timeline';
import { TrendChart, TrendChartSkeleton } from '@/components/charts/trend-chart';
import { CategoryChart, CategoryChartSkeleton } from '@/components/charts/category-chart';
import { Wallet, TrendingUp, TrendingDown, PiggyBank, RefreshCw } from 'lucide-react';
import { useState } from 'react';

export default function DashboardPage() {
  const [period, setPeriod] = useState('month');
  const { user, getEffectiveRole } = useAuthStore();
  const effectiveRole = getEffectiveRole();
  
  const { data: summary, isLoading: summaryLoading, refetch: refetchSummary } = useSummary(period);
  const { data: trends, isLoading: trendsLoading } = useTrends(period, 'day');
  const { data: healthScore, isLoading: healthLoading } = useHealthScore();
  const { data: insights, isLoading: insightsLoading } = useInsights();
  const { data: eventsData, isLoading: eventsLoading } = useEvents({ limit: 10 });
  
  const canViewInsights = effectiveRole === 'ANALYST' || effectiveRole === 'ADMIN';
  const canViewHealthScore = effectiveRole === 'ANALYST' || effectiveRole === 'ADMIN';
  
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">
            Welcome back, <span className="gradient-text">{user?.name}</span>
          </h1>
          <p className="text-[var(--text-secondary)] mt-1">
            {"Here's your financial overview"}
          </p>
        </div>
        
        <div className="flex items-center gap-4">
          {/* Period selector */}
          <div className="flex items-center gap-2 p-1 bg-[var(--surface-2)] rounded-lg">
            {['week', 'month', 'quarter', 'year'].map((p) => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  period === p
                    ? 'bg-[var(--primary)] text-white'
                    : 'text-[var(--text-secondary)] hover:text-white'
                }`}
              >
                {p.charAt(0).toUpperCase() + p.slice(1)}
              </button>
            ))}
          </div>
          
          <button
            onClick={() => refetchSummary()}
            className="p-2 rounded-lg bg-[var(--surface-2)] hover:bg-[var(--surface-3)] transition-colors"
          >
            <RefreshCw className="w-5 h-5" />
          </button>
        </div>
      </div>
      
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 stagger-children">
        {summaryLoading ? (
          <>
            <StatCardSkeleton />
            <StatCardSkeleton />
            <StatCardSkeleton />
            <StatCardSkeleton />
          </>
        ) : summary ? (
          <>
            <StatCard
              title="Total Income"
              value={formatCurrency(summary.totalIncome)}
              change={summary.periodComparison.incomeChange}
              icon={TrendingUp}
              variant="success"
            />
            <StatCard
              title="Total Expenses"
              value={formatCurrency(summary.totalExpense)}
              change={summary.periodComparison.expenseChange}
              icon={TrendingDown}
              variant="danger"
            />
            <StatCard
              title="Net Balance"
              value={formatCurrency(summary.netBalance)}
              icon={Wallet}
              variant={summary.netBalance >= 0 ? 'success' : 'danger'}
            />
            <StatCard
              title="Transactions"
              value={summary.transactionCount.toString()}
              icon={PiggyBank}
              variant="default"
            />
          </>
        ) : null}
      </div>
      
      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          {trendsLoading ? (
            <TrendChartSkeleton />
          ) : trends ? (
            <TrendChart data={trends} />
          ) : null}
        </div>
        
        <div>
          {summaryLoading ? (
            <CategoryChartSkeleton />
          ) : summary?.categoryBreakdown ? (
            <CategoryChart data={summary.categoryBreakdown} />
          ) : null}
        </div>
      </div>
      
      {/* Insights and Health Score (Analyst/Admin only) */}
      {canViewInsights && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Insights */}
          <div className="glass-card p-6">
            <h3 className="text-lg font-semibold mb-6">AI Insights</h3>
            {insightsLoading ? (
              <div className="space-y-4">
                <InsightCardSkeleton />
                <InsightCardSkeleton />
              </div>
            ) : insights ? (
              <InsightsPanel insights={insights} maxDisplay={3} />
            ) : null}
          </div>
          
          {/* Health Score */}
          {canViewHealthScore && (
            healthLoading ? (
              <HealthScoreRingSkeleton />
            ) : healthScore ? (
              <HealthScoreRing healthScore={healthScore} />
            ) : null
          )}
        </div>
      )}
      
      {/* Activity Timeline */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {eventsLoading ? (
          <ActivityTimelineSkeleton />
        ) : eventsData?.events ? (
          <ActivityTimeline events={eventsData.events} />
        ) : null}
        
        {/* Recent Transactions Summary */}
        {summary?.recentActivity && summary.recentActivity.length > 0 && (
          <div className="glass-card p-6">
            <h3 className="text-lg font-semibold mb-6">Recent Activity</h3>
            <div className="space-y-4">
              {summary.recentActivity.slice(0, 5).map((activity, i) => (
                <div 
                  key={activity.id}
                  className="flex items-center justify-between p-3 rounded-lg bg-[var(--surface-2)] animate-fade-in"
                  style={{ animationDelay: `${i * 0.05}s` }}
                >
                  <div>
                    <p className="font-medium text-sm">{activity.action}</p>
                    <p className="text-xs text-[var(--text-muted)]">{activity.description}</p>
                  </div>
                  {activity.amount && (
                    <span className={`font-semibold ${
                      activity.action.includes('Income') ? 'text-green-400' : 'text-red-400'
                    }`}>
                      {activity.action.includes('Income') ? '+' : '-'}
                      {formatCurrency(activity.amount)}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
