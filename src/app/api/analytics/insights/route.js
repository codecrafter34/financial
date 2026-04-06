import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/middleware/auth.middleware.js';
import { withRBAC } from '@/middleware/rbac.middleware.js';
import { analyticsService } from '@/services/analytics.service.js';

// GET /api/analytics/insights - Get AI-generated insights (Analyst/Admin)
export async function GET(request) {
  return withAuth(request, async (req, user) => {
    return withRBAC(req, user, 'analytics', 'read:insights', async () => {
      try {
        const insights = await analyticsService.getInsights(user.userId);
        
        return NextResponse.json({
          success: true,
          data: insights,
          message: `Generated ${insights.length} insights`,
        });
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Failed to generate insights';
        return NextResponse.json(
          { success: false, error: message },
          { status: 500 }
        );
      }
    });
  });
}
