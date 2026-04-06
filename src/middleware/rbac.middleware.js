import { NextResponse } from 'next/server';
import { Role } from '@/lib/constants';
import { hasPermission, PERMISSION_MATRIX } from '@/lib/auth';

// Error response helper
function errorResponse(message, status) {
  return NextResponse.json(
    { success: false, error: message },
    { status }
  );
}

// RBAC middleware - checks role permissions
export async function withRBAC(request, user, resource, action, handler) {
  const viewAsRole = request.headers.get('x-view-as-role');
  
  let effectiveRole = user.role;
  
  if (viewAsRole && user.role === Role.ADMIN) {
    if (Object.values(Role).includes(viewAsRole)) {
      effectiveRole = viewAsRole;
    }
  }
  
  if (!hasPermission(effectiveRole, resource, action)) {
    return errorResponse(
      'Access denied: ' + effectiveRole + ' role cannot ' + action + ' ' + resource,
      403
    );
  }
  
  return handler(request, { ...user, role: effectiveRole });
}

// Get role-specific data filter
export function getRoleDataFilter(role, userId) {
  switch (role) {
    case Role.VIEWER:
    case Role.ANALYST:
      return { userId };
    case Role.ADMIN:
      return {};
    default:
      return { userId };
  }
}

// Get allowed fields based on role
export function getAllowedFields(role, resource) {
  const fieldMatrix = {
    VIEWER: {
      transactions: ['id', 'amount', 'type', 'category', 'date', 'notes'],
      users: ['id', 'name', 'email'],
      analytics: ['totalIncome', 'totalExpense', 'netBalance'],
    },
    ANALYST: {
      transactions: ['id', 'amount', 'type', 'category', 'date', 'notes', 'tags', 'isAnomaly', 'anomalyReason'],
      users: ['id', 'name', 'email', 'role'],
      analytics: ['*'],
    },
    ADMIN: {
      transactions: ['*'],
      users: ['*'],
      analytics: ['*'],
    },
  };
  
  return fieldMatrix[role]?.[resource] || [];
}

// Filter response data based on role
export function filterResponseByRole(data, role, resource) {
  const allowedFields = getAllowedFields(role, resource);
  
  if (allowedFields.includes('*')) {
    return data;
  }
  
  const filtered = {};
  for (const field of allowedFields) {
    if (field in data) {
      filtered[field] = data[field];
    }
  }
  
  return filtered;
}

// Check if role can perform bulk operations
export function canPerformBulkOperations(role) {
  return role === Role.ADMIN;
}

// Get rate limit based on role
export function getRoleRateLimit(role) {
  const limits = {
    VIEWER: { requests: 100, windowMs: 60000 },
    ANALYST: { requests: 200, windowMs: 60000 },
    ADMIN: { requests: 500, windowMs: 60000 },
  };
  
  return limits[role] || limits.VIEWER;
}

// Get available permissions for role
export function getRolePermissions(role) {
  return PERMISSION_MATRIX[role] || {};
}
