import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/middleware/auth.middleware.js';
import { withRBAC } from '@/middleware/rbac.middleware.js';
import { analyticsService } from '@/services/analytics.service.js';
import { periodSchema, validateRequest } from '@/validations/schemas.js';
import { Role } from '@/lib/constants.js';

// GET /api/analytics/summary - Get financial summary
export async function GET(request) {
  return withAuth(request, async (req, user) => {
    return withRBAC(req, user, 'analytics', 'read:basic', async (_, effectiveUser) => {
      try {
        const { searchParams } = new URL(req.url);
        const periodParam = searchParams.get('period') || 'month';
        
        // Validate period
        const validation = validateRequest(periodSchema, periodParam);
        if (!validation.success) {
          return NextResponse.json(
            { success: false, error: 'Invalid period. Use: week, month, quarter, or year' },
            { status: 400 }
          );
        }
        
        // Admin sees all, others see their own
        const userId = effectiveUser.role === Role.ADMIN ? undefined : effectiveUser.userId;
        
        const summary = await analyticsService.getSummary(
          userId,
          effectiveUser.role,
          validation.data
        );
        
        return NextResponse.json({
          success: true,
          data: summary,
        });
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Failed to get summary';
        return NextResponse.json(
          { success: false, error: message },
          { status: 500 }
        );
      }
    });
  });
}
