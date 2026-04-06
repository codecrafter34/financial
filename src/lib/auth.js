import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-key-change-in-production';
const JWT_EXPIRES_IN = '7d';

// Hash password with bcrypt
export async function hashPassword(password) {
  const salt = await bcrypt.genSalt(12);
  return bcrypt.hash(password, salt);
}

// Compare password with hash
export async function comparePassword(password, hash) {
  return bcrypt.compare(password, hash);
}

// Generate JWT token
export function generateToken(user) {
  const payload = {
    userId: user.id,
    email: user.email,
    role: user.role,
    status: user.status,
  };
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

// Verify JWT token
export function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch {
    return null;
  }
}

// Extract token from Authorization header
export function extractToken(authHeader) {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  return authHeader.substring(7);
}

// Permission matrix for RBAC
// VIEWER: Read-only access to own transactions
// ANALYST: Can create/update/delete own transactions + advanced analytics
// ADMIN: Full access to all data and users
export const PERMISSION_MATRIX = {
  VIEWER: {
    transactions: ['read'],
    analytics: ['read:basic'],
    events: ['read:own'],
    users: [],
  },
  ANALYST: {
    transactions: ['create', 'read', 'update', 'delete'],
    analytics: ['read:basic', 'read:insights', 'read:trends', 'read:health'],
    events: ['read:own'],
    users: ['read:own'],
  },
  ADMIN: {
    transactions: ['create', 'read', 'update', 'delete', 'restore'],
    analytics: ['read:basic', 'read:insights', 'read:trends', 'read:health', 'export'],
    events: ['read:all'],
    users: ['create', 'read', 'update', 'delete'],
  },
};

// Check if user has permission
export function hasPermission(role, resource, action) {
  const permissions = PERMISSION_MATRIX[role]?.[resource] || [];
  return permissions.includes(action) || permissions.includes('*');
}

// Get allowed actions for a resource
export function getAllowedActions(role, resource) {
  return PERMISSION_MATRIX[role]?.[resource] || [];
}
