import prisma from '@/lib/prisma';
import { EventAction } from '@/lib/constants';

// Parse JSON safely (for MongoDB, payload is already JSON)
function parseJson(value) {
  if (!value) return null;
  if (typeof value === 'string') {
    try {
      return JSON.parse(value);
    } catch {
      return null;
    }
  }
  return value;
}

// Generate human-readable event description
function generateEventDescription(event) {
  const userName = event.user?.name || 'System';
  const payload = event.payload;
  
  const descriptions = {
    [EventAction.USER_LOGIN]: () => userName + ' logged in',
    [EventAction.USER_LOGOUT]: () => userName + ' logged out',
    [EventAction.USER_REGISTERED]: () => 'New user ' + userName + ' registered',
    [EventAction.USER_CREATED]: () => 'Admin created user ' + (payload?.email || ''),
    [EventAction.USER_UPDATED]: () => 'User profile updated',
    [EventAction.USER_DELETED]: () => 'User account deactivated',
    [EventAction.USER_ROLE_CHANGED]: () => 
      'Role changed from ' + payload?.oldRole + ' to ' + payload?.newRole,
    [EventAction.USER_STATUS_CHANGED]: () => 
      'Status changed from ' + payload?.oldStatus + ' to ' + payload?.newStatus,
    [EventAction.TRANSACTION_CREATED]: () => 
      'Created ' + payload?.type + ' transaction of $' + payload?.amount,
    [EventAction.TRANSACTION_UPDATED]: () => 'Transaction updated',
    [EventAction.TRANSACTION_DELETED]: () => 'Transaction deleted',
    [EventAction.TRANSACTION_RESTORED]: () => 'Transaction restored',
    [EventAction.ANOMALY_DETECTED]: () => 
      'Anomaly detected: ' + (payload?.reason || 'Unusual activity'),
    [EventAction.INSIGHT_GENERATED]: () => 'New insight generated',
    [EventAction.HEALTH_SCORE_CALCULATED]: () => 
      'Health score calculated: ' + (payload?.score || 0) + '/100',
    [EventAction.PERMISSION_DENIED]: () => 
      'Permission denied for ' + payload?.action + ' on ' + payload?.resource,
    [EventAction.VIEW_AS_ACTIVATED]: () => 
      'Admin viewing as ' + payload?.simulatedRole + ' role',
  };
  
  return descriptions[event.action]?.() || event.action;
}

// Transform event to public format
async function toPublic(event) {
  const parsedPayload = parseJson(event.payload);
  const parsedMetadata = parseJson(event.metadata);
  
  return {
    id: event.id,
    userId: event.userId,
    action: event.action,
    entityType: event.entityType,
    entityId: event.entityId,
    payload: parsedPayload,
    metadata: parsedMetadata,
    createdAt: event.createdAt,
    userName: event.user?.name,
    description: generateEventDescription({ ...event, payload: parsedPayload }),
  };
}

export const eventService = {
  // Log a new event
  async log(input) {
    await prisma.event.create({
      data: {
        userId: input.userId,
        action: input.action,
        entityType: input.entityType,
        entityId: input.entityId,
        payload: input.payload || {},
        metadata: input.metadata || {},
      },
    });
  },
  
  // Get events with pagination and filters
  async getEvents(options = {}) {
    const {
      userId,
      action,
      entityType,
      startDate,
      endDate,
      page = 1,
      limit = 50,
      ownOnly = false,
      requesterId,
    } = options;
    
    const where = {};
    
    if (ownOnly && requesterId) {
      where.userId = requesterId;
    } else if (userId) {
      where.userId = userId;
    }
    
    if (action) {
      where.action = action;
    }
    
    if (entityType) {
      where.entityType = entityType;
    }
    
    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = startDate;
      if (endDate) where.createdAt.lte = endDate;
    }
    
    const [events, total] = await Promise.all([
      prisma.event.findMany({
        where,
        include: { user: { select: { name: true } } },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.event.count({ where }),
    ]);
    
    const publicEvents = await Promise.all(events.map(toPublic));
    
    return { events: publicEvents, total };
  },
  
  // Get recent activity for a user
  async getRecentActivity(userId, limit = 10) {
    const events = await prisma.event.findMany({
      where: { userId },
      include: { user: { select: { name: true } } },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
    
    return Promise.all(events.map(toPublic));
  },
  
  // Get activity timeline (for dashboard)
  async getActivityTimeline(options = {}) {
    const { userId, days = 7, limit = 50 } = options;
    
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    
    const where = {
      createdAt: { gte: startDate },
    };
    
    if (userId) {
      where.userId = userId;
    }
    
    const events = await prisma.event.findMany({
      where,
      include: { user: { select: { name: true } } },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
    
    return Promise.all(events.map(toPublic));
  },
  
  // Count events by action type
  async countByAction(userId) {
    const where = userId ? { userId } : {};
    
    const counts = await prisma.event.groupBy({
      by: ['action'],
      where,
      _count: { action: true },
    });
    
    const result = {};
    for (const item of counts) {
      result[item.action] = item._count.action;
    }
    
    return result;
  },
};
