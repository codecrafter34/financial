import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/middleware/auth.middleware.js';
import { userService } from '@/services/user.service.js';

export async function GET(request) {
  return withAuth(request, async (req, user) => {
    try {
      const userData = await userService.getById(user.userId);
      
      if (!userData) {
        return NextResponse.json(
          { success: false, error: 'User not found' },
          { status: 404 }
        );
      }
      
      // Update last activity
      await userService.updateActivity(user.userId, 'Viewed profile');
      
      return NextResponse.json({
        success: true,
        data: userData,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to get user';
      return NextResponse.json(
        { success: false, error: message },
        { status: 500 }
      );
    }
  });
}
