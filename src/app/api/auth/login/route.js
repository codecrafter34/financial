import { NextRequest, NextResponse } from 'next/server';
import { userService } from '@/services/user.service.js';
import { loginSchema, validateRequest } from '@/validations/schemas.js';

export async function POST(request) {
  try {
    const body = await request.json();
    
    // Validate input
    const validation = validateRequest(loginSchema, body);
    if (!validation.success) {
      return NextResponse.json(
        { success: false, error: validation.error },
        { status: 400 }
      );
    }
    
    const { email, password } = validation.data;
    
    // Attempt login
    const result = await userService.login(email, password);
    
    return NextResponse.json({
      success: true,
      data: result,
      message: 'Login successful',
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Login failed';
    return NextResponse.json(
      { success: false, error: message },
      { status: 401 }
    );
  }
}
