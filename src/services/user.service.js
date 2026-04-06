import prisma from '@/lib/prisma';
import { hashPassword, comparePassword, generateToken } from '@/lib/auth';
import { Role, UserStatus, EventAction } from '@/lib/constants';
import { eventService } from './event.service';

// Transform user to public format (exclude password)
function toPublic(user) {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    status: user.status,
    lastActiveAt: user.lastActiveAt,
    lastAction: user.lastAction,
    createdAt: user.createdAt,
  };
}

export const userService = {
  // Register new user
  async register(input) {
    const existingUser = await prisma.user.findUnique({
      where: { email: input.email },
    });
    
    if (existingUser) {
      throw new Error('Email already registered');
    }
    
    const hashedPassword = await hashPassword(input.password);
    
    const user = await prisma.user.create({
      data: {
        email: input.email,
        password: hashedPassword,
        name: input.name,
        role: input.role || Role.VIEWER,
        status: UserStatus.ACTIVE,
        lastActiveAt: new Date(),
        lastAction: 'Registered',
      },
    });
    
    await eventService.log({
      userId: user.id,
      action: EventAction.USER_REGISTERED,
      entityType: 'User',
      entityId: user.id,
      payload: { email: user.email, role: user.role },
    });
    
    const token = generateToken(toPublic(user));
    
    return { user: toPublic(user), token };
  },
  
  // Login user
  async login(email, password) {
    const user = await prisma.user.findUnique({
      where: { email },
    });
    
    if (!user) {
      throw new Error('Invalid email or password');
    }
    
    if (user.status !== UserStatus.ACTIVE) {
      throw new Error('Account is not active');
    }
    
    const isValidPassword = await comparePassword(password, user.password);
    
    if (!isValidPassword) {
      throw new Error('Invalid email or password');
    }
    
    await prisma.user.update({
      where: { id: user.id },
      data: { lastActiveAt: new Date(), lastAction: 'Logged in' },
    });
    
    await eventService.log({
      userId: user.id,
      action: EventAction.USER_LOGIN,
      entityType: 'User',
      entityId: user.id,
    });
    
    const token = generateToken(toPublic(user));
    
    return { user: toPublic(user), token };
  },
  
  // Get user by ID
  async getById(id) {
    const user = await prisma.user.findUnique({
      where: { id },
    });
    
    return user ? toPublic(user) : null;
  },
  
  // Get all users (admin only)
  async getAll(page = 1, limit = 20) {
    const [users, total] = await Promise.all([
      prisma.user.findMany({
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.user.count(),
    ]);
    
    return {
      users: users.map(toPublic),
      total,
    };
  },
  
  // Update user
  async update(id, input, actorId) {
    const oldUser = await prisma.user.findUnique({ where: { id } });
    
    if (!oldUser) {
      throw new Error('User not found');
    }
    
    const user = await prisma.user.update({
      where: { id },
      data: {
        ...input,
        updatedAt: new Date(),
      },
    });
    
    if (input.role && input.role !== oldUser.role) {
      await eventService.log({
        userId: actorId,
        action: EventAction.USER_ROLE_CHANGED,
        entityType: 'User',
        entityId: id,
        payload: { oldRole: oldUser.role, newRole: input.role },
      });
    }
    
    if (input.status && input.status !== oldUser.status) {
      await eventService.log({
        userId: actorId,
        action: EventAction.USER_STATUS_CHANGED,
        entityType: 'User',
        entityId: id,
        payload: { oldStatus: oldUser.status, newStatus: input.status },
      });
    }
    
    return toPublic(user);
  },
  
  // Delete user (soft delete via status change)
  async delete(id, actorId) {
    const user = await prisma.user.findUnique({ where: { id } });
    
    if (!user) {
      throw new Error('User not found');
    }
    
    await prisma.user.update({
      where: { id },
      data: { status: UserStatus.INACTIVE },
    });
    
    await eventService.log({
      userId: actorId,
      action: EventAction.USER_DELETED,
      entityType: 'User',
      entityId: id,
    });
  },
  
  // Update last activity
  async updateActivity(id, action) {
    await prisma.user.update({
      where: { id },
      data: { lastActiveAt: new Date(), lastAction: action },
    });
  },
  
  // Get users by role
  async getByRole(role) {
    const users = await prisma.user.findMany({
      where: { role, status: UserStatus.ACTIVE },
    });
    
    return users.map(toPublic);
  },
};
