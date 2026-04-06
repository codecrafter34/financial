'use client';

import { useTrends, useHealthScore, useInsights, useSummary } from '@/lib/api';
import { useAuthStore } from '@/lib/store';
import { formatCurrency } from '@/lib/utils';
import { TrendChart, TrendChartSkeleton } from '@/components/charts/trend-chart';
import { CategoryChart, CategoryChartSkeleton } from '@/components/charts/category-chart';
import { HealthScoreRing, HealthScoreRingSkeleton } from '@/components/dashboard/health-score-ring';
import { InsightsPanel, InsightCardSkeleton } from '@/components/dashboard/insight-card';
import { useState } from 'react';
import { BarChart3, TrendingUp, Brain, Target } from 'lucide-react';

export default function AnalyticsPage() {
  const { getEffectiveRole } = useAuthStore();
  const effectiveRole = getEffectiveRole();
  
  const [period, setPeriod] = useState('month');
  const [groupBy, setGroupBy] = useState('day');
  
  const { data: trends, isLoading: trendsLoading } = useTrends(period, groupBy);
  const { data: summary, isLoading: summaryLoading } = useSummary(period);
  const { data: healthScore, isLoading: healthLoading } = useHealthScore();
  const { data: insights, isLoading: insightsLoading } = useInsights();
  
  // Check permissions
  if (effectiveRole === 'VIEWER') {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <Target className="w-16 h-16 mx-auto mb-4 text-[var(--text-muted)]" />
          <h2 className="text-2xl font-bold mb-2">Analytics Access Restricted</h2>
          <p className="text-[var(--text-secondary)]">
            Upgrade to Analyst role to access detailed analytics and insights.
          </p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">Analytics</h1>
          <p className="text-[var(--text-secondary)] mt-1">
            Deep dive into your financial patterns
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
          {/* Period selector */}
          <div className="flex items-center gap-1 sm:gap-2 p-1 bg-[var(--surface-2)] rounded-lg overflow-x-auto">
            {['week', 'month', 'quarter', 'year'].map((p) => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={`px-3 sm:px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
                  period === p
                    ? 'bg-[var(--primary)] text-white'
                    : 'text-[var(--text-secondary)] hover:text-white'
                }`}
              >
                {p.charAt(0).toUpperCase() + p.slice(1)}
              </button>
            ))}
          </div>
          
          {/* Group by selector */}
          <select
            value={groupBy}
            onChange={(e) => setGroupBy(e.target.value)}
            className="input-field w-full sm:w-auto"
          >
            <option value="day">By Day</option>
            <option value="week">By Week</option>
            <option value="month">By Month</option>
          </select>
        </div>
      </div>
      
      {/* Quick Stats */}
      {!summaryLoading && summary && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="glass-card p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-green-500/20">
                <TrendingUp className="w-6 h-6 text-green-400" />
              </div>
              <div>
                <p className="text-xs sm:text-sm text-[var(--text-secondary)]">Average Daily Income</p>
                <p className="text-xl sm:text-2xl font-bold">
                  {formatCurrency(summary.totalIncome / Math.max(1, trends?.length || 1))}
                </p>
              </div>
            </div>
          </div>
          
          <div className="glass-card p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-red-500/20">
                <BarChart3 className="w-6 h-6 text-red-400" />
              </div>
              <div>
                <p className="text-xs sm:text-sm text-[var(--text-secondary)]">Average Daily Expense</p>
                <p className="text-xl sm:text-2xl font-bold">
                  {formatCurrency(summary.totalExpense / Math.max(1, trends?.length || 1))}
                </p>
              </div>
            </div>
          </div>
          
          <div className="glass-card p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-purple-500/20">
                <Brain className="w-6 h-6 text-purple-400" />
              </div>
              <div>
                <p className="text-xs sm:text-sm text-[var(--text-secondary)]">Savings Rate</p>
                <p className="text-xl sm:text-2xl font-bold">
                  {summary.totalIncome > 0
                    ? `${((summary.netBalance / summary.totalIncome) * 100).toFixed(1)}%`
                    : '0%'}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Trends Chart */}
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
      
      {/* Health Score and Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Health Score */}
        {healthLoading ? (
          <HealthScoreRingSkeleton />
        ) : healthScore ? (
          <HealthScoreRing healthScore={healthScore} />
        ) : null}
        
        {/* Insights */}
        <div className="glass-card p-6">
          <h3 className="text-base sm:text-lg font-semibold mb-6">AI-Generated Insights</h3>
          {insightsLoading ? (
            <div className="space-y-4">
              <InsightCardSkeleton />
              <InsightCardSkeleton />
            </div>
          ) : insights ? (
            <InsightsPanel insights={insights} maxDisplay={5} />
          ) : null}
        </div>
      </div>
      
      {/* Category Breakdown Table */}
      {summary?.categoryBreakdown && summary.categoryBreakdown.length > 0 && (
        <div className="glass-card p-4 sm:p-6">
          <h3 className="text-base sm:text-lg font-semibold mb-4 sm:mb-6">Category Breakdown</h3>
          
          {/* Mobile Card View */}
          <div className="md:hidden space-y-3">
            {summary.categoryBreakdown.map((cat, i) => (
              <div 
                key={cat.category}
                className="p-4 bg-[var(--surface-2)] rounded-xl animate-fade-in"
                style={{ animationDelay: `${i * 0.02}s` }}
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="badge bg-[var(--surface-3)]">{cat.category}</span>
                  <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                    cat.trend === 'up' ? 'bg-red-500/20 text-red-400' : 
                    cat.trend === 'down' ? 'bg-green-500/20 text-green-400' : 
                    'bg-gray-500/20 text-gray-400'
                  }`}>
                    {cat.trend === 'up' ? '↑ Increasing' : 
                     cat.trend === 'down' ? '↓ Decreasing' : 
                     '→ Stable'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-lg font-bold">{formatCurrency(cat.total)}</p>
                    <p className="text-xs text-[var(--text-secondary)]">{cat.count} transactions</p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-semibold text-[var(--text-secondary)]">{cat.percentage.toFixed(1)}%</p>
                    <p className="text-xs text-[var(--text-muted)]">of total</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          {/* Desktop Table View */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[var(--border)]">
                  <th className="text-left p-3 text-sm font-medium text-[var(--text-secondary)]">Category</th>
                  <th className="text-right p-3 text-sm font-medium text-[var(--text-secondary)]">Total</th>
                  <th className="text-right p-3 text-sm font-medium text-[var(--text-secondary)]">Count</th>
                  <th className="text-right p-3 text-sm font-medium text-[var(--text-secondary)]">%</th>
                  <th className="text-left p-3 text-sm font-medium text-[var(--text-secondary)]">Trend</th>
                </tr>
              </thead>
              <tbody>
                {summary.categoryBreakdown.map((cat, i) => (
                  <tr 
                    key={cat.category} 
                    className="border-b border-[var(--border)] hover:bg-[var(--surface-2)] transition-colors animate-fade-in"
                    style={{ animationDelay: `${i * 0.02}s` }}
                  >
                    <td className="p-3">
                      <span className="badge bg-[var(--surface-3)]">{cat.category}</span>
                    </td>
                    <td className="p-3 text-right font-medium">{formatCurrency(cat.total)}</td>
                    <td className="p-3 text-right text-[var(--text-secondary)]">{cat.count}</td>
                    <td className="p-3 text-right text-[var(--text-secondary)]">{cat.percentage.toFixed(1)}%</td>
                    <td className="p-3">
                      <span className={`text-sm ${
                        cat.trend === 'up' ? 'text-red-400' : 
                        cat.trend === 'down' ? 'text-green-400' : 
                        'text-gray-400'
                      }`}>
                        {cat.trend === 'up' ? '↑ Increasing' : 
                         cat.trend === 'down' ? '↓ Decreasing' : 
                         '→ Stable'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
