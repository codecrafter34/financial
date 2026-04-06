import { NextResponse } from 'next/server';
import { verifyToken, extractToken } from '@/lib/auth';
import { UserStatus } from '@/lib/constants';

// Error response helper
function errorResponse(message, status) {
  return NextResponse.json(
    { success: false, error: message },
    { status }
  );
}

// Auth middleware - validates JWT token
export async function withAuth(request, handler) {
  const authHeader = request.headers.get('authorization');
  const token = extractToken(authHeader);
  
  if (!token) {
    return errorResponse('Authentication required', 401);
  }
  
  const payload = verifyToken(token);
  
  if (!payload) {
    return errorResponse('Invalid or expired token', 401);
  }
  
  if (payload.status !== UserStatus.ACTIVE) {
    return errorResponse('Account is not active', 403);
  }
  
  return handler(request, payload);
}

// Get user from request (non-blocking)
export function getUserFromRequest(request) {
  const authHeader = request.headers.get('authorization');
  const token = extractToken(authHeader);
  
  if (!token) return null;
  
  return verifyToken(token);
}
