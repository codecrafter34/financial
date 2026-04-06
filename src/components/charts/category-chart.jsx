'use client';

import { cn, formatCurrency } from '@/lib/utils.js';
import { useState } from 'react';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';

const GRADIENT_COLORS = [
  { start: '#3b82f6', end: '#1e40af' }, // blue
  { start: '#8b5cf6', end: '#6d28d9' }, // purple
  { start: '#10b981', end: '#047857' }, // green
  { start: '#f59e0b', end: '#d97706' }, // amber
  { start: '#ef4444', end: '#dc2626' }, // red
  { start: '#06b6d4', end: '#0891b2' }, // cyan
  { start: '#ec4899', end: '#be185d' }, // pink
  { start: '#f97316', end: '#ea580c' }, // orange
  { start: '#14b8a6', end: '#0d9488' }, // teal
  { start: '#6366f1', end: '#4f46e5' }, // indigo
  { start: '#84cc16', end: '#65a30d' }, // lime
  { start: '#a855f7', end: '#7c3aed' }, // violet
];

const CustomTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  
  const data = payload[0].payload;
  
  return (
    <div className="glass-card p-3 border border-[var(--border)] shadow-lg">
      <p className="text-sm font-semibold text-[var(--text-primary)]">{data.category}</p>
      <p className="text-sm text-[var(--text-secondary)] font-medium mt-1">
        {formatCurrency(data.total)}
      </p>
      <p className="text-xs text-[var(--text-muted)] font-medium">
        {data.percentage.toFixed(1)}% • {data.count} transaction{data.count !== 1 ? 's' : ''}
      </p>
    </div>
  );
};

const CustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percentage }) => {
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * Math.PI / 180);
  const y = cy + radius * Math.sin(-midAngle * Math.PI / 180);

  if (percentage < 5) return null;

  return (
    <text 
      x={x} 
      y={y} 
      fill="white" 
      textAnchor={x > cx ? 'start' : 'end'} 
      dominantBaseline="central"
      style={{ 
        pointerEvents: 'none',
        fontSize: '12px',
        fontWeight: '600',
        textShadow: '0 1px 2px rgba(0,0,0,0.5)'
      }}
    >
      {`${percentage.toFixed(1)}%`}
    </text>
  );
};

export function CategoryChart({ data, className }) {
  const [hoveredIndex, setHoveredIndex] = useState(null);
  
  if (!data || data.length === 0) {
    return (
      <div className={cn('glass-card p-6 text-center', className)}>
        <p className="text-[var(--text-secondary)]">No category data available</p>
      </div>
    );
  }
  
  const chartData = data.map((item, index) => ({
    ...item,
    color: GRADIENT_COLORS[index % GRADIENT_COLORS.length],
    colorId: `gradient-${index}`,
  }));
  
  return (
    <div className={cn('glass-card p-6 shadow-lg', className)}>
      <div className="flex flex-col gap-2 mb-8">
        <h3 className="text-xl font-bold text-[var(--text-primary)]">Spending by Category</h3>
        <p className="text-xs text-[var(--text-muted)]">Distribution of your expenses across categories</p>
      </div>
      
      <div className="flex flex-col lg:flex-row items-start gap-8 overflow-visible">
        <div className="h-72 w-72 flex-shrink-0 relative">
          {/* SVG for gradients */}
          <svg width="0" height="0">
            <defs>
              {chartData.map((entry, index) => (
                <linearGradient 
                  key={entry.colorId}
                  id={entry.colorId}
                  x1="0%" y1="0%" x2="100%" y2="100%"
                >
                  <stop offset="0%" stopColor={entry.color.start} stopOpacity="1" />
                  <stop offset="100%" stopColor={entry.color.end} stopOpacity="1" />
                </linearGradient>
              ))}
            </defs>
          </svg>
          
          <ResponsiveContainer width="100%" height="100%">
            <PieChart style={{ animation: 'fadeInScale 0.8s ease-out' }}>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={70}
                outerRadius={110}
                paddingAngle={3}
                dataKey="total"
                nameKey="category"
                label={<CustomLabel />}
                onMouseEnter={(_, index) => setHoveredIndex(index)}
                onMouseLeave={() => setHoveredIndex(null)}
              >
                {chartData.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`}
                    fill={`url(#${entry.colorId})`}
                    style={{
                      filter: hoveredIndex === index ? 'brightness(1.2) drop-shadow(0 4px 12px rgba(0,0,0,0.3))' : 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))',
                      transition: 'all 0.3s ease',
                      cursor: 'pointer',
                    }}
                  />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        </div>
        
        {/* Legend */}
        <div className="w-full lg:flex-1 lg:w-auto space-y-3 max-h-80 overflow-y-auto pr-3">
          {chartData.map((item, index) => (
            <div 
              key={item.category}
              onMouseEnter={() => setHoveredIndex(index)}
              onMouseLeave={() => setHoveredIndex(null)}
              className="p-3 rounded-lg transition-all duration-300 cursor-pointer"
              style={{
                backgroundColor: hoveredIndex === index ? 'rgba(255,255,255,0.05)' : 'transparent',
                backdropFilter: hoveredIndex === index ? 'blur(10px)' : 'none',
              }}
            >
              <div className="flex items-start gap-3">
                <div 
                  className="w-4 h-4 rounded-full flex-shrink-0 shadow-md mt-0.5 transition-transform duration-300" 
                  style={{ 
                    background: `linear-gradient(135deg, ${item.color.start} 0%, ${item.color.end} 100%)`,
                    transform: hoveredIndex === index ? 'scale(1.3)' : 'scale(1)',
                  }}
                />
                <div className="flex-1 min-w-0">
                  <p className={cn(
                    "font-semibold text-sm transition-all duration-300",
                    hoveredIndex === index ? 'text-[var(--text-primary)]' : 'text-[var(--text-secondary)]'
                  )}>
                    {item.category}
                  </p>
                  <div className="flex items-center justify-between gap-2 mt-1">
                    <p className="text-xs text-[var(--text-muted)]">
                      {formatCurrency(item.total)}
                    </p>
                    <p className="text-xs font-semibold px-2 py-0.5 rounded-full bg-opacity-20" style={{
                      backgroundColor: item.color.start,
                      color: item.color.start,
                    }}>
                      {item.percentage.toFixed(1)}%
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ))}
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
