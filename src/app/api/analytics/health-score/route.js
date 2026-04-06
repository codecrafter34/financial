import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/middleware/auth.middleware.js';
import { withRBAC } from '@/middleware/rbac.middleware.js';
import { analyticsService } from '@/services/analytics.service.js';

// GET /api/analytics/health-score - Get financial health score (Analyst/Admin)
export async function GET(request) {
  return withAuth(request, async (req, user) => {
    return withRBAC(req, user, 'analytics', 'read:health', async () => {
      try {
        const healthScore = await analyticsService.getHealthScore(user.userId);
        
        return NextResponse.json({
          success: true,
          data: healthScore,
        });
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Failed to calculate health score';
        return NextResponse.json(
          { success: false, error: message },
          { status: 500 }
        );
      }
    });
  });
}
