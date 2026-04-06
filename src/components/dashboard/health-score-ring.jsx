'use client';

import { cn } from '@/lib/utils.js';

const gradeColors = {
  A: '#10b981',
  B: '#22c55e',
  C: '#f59e0b',
  D: '#f97316',
  F: '#ef4444',
};

export function HealthScoreRing({ healthScore, className }) {
  const { score, grade, factors, recommendations } = healthScore;
  
  const circumference = 2 * Math.PI * 70; // radius = 70
  const progress = (score / 100) * circumference;
  const offset = circumference - progress;
  
  return (
    <div className={cn('glass-card p-6', className)}>
      <h3 className="text-lg font-semibold mb-6">Financial Health Score</h3>
      
      <div className="flex items-center gap-8">
        {/* Score Ring */}
        <div className="score-ring flex-shrink-0">
          <svg width="160" height="160" viewBox="0 0 160 160">
            <defs>
              <linearGradient id="scoreGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#3b82f6" />
                <stop offset="100%" stopColor="#8b5cf6" />
              </linearGradient>
            </defs>
            
            {/* Background circle */}
            <circle
              cx="80"
              cy="80"
              r="70"
              className="score-ring-circle score-ring-bg"
            />
            
            {/* Progress circle */}
            <circle
              cx="80"
              cy="80"
              r="70"
              className="score-ring-circle score-ring-progress"
              strokeDasharray={circumference}
              strokeDashoffset={offset}
              style={{
                stroke: gradeColors[grade],
                transition: 'stroke-dashoffset 1s ease, stroke 0.5s ease',
              }}
            />
          </svg>
          
          {/* Center text */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-4xl font-bold">{score}</span>
            <span 
              className="text-2xl font-bold"
              style={{ color: gradeColors[grade] }}
            >
              {grade}
            </span>
          </div>
        </div>
        
        {/* Factors */}
        <div className="flex-1 space-y-4">
          {factors.map((factor) => (
            <div key={factor.name}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm text-[var(--text-secondary)]">{factor.name}</span>
                <span className="text-sm font-medium">{factor.score}/100</span>
              </div>
              <div className="h-2 bg-[var(--surface-3)] rounded-full overflow-hidden">
                <div 
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${factor.score}%`,
                    background: factor.score >= 70 
                      ? 'var(--gradient-success)' 
                      : factor.score >= 40 
                        ? 'linear-gradient(135deg, #f59e0b 0%, #f97316 100%)'
                        : 'var(--gradient-danger)',
                  }}
                />
              </div>
              <p className="text-xs text-[var(--text-muted)] mt-1">{factor.description}</p>
            </div>
          ))}
        </div>
      </div>
      
      {/* Recommendations */}
      {recommendations.length > 0 && (
        <div className="mt-6 pt-6 border-t border-[var(--border)]">
          <h4 className="text-sm font-medium mb-3 text-[var(--text-secondary)]">Recommendations</h4>
          <ul className="space-y-2">
            {recommendations.map((rec, i) => (
              <li key={i} className="flex items-start gap-2 text-sm">
                <span className="w-1.5 h-1.5 rounded-full bg-[var(--primary)] mt-2 flex-shrink-0" />
                <span className="text-[var(--text-secondary)]">{rec}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

// Loading skeleton
export function HealthScoreRingSkeleton() {
  return (
    <div className="glass-card p-6">
      <div className="skeleton w-48 h-6 mb-6" />
      <div className="flex items-center gap-8">
        <div className="skeleton w-40 h-40 rounded-full" />
        <div className="flex-1 space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i}>
              <div className="flex justify-between mb-1">
                <div className="skeleton w-24 h-4" />
                <div className="skeleton w-12 h-4" />
              </div>
              <div className="skeleton w-full h-2 rounded-full" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
