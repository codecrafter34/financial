import { NextResponse } from 'next/server';
import { userService } from '@/services/user.service.js';
import { registerSchema, validateRequest } from '@/validations/schemas.js';

export async function POST(request) {
  try {
    const body = await request.json();
    
    // Validate input
    const validation = validateRequest(registerSchema, body);
    
    if (!validation.success) {
      return NextResponse.json(
        { success: false, error: validation.error },
        { status: 400 }
      );
    }
    
    const { email, password, name, role } = validation.data;
    
    // Register user with selected role
    const result = await userService.register({ email, password, name, role });
    
    return NextResponse.json(
      {
        success: true,
        data: result,
        message: 'Registration successful',
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Registration error:', error);
    const message = error instanceof Error ? error.message : 'Registration failed';
    const status = message.includes('already registered') ? 409 : 500;
    return NextResponse.json(
      { success: false, error: message },
      { status }
    );
  }
}
