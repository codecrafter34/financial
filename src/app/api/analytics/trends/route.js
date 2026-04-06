import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/middleware/auth.middleware.js';
import { withRBAC } from '@/middleware/rbac.middleware.js';
import { analyticsService } from '@/services/analytics.service.js';
import { trendQuerySchema, validateRequest } from '@/validations/schemas.js';
import { Role } from '@/lib/constants.js';

// GET /api/analytics/trends - Get trend data (Analyst/Admin)
export async function GET(request) {
  return withAuth(request, async (req, user) => {
    return withRBAC(req, user, 'analytics', 'read:trends', async (_, effectiveUser) => {
      try {
        const { searchParams } = new URL(req.url);
        
        // Parse and validate query
        const queryParams = {
          period: searchParams.get('period') || 'month',
          groupBy: searchParams.get('groupBy') || 'day',
        };
        
        const validation = validateRequest(trendQuerySchema, queryParams);
        if (!validation.success) {
          return NextResponse.json(
            { success: false, error: validation.error },
            { status: 400 }
          );
        }
        
        // Admin sees all, others see their own
        const userId = effectiveUser.role === Role.ADMIN ? undefined : effectiveUser.userId;
        
        const trends = await analyticsService.getTrends(
          userId,
          effectiveUser.role,
          validation.data.period,
          validation.data.groupBy
        );
        
        return NextResponse.json({
          success: true,
          data: trends,
        });
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Failed to get trends';
        return NextResponse.json(
          { success: false, error: message },
          { status: 500 }
        );
      }
    });
  });
}
