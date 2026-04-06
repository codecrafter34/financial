import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/middleware/auth.middleware.js';
import { withRBAC } from '@/middleware/rbac.middleware.js';
import { transactionService } from '@/services/transaction.service.js';
import { 
  createTransactionSchema, 
  transactionFiltersSchema,
  validateRequest 
} from '@/validations/schemas.js';
import { Role } from '@/lib/constants.js';

// GET /api/transactions - List transactions
export async function GET(request) {
  return withAuth(request, async (req, user) => {
    return withRBAC(req, user, 'transactions', 'read', async (_, effectiveUser) => {
      try {
        const { searchParams } = new URL(req.url);
        
        // Parse query parameters
        const filters = {};
        for (const [key, value] of searchParams.entries()) {
          filters[key] = value;
        }
        
        // Validate filters
        const validation = validateRequest(transactionFiltersSchema, filters);
        if (!validation.success) {
          return NextResponse.json(
            { success: false, error: validation.error },
            { status: 400 }
          );
        }
        
        // Apply role-based filtering
        const userId = effectiveUser.role === Role.ADMIN 
          ? undefined 
          : effectiveUser.userId;
        
        const result = await transactionService.getMany(validation.data, userId);
        
        return NextResponse.json({
          success: true,
          data: result,
          meta: {
            page: validation.data.page,
            limit: validation.data.limit,
            total: result.total,
            totalPages: Math.ceil(result.total / validation.data.limit),
          },
        });
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Failed to get transactions';
        return NextResponse.json(
          { success: false, error: message },
          { status: 500 }
        );
      }
    });
  });
}

// POST /api/transactions - Create transaction (Admin and Analyst)
export async function POST(request) {
  return withAuth(request, async (req, user) => {
    return withRBAC(req, user, 'transactions', 'create', async (_, effectiveUser) => {
      try {
        const body = await req.json();
        
        // Validate input
        const validation = validateRequest(createTransactionSchema, body);
        if (!validation.success) {
          return NextResponse.json(
            { success: false, error: validation.error },
            { status: 400 }
          );
        }
        
        // Admin can create for any user, others can only create for themselves
        let targetUserId;
        if (effectiveUser.role === Role.ADMIN && body.userId) {
          targetUserId = body.userId;
        } else {
          targetUserId = effectiveUser.userId;
        }
        
        const transaction = await transactionService.create(targetUserId, validation.data);
        
        return NextResponse.json(
          {
            success: true,
            data: transaction,
            message: transaction.isAnomaly 
              ? 'Transaction created - anomaly detected!'
              : 'Transaction created successfully',
          },
          { status: 201 }
        );
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Failed to create transaction';
        return NextResponse.json(
          { success: false, error: message },
          { status: 500 }
        );
      }
    });
  });
}
