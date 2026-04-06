import prisma from '@/lib/prisma';
import { TransactionType, Category, EventAction } from '@/lib/constants';
import { eventService } from './event.service.js';
import { aiEngine } from './ai-engine.service.js';

// Transform transaction to public format
function toPublic(tx) {
  return {
    id: tx.id,
    userId: tx.userId,
    amount: tx.amount,
    type: tx.type,
    category: tx.category,
    date: tx.date,
    notes: tx.notes,
    tags: tx.tags || [],
    isAnomaly: tx.isAnomaly,
    anomalyReason: tx.anomalyReason,
    anomalyScore: tx.anomalyScore,
    createdAt: tx.createdAt,
  };
}

export const transactionService = {
  // Create new transaction
  async create(userId, input) {
    // Create the transaction
    const transaction = await prisma.transaction.create({
      data: {
        userId,
        amount: input.amount,
        type: input.type,
        category: input.category,
        date: input.date || new Date(),
        notes: input.notes,
        tags: input.tags || [],
      },
    });
    
    // Run anomaly detection
    const anomalyResult = await aiEngine.detectAnomaly(transaction);
    
    // Update if anomaly detected
    if (anomalyResult.isAnomaly) {
      await prisma.transaction.update({
        where: { id: transaction.id },
        data: {
          isAnomaly: true,
          anomalyReason: anomalyResult.reason,
          anomalyScore: anomalyResult.score,
        },
      });
      
      // Log anomaly event
      await eventService.log({
        userId,
        action: EventAction.ANOMALY_DETECTED,
        entityType: 'Transaction',
        entityId: transaction.id,
        payload: { reason: anomalyResult.reason, score: anomalyResult.score },
      });
    }
    
    // Log creation event
    await eventService.log({
      userId,
      action: EventAction.TRANSACTION_CREATED,
      entityType: 'Transaction',
      entityId: transaction.id,
      payload: { type: input.type, amount: input.amount, category: input.category },
    });
    
    return toPublic({
      ...transaction,
      isAnomaly: anomalyResult.isAnomaly,
      anomalyReason: anomalyResult.isAnomaly ? anomalyResult.reason : null,
      anomalyScore: anomalyResult.isAnomaly ? anomalyResult.score : null,
    });
  },
  
  // Get transaction by ID
  async getById(id, userId) {
    const where = { id, isDeleted: false };
    if (userId) where.userId = userId;
    
    const transaction = await prisma.transaction.findFirst({ where });
    return transaction ? toPublic(transaction) : null;
  },
  
  // Get transactions with filters and pagination
  async getMany(filters, userId) {
    const { page = 1, limit = 20, ...filterOptions } = filters;
    
    const where = { isDeleted: false };
    
    // Apply user filter if provided
    if (userId) where.userId = userId;
    
    // Apply type filter
    if (filterOptions.type) where.type = filterOptions.type;
    
    // Apply category filter
    if (filterOptions.category) where.category = filterOptions.category;
    
    // Apply date range
    if (filterOptions.startDate || filterOptions.endDate) {
      where.date = {};
      if (filterOptions.startDate) where.date.gte = filterOptions.startDate;
      if (filterOptions.endDate) where.date.lte = filterOptions.endDate;
    }
    
    // Apply amount range
    if (filterOptions.minAmount || filterOptions.maxAmount) {
      where.amount = {};
      if (filterOptions.minAmount) where.amount.gte = filterOptions.minAmount;
      if (filterOptions.maxAmount) where.amount.lte = filterOptions.maxAmount;
    }
    
    // Apply anomaly filter
    if (filterOptions.isAnomaly !== undefined) {
      where.isAnomaly = filterOptions.isAnomaly;
    }
    
    // Apply tags filter (MongoDB: use native array query)
    if (filterOptions.tags && filterOptions.tags.length > 0) {
      where.tags = { hasSome: filterOptions.tags };
    }
    
    // Apply search (notes)
    if (filterOptions.search) {
      where.notes = { contains: filterOptions.search };
    }
    
    const [transactions, total] = await Promise.all([
      prisma.transaction.findMany({
        where,
        orderBy: { date: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.transaction.count({ where }),
    ]);
    
    return {
      transactions: transactions.map(toPublic),
      total,
    };
  },
  
  // Update transaction
  async update(id, input, userId) {
    const existing = await prisma.transaction.findFirst({
      where: { id, isDeleted: false },
    });
    
    if (!existing) {
      throw new Error('Transaction not found');
    }
    
    // Build update data
    const updateData = {
      ...input,
      updatedAt: new Date(),
    };
    if (input.tags) {
      updateData.tags = input.tags;
    }
    
    const transaction = await prisma.transaction.update({
      where: { id },
      data: updateData,
    });
    
    // Re-run anomaly detection if amount changed
    if (input.amount && input.amount !== existing.amount) {
      const anomalyResult = await aiEngine.detectAnomaly(transaction);
      
      await prisma.transaction.update({
        where: { id },
        data: {
          isAnomaly: anomalyResult.isAnomaly,
          anomalyReason: anomalyResult.isAnomaly ? anomalyResult.reason : null,
          anomalyScore: anomalyResult.isAnomaly ? anomalyResult.score : null,
        },
      });
    }
    
    // Log update event
    await eventService.log({
      userId,
      action: EventAction.TRANSACTION_UPDATED,
      entityType: 'Transaction',
      entityId: id,
      payload: { changes: input },
    });
    
    return toPublic(transaction);
  },
  
  // Soft delete transaction
  async delete(id, userId) {
    const transaction = await prisma.transaction.findFirst({
      where: { id, isDeleted: false },
    });
    
    if (!transaction) {
      throw new Error('Transaction not found');
    }
    
    await prisma.transaction.update({
      where: { id },
      data: { isDeleted: true, deletedAt: new Date() },
    });
    
    // Log delete event
    await eventService.log({
      userId,
      action: EventAction.TRANSACTION_DELETED,
      entityType: 'Transaction',
      entityId: id,
      payload: { amount: transaction.amount, type: transaction.type },
    });
  },
  
  // Restore deleted transaction
  async restore(id, userId) {
    const transaction = await prisma.transaction.findFirst({
      where: { id, isDeleted: true },
    });
    
    if (!transaction) {
      throw new Error('Transaction not found or not deleted');
    }
    
    const restored = await prisma.transaction.update({
      where: { id },
      data: { isDeleted: false, deletedAt: null },
    });
    
    // Log restore event
    await eventService.log({
      userId,
      action: EventAction.TRANSACTION_RESTORED,
      entityType: 'Transaction',
      entityId: id,
    });
    
    return toPublic(restored);
  },
  
  // Get category totals
  async getCategoryTotals(userId, startDate, endDate) {
    const where = { isDeleted: false };
    if (userId) where.userId = userId;
    if (startDate || endDate) {
      where.date = {};
      if (startDate) where.date.gte = startDate;
      if (endDate) where.date.lte = endDate;
    }
    
    const results = await prisma.transaction.groupBy({
      by: ['category', 'type'],
      where,
      _sum: { amount: true },
      _count: { id: true },
    });
    
    return results.map(r => ({
      category: r.category,
      type: r.type,
      total: r._sum.amount || 0,
      count: r._count.id,
    }));
  },
  
  // Get totals by type
  async getTotalsByType(userId, startDate, endDate) {
    const where = { isDeleted: false };
    if (userId) where.userId = userId;
    if (startDate || endDate) {
      where.date = {};
      if (startDate) where.date.gte = startDate;
      if (endDate) where.date.lte = endDate;
    }
    
    const results = await prisma.transaction.groupBy({
      by: ['type'],
      where,
      _sum: { amount: true },
    });
    
    const income = results.find(r => r.type === TransactionType.INCOME)?._sum.amount || 0;
    const expense = results.find(r => r.type === TransactionType.EXPENSE)?._sum.amount || 0;
    
    return { income, expense };
  },
};
