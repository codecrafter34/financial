import prisma from '@/lib/prisma';
import { TransactionType, Category, Role, EventAction } from '@/lib/constants';
import { getDateRange, calculatePercentageChange } from '@/lib/utils';
import { aiEngine } from './ai-engine.service.js';
import { eventService } from './event.service.js';

export const analyticsService = {
  // Get comprehensive summary (role-aware)
  async getSummary(userId, role, period = 'month') {
    const { start: currentStart, end: currentEnd } = getDateRange(period);
    
    // Calculate previous period
    const periodMs = currentEnd.getTime() - currentStart.getTime();
    const previousStart = new Date(currentStart.getTime() - periodMs);
    const previousEnd = new Date(currentStart.getTime() - 1);
    
    // Build where clause based on role
    const whereBase = { isDeleted: false };
    if (role !== Role.ADMIN && userId) {
      whereBase.userId = userId;
    }
    
    // Current period transactions
    const currentTransactions = await prisma.transaction.findMany({
      where: {
        ...whereBase,
        date: { gte: currentStart, lte: currentEnd },
      },
    });
    
    // Previous period transactions (for comparison)
    const previousTransactions = await prisma.transaction.findMany({
      where: {
        ...whereBase,
        date: { gte: previousStart, lte: previousEnd },
      },
    });
    
    // Calculate current totals
    const currentIncome = currentTransactions
      .filter(t => t.type === TransactionType.INCOME)
      .reduce((sum, t) => sum + t.amount, 0);
    
    const currentExpense = currentTransactions
      .filter(t => t.type === TransactionType.EXPENSE)
      .reduce((sum, t) => sum + t.amount, 0);
    
    // Calculate previous totals
    const previousIncome = previousTransactions
      .filter(t => t.type === TransactionType.INCOME)
      .reduce((sum, t) => sum + t.amount, 0);
    
    const previousExpense = previousTransactions
      .filter(t => t.type === TransactionType.EXPENSE)
      .reduce((sum, t) => sum + t.amount, 0);
    
    // Category breakdown
    const categoryMap = new Map();
    
    for (const tx of currentTransactions) {
      const existing = categoryMap.get(tx.category) || { income: 0, expense: 0, count: 0 };
      if (tx.type === TransactionType.INCOME) {
        existing.income += tx.amount;
      } else {
        existing.expense += tx.amount;
      }
      existing.count++;
      categoryMap.set(tx.category, existing);
    }
    
    // Previous period category totals for trend calculation
    const prevCategoryMap = new Map();
    for (const tx of previousTransactions) {
      if (tx.type === TransactionType.EXPENSE) {
        prevCategoryMap.set(
          tx.category,
          (prevCategoryMap.get(tx.category) || 0) + tx.amount
        );
      }
    }
    
    const totalExpenseForPercentage = currentExpense || 1;
    const categoryBreakdown = [];
    
    for (const [category, data] of categoryMap) {
      const currentTotal = data.expense;
      const previousTotal = prevCategoryMap.get(category) || 0;
      const change = calculatePercentageChange(currentTotal, previousTotal);
      
      let trend = 'stable';
      if (change > 5) trend = 'up';
      else if (change < -5) trend = 'down';
      
      categoryBreakdown.push({
        category,
        total: currentTotal,
        count: data.count,
        percentage: (currentTotal / totalExpenseForPercentage) * 100,
        trend,
      });
    }
    
    // Sort by total descending
    categoryBreakdown.sort((a, b) => b.total - a.total);
    
    // Get recent activity
    const recentActivity = await this.getRecentActivity(userId, role);
    
    // Period comparison
    const periodComparison = {
      currentPeriodIncome: currentIncome,
      previousPeriodIncome: previousIncome,
      incomeChange: calculatePercentageChange(currentIncome, previousIncome),
      currentPeriodExpense: currentExpense,
      previousPeriodExpense: previousExpense,
      expenseChange: calculatePercentageChange(currentExpense, previousExpense),
    };
    
    return {
      totalIncome: currentIncome,
      totalExpense: currentExpense,
      netBalance: currentIncome - currentExpense,
      transactionCount: currentTransactions.length,
      categoryBreakdown,
      recentActivity,
      periodComparison,
    };
  },
  
  // Get trends data
  async getTrends(userId, role, period = 'month', groupBy = 'day') {
    const { start, end } = getDateRange(period);
    
    const whereBase = { isDeleted: false };
    if (role !== Role.ADMIN && userId) {
      whereBase.userId = userId;
    }
    
    const transactions = await prisma.transaction.findMany({
      where: {
        ...whereBase,
        date: { gte: start, lte: end },
      },
      orderBy: { date: 'asc' },
    });
    
    // Group transactions by period
    const groupedData = new Map();
    
    for (const tx of transactions) {
      let key;
      const date = new Date(tx.date);
      
      switch (groupBy) {
        case 'day':
          key = date.toISOString().split('T')[0];
          break;
        case 'week':
          const weekStart = new Date(date);
          weekStart.setDate(date.getDate() - date.getDay());
          key = weekStart.toISOString().split('T')[0];
          break;
        case 'month':
          key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
          break;
        default:
          key = date.toISOString().split('T')[0];
      }
      
      const existing = groupedData.get(key) || { income: 0, expense: 0 };
      if (tx.type === TransactionType.INCOME) {
        existing.income += tx.amount;
      } else {
        existing.expense += tx.amount;
      }
      groupedData.set(key, existing);
    }
    
    // Convert to array and sort
    const trends = [];
    for (const [period, data] of groupedData) {
      trends.push({
        period,
        income: data.income,
        expense: data.expense,
        net: data.income - data.expense,
      });
    }
    
    trends.sort((a, b) => a.period.localeCompare(b.period));
    
    return trends;
  },
  
  // Get recent activity (combined transactions and events)
  async getRecentActivity(userId, role, limit = 10) {
    const activities = [];
    
    const whereBase = { isDeleted: false };
    const eventWhereBase = {};
    
    if (role !== Role.ADMIN && userId) {
      whereBase.userId = userId;
      eventWhereBase.userId = userId;
    }
    
    // Get recent transactions
    const recentTransactions = await prisma.transaction.findMany({
      where: whereBase,
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
    
    for (const tx of recentTransactions) {
      activities.push({
        id: tx.id,
        type: 'transaction',
        action: tx.type === TransactionType.INCOME ? 'Income received' : 'Expense recorded',
        description: `${tx.category} - ${tx.notes || 'No description'}`,
        amount: tx.amount,
        timestamp: tx.createdAt,
      });
    }
    
    // Get recent events (Analyst and Admin only)
    if (role === Role.ANALYST || role === Role.ADMIN) {
      const recentEvents = await prisma.event.findMany({
        where: eventWhereBase,
        orderBy: { createdAt: 'desc' },
        take: limit,
      });
      
      for (const event of recentEvents) {
        activities.push({
          id: event.id,
          type: 'event',
          action: event.action,
          description: event.entityType 
            ? `${event.action} on ${event.entityType}`
            : event.action,
          timestamp: event.createdAt,
        });
      }
    }
    
    // Sort by timestamp and limit
    activities.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
    
    return activities.slice(0, limit);
  },
  
  // Get analytics insights (Analyst/Admin only)
  async getInsights(userId) {
    const insights = await aiEngine.generateInsights(userId);
    
    // Log insight generation
    await eventService.log({
      userId,
      action: EventAction.INSIGHT_GENERATED,
      payload: { count: insights.length },
    });
    
    return insights;
  },
  
  // Get health score (Analyst/Admin only)
  async getHealthScore(userId) {
    const healthScore = await aiEngine.calculateHealthScore(userId);
    
    // Log health score calculation
    await eventService.log({
      userId,
      action: EventAction.HEALTH_SCORE_CALCULATED,
      payload: { score: healthScore.score, grade: healthScore.grade },
    });
    
    return healthScore;
  },
  
  // Get category heatmap data
  async getCategoryHeatmap(userId, role, days = 30) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    
    const whereBase = { 
      isDeleted: false,
      type: TransactionType.EXPENSE,
      date: { gte: startDate },
    };
    
    if (role !== Role.ADMIN && userId) {
      whereBase.userId = userId;
    }
    
    const transactions = await prisma.transaction.findMany({
      where: whereBase,
    });
    
    const heatmapData = [];
    const dataMap = new Map();
    
    for (const tx of transactions) {
      const day = tx.date.toISOString().split('T')[0];
      const key = `${tx.category}-${day}`;
      dataMap.set(key, (dataMap.get(key) || 0) + tx.amount);
    }
    
    for (const [key, amount] of dataMap) {
      const [category, day] = key.split('-').slice(0, -2).concat(key.split('-').slice(-3).join('-')).join('-').split('-');
      heatmapData.push({
        category: category,
        day: key.substring(category.length + 1),
        amount,
      });
    }
    
    return heatmapData;
  },
};
