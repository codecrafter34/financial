import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/middleware/auth.middleware.js';
import { withRBAC } from '@/middleware/rbac.middleware.js';
import { userService } from '@/services/user.service.js';
import { createUserSchema, validateRequest } from '@/validations/schemas.js';
import { EventAction } from '@/lib/constants.js';
import { eventService } from '@/services/event.service.js';

// GET /api/users - List users (Admin only)
export async function GET(request) {
  return withAuth(request, async (req, user) => {
    return withRBAC(req, user, 'users', 'read', async () => {
      try {
        const { searchParams } = new URL(req.url);
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '20');
        
        const result = await userService.getAll(page, limit);
        
        return NextResponse.json({
          success: true,
          data: result,
          meta: {
            page,
            limit,
            total: result.total,
            totalPages: Math.ceil(result.total / limit),
          },
        });
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Failed to get users';
        return NextResponse.json(
          { success: false, error: message },
          { status: 500 }
        );
      }
    });
  });
}

// POST /api/users - Create user (Admin only)
export async function POST(request) {
  return withAuth(request, async (req, user) => {
    return withRBAC(req, user, 'users', 'create', async () => {
      try {
        const body = await req.json();
        
        // Validate input
        const validation = validateRequest(createUserSchema, body);
        if (!validation.success) {
          return NextResponse.json(
            { success: false, error: validation.error },
            { status: 400 }
          );
        }
        
        const result = await userService.register(validation.data);
        
        // Log admin action
        await eventService.log({
          userId: user.userId,
          action: EventAction.USER_CREATED,
          entityType: 'User',
          entityId: result.user.id,
          payload: { email: result.user.email, role: result.user.role },
        });
        
        return NextResponse.json(
          {
            success: true,
            data: result.user,
            message: 'User created successfully',
          },
          { status: 201 }
        );
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Failed to create user';
        return NextResponse.json(
          { success: false, error: message },
          { status: 500 }
        );
      }
    });
  });
}
