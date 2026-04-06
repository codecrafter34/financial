import { z } from 'zod';
import { Role, UserStatus, TransactionType, Category } from '@/lib/constants';

// Login schema
export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

// Register schema
export const registerSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
  name: z.string().min(2, 'Name must be at least 2 characters'),
  role: z.enum([Role.VIEWER, Role.ANALYST, Role.ADMIN]).optional(),
});

// Create user schema (alias for registerSchema for admin user creation)
export const createUserSchema = registerSchema;

// User update schema
export const updateUserSchema = z.object({
  name: z.string().min(2).optional(),
  role: z.enum([Role.VIEWER, Role.ANALYST, Role.ADMIN]).optional(),
  status: z.enum([UserStatus.ACTIVE, UserStatus.INACTIVE, UserStatus.SUSPENDED]).optional(),
});

// Transaction create schema
export const createTransactionSchema = z.object({
  amount: z.number().positive('Amount must be positive'),
  type: z.enum([TransactionType.INCOME, TransactionType.EXPENSE]),
  category: z.enum([
    Category.SALARY, Category.FREELANCE, Category.INVESTMENT,
    Category.FOOD, Category.TRANSPORT, Category.UTILITIES,
    Category.ENTERTAINMENT, Category.HEALTHCARE, Category.SHOPPING,
    Category.EDUCATION, Category.TRAVEL, Category.OTHER,
  ]),
  date: z.string().datetime().optional().or(z.date().optional()),
  notes: z.string().max(500).optional(),
  tags: z.array(z.string()).optional(),
});

// Transaction update schema
export const updateTransactionSchema = createTransactionSchema.partial();

// Transaction filters schema
export const transactionFiltersSchema = z.object({
  type: z.enum([TransactionType.INCOME, TransactionType.EXPENSE]).optional(),
  category: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  isAnomaly: z.coerce.boolean().optional(),
  page: z.coerce.number().min(1).optional(),
  limit: z.coerce.number().min(1).max(100).optional(),
});

// Event filter schema
export const eventFilterSchema = z.object({
  userId: z.string().optional(),
  action: z.string().optional(),
  entityType: z.string().optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  page: z.coerce.number().min(1).optional(),
  limit: z.coerce.number().min(1).max(100).optional(),
});

// Alias for consistency
export const eventFiltersSchema = eventFilterSchema;

// Analytics period schema
export const analyticsPeriodSchema = z.enum(['week', 'month', 'quarter', 'year']);
export const periodSchema = analyticsPeriodSchema;

// Trend query schema
export const trendQuerySchema = z.object({
  period: z.enum(['week', 'month', 'quarter', 'year']).optional(),
  groupBy: z.enum(['day', 'week', 'month']).optional(),
});

// Validation helper - validates input and returns data or throws
export function validateInput(schema, data) {
  const result = schema.safeParse(data);
  if (!result.success) {
    const errors = result.error.errors.map(e => e.message).join(', ');
    throw new Error(errors);
  }
  return result.data;
}

// Safe validation - returns object with success/error/data
export function validateRequest(schema, data) {
  const result = schema.safeParse(data);
  if (!result.success) {
    const errors = result.error.errors.map(e => e.message).join(', ');
    return { success: false, error: errors, data: null };
  }
  return { success: true, error: null, data: result.data };
}
