'use client';

import { useTransactions, useCreateTransaction, useDeleteTransaction, useUpdateTransaction } from '@/lib/api';
import { useAuthStore } from '@/lib/store';
import { formatCurrency, formatDate, cn } from '@/lib/utils';
import { TransactionType, Category } from '@/lib/constants';
import { useState } from 'react';
import {
  Plus,
  Search,
  Filter,
  Trash2,
  Edit2,
  AlertTriangle,
  ArrowUpCircle,
  ArrowDownCircle,
  ChevronLeft,
  ChevronRight,
  X,
} from 'lucide-react';

const categories = Object.values(Category);
const transactionTypes = Object.values(TransactionType);

export default function TransactionsPage() {
  const { getEffectiveRole } = useAuthStore();
  const effectiveRole = getEffectiveRole();
  const canCreate = effectiveRole === 'ADMIN' || effectiveRole === 'ANALYST';
  const canDelete = effectiveRole === 'ADMIN' || effectiveRole === 'ANALYST';
  
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState({});
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  
  const { data, isLoading, refetch } = useTransactions({ ...filters, page, limit: 20 });
  const createMutation = useCreateTransaction();
  const deleteMutation = useDeleteTransaction();
  const updateMutation = useUpdateTransaction();
  
  const handleCreate = async (formData) => {
    const data = {
      amount: parseFloat(formData.get('amount')),
      type: formData.get('type'),
      category: formData.get('category'),
      notes: formData.get('notes') || undefined,
      tags: (formData.get('tags'))?.split(',').map(t => t.trim()).filter(Boolean) || [],
    };
    
    await createMutation.mutateAsync(data);
    setShowCreateModal(false);
  };
  
  const handleDelete = async (id) => {
    if (confirm('Are you sure you want to delete this transaction?')) {
      await deleteMutation.mutateAsync(id);
    }
  };
  
  const handleEdit = (tx) => {
    setEditingTransaction(tx);
    setShowEditModal(true);
  };
  
  const handleUpdate = async (formData) => {
    const data = {
      amount: parseFloat(formData.get('amount')),
      type: formData.get('type'),
      category: formData.get('category'),
      notes: formData.get('notes') || undefined,
      tags: (formData.get('tags'))?.split(',').map(t => t.trim()).filter(Boolean) || [],
    };
    
    await updateMutation.mutateAsync({ id: editingTransaction.id, data });
    setShowEditModal(false);
    setEditingTransaction(null);
  };
  
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">Transactions</h1>
          <p className="text-[var(--text-secondary)] mt-1 text-sm sm:text-base">
            Manage and view all financial transactions
          </p>
        </div>
        
        {canCreate && (
          <button
            onClick={() => setShowCreateModal(true)}
            className="btn-primary flex items-center gap-2 w-full sm:w-auto justify-center sm:justify-start"
          >
            <Plus className="w-5 h-5" />
            Add Transaction
          </button>
        )}
      </div>
      
      {/* Filters */}
      <div className="glass-card p-4">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--text-muted)]" />
            <input
              type="text"
              placeholder="Search transactions..."
              className="input-field pl-10 w-full"
              value={filters.search || ''}
              onChange={(e) => setFilters({ ...filters, search: e.target.value || undefined })}
            />
          </div>
          
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={cn(
              'btn-secondary flex items-center gap-2 w-full sm:w-auto justify-center',
              showFilters && 'bg-[var(--primary-light)] border-[var(--primary)]'
            )}
          >
            <Filter className="w-5 h-5" />
            Filters
          </button>
        </div>
        
        {/* Filter options */}
        {showFilters && (
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 mt-4 pt-4 border-t border-[var(--border)] animate-fade-in">
            <select
              className="input-field"
              value={filters.type || ''}
              onChange={(e) => setFilters({ ...filters, type: e.target.value || undefined })}
            >
              <option value="">All Types</option>
              {transactionTypes.map((type) => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
            
            <select
              className="input-field"
              value={filters.category || ''}
              onChange={(e) => setFilters({ ...filters, category: e.target.value || undefined })}
            >
              <option value="">All Categories</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
            
            {(filters.type || filters.category || filters.search) && (
              <button
                onClick={() => setFilters({})}
                className="text-sm text-[var(--text-muted)] hover:text-[var(--danger)] py-2 px-3 rounded-lg hover:bg-red-500/10 transition-colors"
              >
                Clear filters
              </button>
            )}
          </div>
        )}
      </div>
      
      {/* Transactions Table */}
      <div className="glass-card overflow-hidden">
        {/* Desktop Table */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[var(--border)]">
                <th className="text-left p-4 text-sm font-medium text-[var(--text-secondary)]">Type</th>
                <th className="text-left p-4 text-sm font-medium text-[var(--text-secondary)]">Category</th>
                <th className="text-left p-4 text-sm font-medium text-[var(--text-secondary)]">Amount</th>
                <th className="text-left p-4 text-sm font-medium text-[var(--text-secondary)]">Date</th>
                <th className="text-left p-4 text-sm font-medium text-[var(--text-secondary)]">Notes</th>
                <th className="text-left p-4 text-sm font-medium text-[var(--text-secondary)]">Status</th>
                {canDelete && (
                  <th className="text-right p-4 text-sm font-medium text-[var(--text-secondary)]">Actions</th>
                )}
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="border-b border-[var(--border)]">
                    <td className="p-4"><div className="skeleton w-20 h-6" /></td>
                    <td className="p-4"><div className="skeleton w-24 h-6" /></td>
                    <td className="p-4"><div className="skeleton w-20 h-6" /></td>
                    <td className="p-4"><div className="skeleton w-24 h-6" /></td>
                    <td className="p-4"><div className="skeleton w-32 h-6" /></td>
                    <td className="p-4"><div className="skeleton w-16 h-6" /></td>
                  </tr>
                ))
              ) : data?.transactions.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-[var(--text-muted)]">
                    No transactions found
                  </td>
                </tr>
              ) : (
                data?.transactions.map((tx, i) => (
                  <tr 
                    key={tx.id} 
                    className="border-b border-[var(--border)] hover:bg-[var(--surface-2)] transition-colors animate-fade-in"
                    style={{ animationDelay: `${i * 0.02}s` }}
                  >
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        {tx.type === 'INCOME' ? (
                          <ArrowUpCircle className="w-5 h-5 text-green-400" />
                        ) : (
                          <ArrowDownCircle className="w-5 h-5 text-red-400" />
                        )}
                        <span className={tx.type === 'INCOME' ? 'text-green-400' : 'text-red-400'}>
                          {tx.type}
                        </span>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className="badge bg-[var(--surface-3)]">{tx.category}</span>
                    </td>
                    <td className="p-4 font-medium">
                      <span className={tx.type === 'INCOME' ? 'text-green-400' : 'text-red-400'}>
                        {tx.type === 'INCOME' ? '+' : '-'}{formatCurrency(tx.amount)}
                      </span>
                    </td>
                    <td className="p-4 text-[var(--text-secondary)]">
                      {formatDate(tx.date)}
                    </td>
                    <td className="p-4 text-[var(--text-secondary)] max-w-[200px] truncate">
                      {tx.notes || '-'}
                    </td>
                    <td className="p-4">
                      {tx.isAnomaly && (
                        <div className="flex items-center gap-1 text-orange-400">
                          <AlertTriangle className="w-4 h-4" />
                          <span className="text-xs">Anomaly</span>
                        </div>
                      )}
                    </td>
                    {canDelete && (
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => handleEdit(tx)}
                            className="p-2 rounded-lg hover:bg-[var(--primary-light)] text-[var(--text-muted)] hover:text-[var(--primary)] transition-colors"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(tx.id)}
                            className="p-2 rounded-lg hover:bg-red-500/20 text-[var(--text-muted)] hover:text-red-400 transition-colors"
                            disabled={deleteMutation.isPending}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
        {/* Mobile Card View */}
        <div className="md:hidden space-y-3 p-4">
          {isLoading ? (
            Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="skeleton h-24 rounded-lg" />
            ))
          ) : data?.transactions.length === 0 ? (
            <div className="p-8 text-center text-[var(--text-muted)]">
              No transactions found
            </div>
          ) : (
            data?.transactions.map((tx, i) => (
              <div 
                key={tx.id} 
                className="bg-[var(--surface-2)] rounded-lg p-4 animate-fade-in"
                style={{ animationDelay: `${i * 0.02}s` }}
              >
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div className="flex items-center gap-2">
                    {tx.type === 'INCOME' ? (
                      <ArrowUpCircle className="w-5 h-5 text-green-400" />
                    ) : (
                      <ArrowDownCircle className="w-5 h-5 text-red-400" />
                    )}
                    <div>
                      <span className={cn('font-medium text-sm', tx.type === 'INCOME' ? 'text-green-400' : 'text-red-400')}>
                        {tx.type === 'INCOME' ? '+' : '-'}{formatCurrency(tx.amount)}
                      </span>
                      <p className="text-xs text-[var(--text-muted)]">{formatDate(tx.date)}</p>
                    </div>
                  </div>
                  {canDelete && (
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleEdit(tx)}
                        className="p-1.5 rounded-lg hover:bg-[var(--primary-light)] text-[var(--text-muted)] hover:text-[var(--primary)]"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(tx.id)}
                        className="p-1.5 rounded-lg hover:bg-red-500/20 text-[var(--text-muted)] hover:text-red-400"
                        disabled={deleteMutation.isPending}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="badge bg-[var(--surface-3)] text-xs">{tx.category}</span>
                  {tx.isAnomaly && (
                    <div className="flex items-center gap-1 text-orange-400">
                      <AlertTriangle className="w-3 h-3" />
                      <span className="text-xs">Anomaly</span>
                    </div>
                  )}
                </div>
                {tx.notes && (
                  <p className="text-xs text-[var(--text-secondary)]">{tx.notes}</p>
                )}
              </div>
            ))
          )}
        </div>
        
        {/* Pagination */}
        {data && data.total > 20 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 border-t border-[var(--border)]">
            <p className="text-sm text-[var(--text-muted)] text-center sm:text-left">
              Showing {(page - 1) * 20 + 1} to {Math.min(page * 20, data.total)} of {data.total}
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="p-2 rounded-lg hover:bg-[var(--surface-2)] disabled:opacity-50"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <span className="px-3 py-1 bg-[var(--surface-2)] rounded-lg text-sm">
                {page}
              </span>
              <button
                onClick={() => setPage(p => p + 1)}
                disabled={page * 20 >= data.total}
                className="p-2 rounded-lg hover:bg-[var(--surface-2)] disabled:opacity-50"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}
      </div>
      
      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 animate-fade-in p-4">
          <div className="glass-card p-6 w-full max-w-md max-h-[90vh] overflow-y-auto rounded-lg shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold">New Transaction</h2>
              <button
                onClick={() => setShowCreateModal(false)}
                className="p-2 rounded-lg hover:bg-[var(--surface-2)]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleCreate(new FormData(e.currentTarget));
              }}
              className="space-y-4"
            >
              <div>
                <label className="block text-sm font-medium mb-2">Type</label>
                <select name="type" className="input-field w-full" required>
                  {transactionTypes.map((type) => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Category</label>
                <select name="category" className="input-field" required>
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Amount</label>
                <input
                  type="number"
                  name="amount"
                  step="0.01"
                  min="0.01"
                  className="input-field w-full"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Notes (optional)</label>
                <textarea
                  name="notes"
                  className="input-field resize-none"
                  rows={3}
                  placeholder="Add a description..."
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Tags (comma-separated)</label>
                <input
                  type="text"
                  name="tags"
                  className="input-field"
                  placeholder="groceries, weekly, essentials"
                />
              </div>
              
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="btn-secondary flex-1"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary flex-1"
                  disabled={createMutation.isPending}
                >
                  {createMutation.isPending ? 'Creating...' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      
      {/* Edit Modal */}
      {showEditModal && editingTransaction && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 animate-fade-in p-4">
          <div className="glass-card p-6 w-full max-w-md max-h-[90vh] overflow-y-auto rounded-lg shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold">Edit Transaction</h2>
              <button
                onClick={() => {
                  setShowEditModal(false);
                  setEditingTransaction(null);
                }}
                className="p-2 rounded-lg hover:bg-[var(--surface-2)]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleUpdate(new FormData(e.currentTarget));
              }}
              className="space-y-4"
            >
              <div>
                <label className="block text-sm font-medium mb-2">Type</label>
                <select name="type" className="input-field" required defaultValue={editingTransaction.type}>
                  {transactionTypes.map((type) => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Category</label>
                <select name="category" className="input-field" required defaultValue={editingTransaction.category}>
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Amount</label>
                <input
                  type="number"
                  name="amount"
                  step="0.01"
                  min="0.01"
                  className="input-field"
                  defaultValue={editingTransaction.amount}
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Notes (optional)</label>
                <textarea
                  name="notes"
                  className="input-field resize-none"
                  rows={3}
                  defaultValue={editingTransaction.notes || ''}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Tags (comma-separated)</label>
                <input
                  type="text"
                  name="tags"
                  className="input-field"
                  defaultValue={editingTransaction.tags?.join(', ') || ''}
                />
              </div>
              
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowEditModal(false);
                    setEditingTransaction(null);
                  }}
                  className="btn-secondary flex-1"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary flex-1"
                  disabled={updateMutation.isPending}
                >
                  {updateMutation.isPending ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
