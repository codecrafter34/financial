'use client';

import { cn, formatCurrency } from '@/lib/utils.js';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';

const COLORS = [
  '#3b82f6', // blue
  '#8b5cf6', // purple
  '#10b981', // green
  '#f59e0b', // yellow
  '#ef4444', // red
  '#06b6d4', // cyan
  '#ec4899', // pink
  '#f97316', // orange
  '#14b8a6', // teal
  '#6366f1', // indigo
  '#84cc16', // lime
  '#a855f7', // violet
];

const CustomTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  
  const data = payload[0].payload;
  
  return (
    <div className="glass-card p-3 border border-[var(--border)]">
      <p className="text-sm font-medium">{data.category}</p>
      <p className="text-sm text-[var(--text-secondary)]">
        {formatCurrency(data.total)} ({data.percentage.toFixed(1)}%)
      </p>
      <p className="text-xs text-[var(--text-muted)]">
        {data.count} transaction{data.count !== 1 ? 's' : ''}
      </p>
    </div>
  );
};

export function CategoryChart({ data, className }) {
  if (!data || data.length === 0) {
    return (
      <div className={cn('glass-card p-6 text-center', className)}>
        <p className="text-[var(--text-secondary)]">No category data available</p>
      </div>
    );
  }
  
  const chartData = data.map((item, index) => ({
    ...item,
    color: COLORS[index % COLORS.length],
  }));
  
  return (
    <div className={cn('glass-card p-6', className)}>
      <h3 className="text-lg font-semibold mb-6">Spending by Category</h3>
      
      <div className="flex flex-col lg:flex-row items-center gap-6 lg:gap-8">
        <div className="h-64 w-64 flex-shrink-0">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={90}
                paddingAngle={2}
                dataKey="total"
                nameKey="category"
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        </div>
        
        {/* Legend */}
        <div className="w-full lg:w-auto lg:flex-1 space-y-2 max-h-64 overflow-y-auto">
          {chartData.slice(0, 6).map((item) => (
            <div key={item.category} className="flex items-center gap-3">
              <div 
                className="w-3 h-3 rounded-full flex-shrink-0" 
                style={{ backgroundColor: item.color }}
              />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{item.category}</p>
                <p className="text-xs text-[var(--text-muted)]">
                  {formatCurrency(item.total)}
                </p>
              </div>
            </div>
          ))}
          {data.length > 6 && (
            <p className="text-xs text-[var(--text-muted)] pt-2">
              +{data.length - 6} more
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

// Loading skeleton
export function CategoryChartSkeleton() {
  return (
    <div className="glass-card p-6">
      <div className="skeleton w-48 h-6 mb-6" />
      <div className="flex items-center gap-6">
        <div className="skeleton w-48 h-48 rounded-full" />
        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex items-center gap-3">
              <div className="skeleton w-3 h-3 rounded-full" />
              <div className="skeleton w-24 h-4" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
