import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/middleware/auth.middleware.js';
import { withRBAC } from '@/middleware/rbac.middleware.js';
import { eventService } from '@/services/event.service.js';
import { eventFiltersSchema, validateRequest } from '@/validations/schemas.js';
import { Role, EventAction } from '@/lib/constants.js';

// GET /api/events - Get activity timeline
export async function GET(request) {
  return withAuth(request, async (req, user) => {
    // Determine required permission based on role
    const permission = user.role === Role.ADMIN ? 'read:all' : 'read:own';
    
    return withRBAC(req, user, 'events', permission, async (_, effectiveUser) => {
      try {
        const { searchParams } = new URL(req.url);
        
        // Parse filters
        const filters = {};
        for (const [key, value] of searchParams.entries()) {
          filters[key] = value;
        }
        
        // Validate filters
        const validation = validateRequest(eventFiltersSchema, filters);
        if (!validation.success) {
          return NextResponse.json(
            { success: false, error: validation.error },
            { status: 400 }
          );
        }
        
        const { page, limit, ...filterOptions } = validation.data;
        
        // Non-admins can only see their own events
        const ownOnly = effectiveUser.role !== Role.ADMIN;
        
        const result = await eventService.getEvents({
          ...filterOptions,
          action: filterOptions.action,
          page,
          limit,
          ownOnly,
          requesterId: effectiveUser.userId,
        });
        
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
        const message = error instanceof Error ? error.message : 'Failed to get events';
        return NextResponse.json(
          { success: false, error: message },
          { status: 500 }
        );
      }
    });
  });
}
