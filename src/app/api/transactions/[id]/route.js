import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/middleware/auth.middleware.js';
import { withRBAC } from '@/middleware/rbac.middleware.js';
import { transactionService } from '@/services/transaction.service.js';
import { updateTransactionSchema, validateRequest } from '@/validations/schemas.js';
import { Role } from '@/lib/constants.js';

// GET /api/transactions/[id] - Get single transaction
export async function GET(
  request,
  { params }
) {
  const { id } = await params;
  
  return withAuth(request, async (req, user) => {
    return withRBAC(req, user, 'transactions', 'read', async (_, effectiveUser) => {
      try {
        const userId = effectiveUser.role === Role.ADMIN ? undefined : effectiveUser.userId;
        const transaction = await transactionService.getById(id, userId);
        
        if (!transaction) {
          return NextResponse.json(
            { success: false, error: 'Transaction not found' },
            { status: 404 }
          );
        }
        
        return NextResponse.json({
          success: true,
          data: transaction,
        });
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Failed to get transaction';
        return NextResponse.json(
          { success: false, error: message },
          { status: 500 }
        );
      }
    });
  });
}

// PATCH /api/transactions/[id] - Update transaction (Admin or owner)
export async function PATCH(
  request,
  { params }
) {
  const { id } = await params;
  
  return withAuth(request, async (req, user) => {
    return withRBAC(req, user, 'transactions', 'update', async (_, effectiveUser) => {
      try {
        // Check ownership for non-admin users
        if (effectiveUser.role !== Role.ADMIN) {
          const existing = await transactionService.getById(id, effectiveUser.userId);
          if (!existing) {
            return NextResponse.json(
              { success: false, error: 'Transaction not found or access denied' },
              { status: 404 }
            );
          }
        }
        
        const body = await req.json();
        
        // Validate input
        const validation = validateRequest(updateTransactionSchema, body);
        if (!validation.success) {
          return NextResponse.json(
            { success: false, error: validation.error },
            { status: 400 }
          );
        }
        
        const transaction = await transactionService.update(id, validation.data, effectiveUser.userId);
        
        return NextResponse.json({
          success: true,
          data: transaction,
          message: 'Transaction updated successfully',
        });
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Failed to update transaction';
        const status = message.includes('not found') ? 404 : 500;
        return NextResponse.json(
          { success: false, error: message },
          { status }
        );
      }
    });
  });
}

// DELETE /api/transactions/[id] - Soft delete transaction (Admin or owner)
export async function DELETE(
  request,
  { params }
) {
  const { id } = await params;
  
  return withAuth(request, async (req, user) => {
    return withRBAC(req, user, 'transactions', 'delete', async (_, effectiveUser) => {
      try {
        // Check ownership for non-admin users
        if (effectiveUser.role !== Role.ADMIN) {
          const existing = await transactionService.getById(id, effectiveUser.userId);
          if (!existing) {
            return NextResponse.json(
              { success: false, error: 'Transaction not found or access denied' },
              { status: 404 }
            );
          }
        }
        
        await transactionService.delete(id, effectiveUser.userId);
        
        return NextResponse.json({
          success: true,
          message: 'Transaction deleted successfully',
        });
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Failed to delete transaction';
        const status = message.includes('not found') ? 404 : 500;
        return NextResponse.json(
          { success: false, error: message },
          { status }
        );
      }
    });
  });
}
