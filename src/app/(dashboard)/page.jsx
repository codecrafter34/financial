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
import { Wallet, TrendingUp, TrendingDown, PiggyBank, RefreshCw, Lock, Eye, Crown } from 'lucide-react';
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
  const canEditTransactions = effectiveRole === 'ANALYST' || effectiveRole === 'ADMIN';
  
  // Role badge
  const getRoleBadgeColor = () => {
    switch(effectiveRole) {
      case 'ADMIN': return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
      case 'ANALYST': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'VIEWER': return 'bg-green-500/20 text-green-400 border-green-500/30';
      default: return 'bg-gray-500/20 text-gray-400';
    }
  };
  
  const getRoleIcon = () => {
    switch(effectiveRole) {
      case 'ADMIN': return Crown;
      case 'ANALYST': return Eye;
      case 'VIEWER': return Lock;
      default: return null;
    }
  };
  
  const RoleIcon = getRoleIcon();

  return (
    <div className="space-y-8">
      {/* Header with Role Badge */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-3xl font-bold">
              Welcome back, <span className="gradient-text">{user?.name}</span>
            </h1>
            {RoleIcon && (
              <div className={`flex items-center gap-2 px-3 py-1 rounded-full border ${getRoleBadgeColor()}`}>
                <RoleIcon className="w-4 h-4" />
                <span className="text-sm font-medium">{effectiveRole}</span>
              </div>
            )}
          </div>
          <p className="text-[var(--text-secondary)] mt-1">
            {effectiveRole === 'VIEWER' && "Read-only access to transactions and basic summary"}
            {effectiveRole === 'ANALYST' && "Full analytics, insights, trends, and health scores"}
            {effectiveRole === 'ADMIN' && "Full CRUD access, user management, and \"View As\" mode"}
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
            title="Refresh data"
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
      
      {/* AI Insights and Health Score (Analyst/Admin only) */}
      {canViewInsights && (
        <div>
          {/* Features Available for {ANALYST/ADMIN} */}
          <div className="mb-6">
            <h2 className="text-2xl font-bold mb-4">
              🤖 AI-Powered Insights & 📊 Financial Health
            </h2>
            <p className="text-[var(--text-secondary)] mb-6">
              Advanced analytics powered by rule-based AI engine. Includes anomaly detection using z-score and percentile analysis, spending insights with week-over-week comparisons, category analysis, and trend predictions.
            </p>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Insights */}
            <div className="glass-card p-6">
              <h3 className="text-lg font-semibold mb-2">💡 AI-Generated Insights</h3>
              <p className="text-sm text-[var(--text-secondary)] mb-4">
                "Your expenses increased 18% this week" • Category analysis • Trend predictions
              </p>
              {insightsLoading ? (
                <div className="space-y-4">
                  <InsightCardSkeleton />
                  <InsightCardSkeleton />
                </div>
              ) : insights && insights.length > 0 ? (
                <InsightsPanel insights={insights} maxDisplay={3} />
              ) : (
                <div className="text-center py-8">
                  <p className="text-[var(--text-muted)]">Add more transactions to generate insights</p>
                </div>
              )}
            </div>
            
            {/* Health Score */}
            {canViewHealthScore && (
              healthLoading ? (
                <HealthScoreRingSkeleton />
              ) : healthScore ? (
                <div>
                  <div className="mb-4">
                    <h3 className="text-lg font-semibold mb-2">⭐ Financial Health Score</h3>
                    <p className="text-sm text-[var(--text-secondary)]">
                      Calculated based on: Income/Expense Ratio (40%) • Spending Consistency (30%) • Anomaly Frequency (30%)
                    </p>
                  </div>
                  <HealthScoreRing healthScore={healthScore} />
                </div>
              ) : null
            )}
          </div>
        </div>
      )}
      
      {/* Viewer Role Message */}
      {effectiveRole === 'VIEWER' && (
        <div className="glass-card p-6 border border-green-500/20 bg-green-500/10">
          <div className="flex items-start gap-4">
            <Eye className="w-6 h-6 text-green-400 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold mb-2">📖 Viewer Role Features</h3>
              <p className="text-sm text-[var(--text-secondary)]">
                You have read-only access to your transactions and basic financial summary. Upgrade to <strong>Analyst</strong> role to unlock AI-powered insights, health scores, advanced analytics, and trend predictions.
              </p>
            </div>
          </div>
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
                  className="flex items-center justify-between p-3 rounded-lg bg-[var(--surface-2)] hover:bg-[var(--surface-3)] transition-colors animate-fade-in"
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
