import prisma from '@/lib/prisma';
import { TransactionType, Category } from '@/lib/constants';

// Statistical helper functions
function calculateMean(values) {
  if (values.length === 0) return 0;
  return values.reduce((a, b) => a + b, 0) / values.length;
}

function calculateStdDev(values) {
  if (values.length < 2) return 0;
  const mean = calculateMean(values);
  const squaredDiffs = values.map(v => Math.pow(v - mean, 2));
  return Math.sqrt(calculateMean(squaredDiffs));
}

function calculatePercentile(values, percentile) {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const index = Math.ceil((percentile / 100) * sorted.length) - 1;
  return sorted[Math.max(0, index)];
}

export const aiEngine = {
  // Detect anomaly in a transaction
  async detectAnomaly(transaction) {
    // Get historical data for comparison
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const historicalTransactions = await prisma.transaction.findMany({
      where: {
        userId: transaction.userId,
        type: transaction.type,
        category: transaction.category,
        isDeleted: false,
        date: { gte: thirtyDaysAgo },
      },
      select: { amount: true },
    });
    
    const amounts = historicalTransactions.map(t => t.amount);
    
    // Not enough data for anomaly detection
    if (amounts.length < 3) {
      return {
        transactionId: '',
        isAnomaly: false,
        score: 0,
        reason: '',
        factors: [],
      };
    }
    
    const mean = calculateMean(amounts);
    const stdDev = calculateStdDev(amounts);
    const p95 = calculatePercentile(amounts, 95);
    
    const factors = [];
    let anomalyScore = 0;
    
    // Check if amount is significantly higher than average
    if (mean > 0) {
      const zScore = stdDev > 0 ? (transaction.amount - mean) / stdDev : 0;
      
      // Z-score based detection
      if (Math.abs(zScore) > 2) {
        anomalyScore += 0.4;
        factors.push(`Amount is ${zScore > 0 ? 'significantly higher' : 'significantly lower'} than usual (z-score: ${zScore.toFixed(2)})`);
      }
      
      // Percentage deviation
      const percentageDeviation = ((transaction.amount - mean) / mean) * 100;
      if (percentageDeviation > 50) {
        anomalyScore += 0.3;
        factors.push(`${percentageDeviation.toFixed(0)}% above average spending in this category`);
      }
      
      // Above 95th percentile
      if (transaction.amount > p95) {
        anomalyScore += 0.3;
        factors.push(`Exceeds 95th percentile of historical transactions`);
      }
    }
    
    // Large transaction threshold (absolute value)
    const largeThresholds = {
      [TransactionType.EXPENSE]: 1000,
      [TransactionType.INCOME]: 10000,
    };
    
    if (transaction.amount > largeThresholds[transaction.type]) {
      anomalyScore += 0.2;
      factors.push(`Unusually large ${transaction.type.toLowerCase()} amount`);
    }
    
    const isAnomaly = anomalyScore >= 0.5;
    
    return {
      transactionId: '',
      isAnomaly,
      score: Math.min(1, anomalyScore),
      reason: factors.length > 0 ? factors[0] : '',
      factors,
    };
  },
  
  // Generate insights for a user
  async generateInsights(userId) {
    const insights = [];
    
    // Get current and previous week data
    const now = new Date();
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const twoWeeksAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);
    
    // Current week transactions
    const currentWeek = await prisma.transaction.findMany({
      where: {
        userId,
        isDeleted: false,
        date: { gte: oneWeekAgo, lte: now },
      },
    });
    
    // Previous week transactions
    const previousWeek = await prisma.transaction.findMany({
      where: {
        userId,
        isDeleted: false,
        date: { gte: twoWeeksAgo, lt: oneWeekAgo },
      },
    });
    
    // Calculate totals
    const currentExpense = currentWeek
      .filter(t => t.type === TransactionType.EXPENSE)
      .reduce((sum, t) => sum + t.amount, 0);
    
    const previousExpense = previousWeek
      .filter(t => t.type === TransactionType.EXPENSE)
      .reduce((sum, t) => sum + t.amount, 0);
    
    const currentIncome = currentWeek
      .filter(t => t.type === TransactionType.INCOME)
      .reduce((sum, t) => sum + t.amount, 0);
    
    const previousIncome = previousWeek
      .filter(t => t.type === TransactionType.INCOME)
      .reduce((sum, t) => sum + t.amount, 0);
    
    // Spending trend insight
    if (previousExpense > 0) {
      const expenseChange = ((currentExpense - previousExpense) / previousExpense) * 100;
      
      if (expenseChange > 20) {
        insights.push({
          id: `spending-spike-${Date.now()}`,
          type: 'spending_spike',
          severity: expenseChange > 50 ? 'critical' : 'warning',
          title: 'Spending Increased',
          description: `Your expenses increased by ${expenseChange.toFixed(0)}% compared to last week. You spent $${currentExpense.toFixed(2)} this week vs $${previousExpense.toFixed(2)} last week.`,
          data: { currentExpense, previousExpense, change: expenseChange },
          generatedAt: new Date(),
        });
      } else if (expenseChange < -20) {
        insights.push({
          id: `spending-decrease-${Date.now()}`,
          type: 'achievement',
          severity: 'success',
          title: 'Great Job Saving!',
          description: `Your expenses decreased by ${Math.abs(expenseChange).toFixed(0)}% compared to last week. Keep up the good work!`,
          data: { currentExpense, previousExpense, change: expenseChange },
          generatedAt: new Date(),
        });
      }
    }
    
    // Income insight
    if (previousIncome > 0 && currentIncome > previousIncome * 1.2) {
      insights.push({
        id: `income-increase-${Date.now()}`,
        type: 'achievement',
        severity: 'success',
        title: 'Income Boost!',
        description: `Your income this week is ${(((currentIncome - previousIncome) / previousIncome) * 100).toFixed(0)}% higher than last week.`,
        data: { currentIncome, previousIncome },
        generatedAt: new Date(),
      });
    }
    
    // Category analysis
    const categorySpending = new Map();
    for (const tx of currentWeek) {
      if (tx.type === TransactionType.EXPENSE) {
        categorySpending.set(
          tx.category,
          (categorySpending.get(tx.category) || 0) + tx.amount
        );
      }
    }
    
    // Find top spending category
    let topCategory = null;
    let topAmount = 0;
    for (const [cat, amount] of categorySpending) {
      if (amount > topAmount) {
        topAmount = amount;
        topCategory = cat;
      }
    }
    
    if (topCategory && topAmount > currentExpense * 0.4) {
      insights.push({
        id: `category-dominant-${Date.now()}`,
        type: 'category_anomaly',
        severity: 'info',
        title: `${topCategory} is Your Top Expense`,
        description: `You've spent ${((topAmount / currentExpense) * 100).toFixed(0)}% of your weekly budget on ${topCategory.toLowerCase()}. Consider reviewing these expenses.`,
        data: { category: topCategory, amount: topAmount, percentage: topAmount / currentExpense },
        generatedAt: new Date(),
      });
    }
    
    // Anomaly count insight
    const anomalyCount = await prisma.transaction.count({
      where: {
        userId,
        isAnomaly: true,
        isDeleted: false,
        date: { gte: oneWeekAgo },
      },
    });
    
    if (anomalyCount >= 3) {
      insights.push({
        id: `anomaly-count-${Date.now()}`,
        type: 'pattern',
        severity: 'warning',
        title: 'Multiple Unusual Transactions',
        description: `${anomalyCount} transactions this week were flagged as unusual. Review them in your transaction history.`,
        data: { count: anomalyCount },
        generatedAt: new Date(),
      });
    }
    
    // Recommendation if no income
    if (currentIncome === 0 && currentExpense > 0) {
      insights.push({
        id: `no-income-${Date.now()}`,
        type: 'recommendation',
        severity: 'info',
        title: 'No Income Recorded',
        description: 'You have expenses this week but no income recorded. Make sure to log all your income sources for accurate tracking.',
        generatedAt: new Date(),
      });
    }
    
    return insights;
  },
  
  // Calculate financial health score
  async calculateHealthScore(userId) {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const transactions = await prisma.transaction.findMany({
      where: {
        userId,
        isDeleted: false,
        date: { gte: thirtyDaysAgo },
      },
    });
    
    const income = transactions
      .filter(t => t.type === TransactionType.INCOME)
      .reduce((sum, t) => sum + t.amount, 0);
    
    const expense = transactions
      .filter(t => t.type === TransactionType.EXPENSE)
      .reduce((sum, t) => sum + t.amount, 0);
    
    const factors = [];
    
    // Factor 1: Income/Expense Ratio (40% weight)
    let ratioScore = 0;
    if (income > 0) {
      const ratio = income / expense;
      if (ratio >= 2) ratioScore = 100;
      else if (ratio >= 1.5) ratioScore = 80;
      else if (ratio >= 1.2) ratioScore = 60;
      else if (ratio >= 1) ratioScore = 40;
      else ratioScore = 20;
    }
    
    factors.push({
      name: 'Income/Expense Ratio',
      score: ratioScore,
      weight: 0.4,
      description: income > 0 
        ? `Your income is ${(income / expense).toFixed(1)}x your expenses`
        : 'No income recorded this month',
    });
    
    // Factor 2: Spending Consistency (30% weight)
    const dailyExpenses = [];
    const expenseByDay = new Map();
    
    for (const tx of transactions) {
      if (tx.type === TransactionType.EXPENSE) {
        const day = tx.date.toISOString().split('T')[0];
        expenseByDay.set(day, (expenseByDay.get(day) || 0) + tx.amount);
      }
    }
    
    for (const amount of expenseByDay.values()) {
      dailyExpenses.push(amount);
    }
    
    const expenseStdDev = calculateStdDev(dailyExpenses);
    const expenseMean = calculateMean(dailyExpenses);
    const coefficientOfVariation = expenseMean > 0 ? expenseStdDev / expenseMean : 0;
    
    let consistencyScore = 100;
    if (coefficientOfVariation > 1.5) consistencyScore = 30;
    else if (coefficientOfVariation > 1) consistencyScore = 50;
    else if (coefficientOfVariation > 0.5) consistencyScore = 70;
    else if (coefficientOfVariation > 0.3) consistencyScore = 85;
    
    factors.push({
      name: 'Spending Consistency',
      score: consistencyScore,
      weight: 0.3,
      description: coefficientOfVariation < 0.5 
        ? 'Your spending is stable and predictable'
        : 'Your spending varies significantly day to day',
    });
    
    // Factor 3: Anomaly Frequency (30% weight)
    const anomalyCount = transactions.filter(t => t.isAnomaly).length;
    const anomalyRate = transactions.length > 0 ? anomalyCount / transactions.length : 0;
    
    let anomalyScore = 100;
    if (anomalyRate > 0.3) anomalyScore = 30;
    else if (anomalyRate > 0.2) anomalyScore = 50;
    else if (anomalyRate > 0.1) anomalyScore = 70;
    else if (anomalyRate > 0.05) anomalyScore = 85;
    
    factors.push({
      name: 'Anomaly Frequency',
      score: anomalyScore,
      weight: 0.3,
      description: anomalyCount === 0 
        ? 'No unusual spending patterns detected'
        : `${anomalyCount} unusual transactions detected`,
    });
    
    // Calculate overall score
    const overallScore = factors.reduce(
      (sum, factor) => sum + factor.score * factor.weight,
      0
    );
    
    // Determine grade
    let grade;
    if (overallScore >= 90) grade = 'A';
    else if (overallScore >= 80) grade = 'B';
    else if (overallScore >= 70) grade = 'C';
    else if (overallScore >= 60) grade = 'D';
    else grade = 'F';
    
    // Generate recommendations
    const recommendations = [];
    
    if (ratioScore < 60) {
      recommendations.push('Try to increase your income or reduce expenses to improve your savings ratio');
    }
    if (consistencyScore < 60) {
      recommendations.push('Consider creating a budget to make your spending more predictable');
    }
    if (anomalyScore < 60) {
      recommendations.push('Review your unusual transactions and identify any unnecessary spending');
    }
    if (expense === 0 && income === 0) {
      recommendations.push('Start logging your transactions to get accurate financial insights');
    }
    
    return {
      score: Math.round(overallScore),
      grade,
      factors,
      recommendations,
      calculatedAt: new Date(),
    };
  },
};
