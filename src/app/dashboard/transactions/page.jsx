'use client';

import { useTransactions, useCreateTransaction, useDeleteTransaction } from '@/lib/api';
import { useAuthStore } from '@/lib/store';
import { formatCurrency, formatDate, cn } from '@/lib/utils';
import { TransactionType, Category } from '@/lib/constants';
import { useState } from 'react';
import {
  Plus,
  Search,
  Filter,
  Trash2,
  AlertTriangle,
  ArrowUpCircle,
  ArrowDownCircle,
  ChevronLeft,
  ChevronRight,
  X,
  Download,
  FileText,
  FileSpreadsheet,
} from 'lucide-react';

const categories = Object.values(Category);
const transactionTypes = Object.values(TransactionType);

export default function TransactionsPage() {
  const { getEffectiveRole } = useAuthStore();
  const effectiveRole = getEffectiveRole();
  const canModify = effectiveRole === 'ADMIN';
  
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState({});
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [createError, setCreateError] = useState('');
  
  const { data, isLoading, refetch } = useTransactions({ ...filters, page, limit: 20 });
  const createMutation = useCreateTransaction();
  const deleteMutation = useDeleteTransaction();
  
  const handleCreate = async (formData) => {
    setCreateError('');
    try {
      const transactionData = {
        amount: parseFloat(formData.get('amount')),
        type: formData.get('type'),
        category: formData.get('category'),
        notes: formData.get('notes') || undefined,
        tags: (formData.get('tags'))?.split(',').map(t => t.trim()).filter(Boolean) || [],
      };
      
      console.log('Creating transaction:', transactionData);
      await createMutation.mutateAsync(transactionData);
      setShowCreateModal(false);
      refetch();
    } catch (error) {
      console.error('Create transaction error:', error);
      setCreateError(error.message || 'Failed to create transaction');
    }
  };
  
  const handleDelete = async (id) => {
    if (confirm('Are you sure you want to delete this transaction?')) {
      await deleteMutation.mutateAsync(id);
    }
  };
  
  // Export to CSV
  const exportToCSV = () => {
    if (!data?.transactions?.length) return;
    
    const headers = ['Date', 'Type', 'Category', 'Amount', 'Notes', 'Tags', 'Status'];
    const rows = data.transactions.map(tx => [
      formatDate(tx.date),
      tx.type,
      tx.category,
      tx.amount,
      tx.notes || '',
      tx.tags?.join('; ') || '',
      tx.isAnomaly ? 'Anomaly' : 'Normal'
    ]);
    
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `transactions_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    setShowExportMenu(false);
  };
  
  // Export to JSON
  const exportToJSON = () => {
    if (!data?.transactions?.length) return;
    
    const exportData = {
      exportDate: new Date().toISOString(),
      totalTransactions: data.transactions.length,
      summary: {
        totalIncome: data.transactions.filter(t => t.type === 'INCOME').reduce((sum, t) => sum + t.amount, 0),
        totalExpenses: data.transactions.filter(t => t.type === 'EXPENSE').reduce((sum, t) => sum + t.amount, 0),
      },
      transactions: data.transactions.map(tx => ({
        date: tx.date,
        type: tx.type,
        category: tx.category,
        amount: tx.amount,
        notes: tx.notes,
        tags: tx.tags,
        isAnomaly: tx.isAnomaly,
      }))
    };
    
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `transactions_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
    setShowExportMenu(false);
  };
  
  // Print/PDF Report
  const printReport = () => {
    if (!data?.transactions?.length) return;
    
    const totalIncome = data.transactions.filter(t => t.type === 'INCOME').reduce((sum, t) => sum + t.amount, 0);
    const totalExpenses = data.transactions.filter(t => t.type === 'EXPENSE').reduce((sum, t) => sum + t.amount, 0);
    
    const printContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Transaction Report - IFCS</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 40px; color: #333; }
          .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #4F46E5; padding-bottom: 20px; }
          .header h1 { color: #4F46E5; margin: 0; }
          .header p { color: #666; margin: 5px 0 0; }
          .summary { display: flex; gap: 20px; margin-bottom: 30px; }
          .summary-card { flex: 1; padding: 20px; border-radius: 10px; text-align: center; }
          .income { background: #dcfce7; color: #166534; }
          .expense { background: #fee2e2; color: #991b1b; }
          .balance { background: #e0e7ff; color: #3730a3; }
          .summary-card h3 { margin: 0 0 10px; font-size: 14px; }
          .summary-card p { margin: 0; font-size: 24px; font-weight: bold; }
          table { width: 100%; border-collapse: collapse; margin-top: 20px; }
          th, td { padding: 12px; text-align: left; border-bottom: 1px solid #eee; }
          th { background: #f8fafc; font-weight: 600; }
          .income-row { color: #166534; }
          .expense-row { color: #991b1b; }
          .footer { margin-top: 30px; text-align: center; color: #666; font-size: 12px; }
          @media print { body { padding: 20px; } }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>IFCS - Transaction Report</h1>
          <p>Generated on ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}</p>
        </div>
        
        <div class="summary">
          <div class="summary-card income">
            <h3>Total Income</h3>
            <p>$${totalIncome.toFixed(2)}</p>
          </div>
          <div class="summary-card expense">
            <h3>Total Expenses</h3>
            <p>$${totalExpenses.toFixed(2)}</p>
          </div>
          <div class="summary-card balance">
            <h3>Net Balance</h3>
            <p>$${(totalIncome - totalExpenses).toFixed(2)}</p>
          </div>
        </div>
        
        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>Type</th>
              <th>Category</th>
              <th>Amount</th>
              <th>Notes</th>
            </tr>
          </thead>
          <tbody>
            ${data.transactions.map(tx => `
              <tr class="${tx.type === 'INCOME' ? 'income-row' : 'expense-row'}">
                <td>${formatDate(tx.date)}</td>
                <td>${tx.type}</td>
                <td>${tx.category}</td>
                <td>${tx.type === 'INCOME' ? '+' : '-'}$${tx.amount.toFixed(2)}</td>
                <td>${tx.notes || '-'}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
        
        <div class="footer">
          <p>IFCS - Intelligent Finance Control System | Confidential Report</p>
        </div>
      </body>
      </html>
    `;
    
    const printWindow = window.open('', '_blank');
    printWindow.document.write(printContent);
    printWindow.document.close();
    printWindow.print();
    setShowExportMenu(false);
  };
  
  return (
    <div className="space-y-6 page-transition">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Transactions</h1>
          <p className="text-[var(--text-secondary)] mt-1">
            Manage and view all financial transactions
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          {/* Export Button */}
          <div className="relative">
            <button
              onClick={() => setShowExportMenu(!showExportMenu)}
              className="btn-secondary flex items-center gap-2"
              disabled={!data?.transactions?.length}
            >
              <Download className="w-5 h-5" />
              Export
            </button>
            
            {showExportMenu && (
              <div className="absolute right-0 top-full mt-2 w-48 glass-card p-2 z-50 animate-fade-in shadow-xl">
                <button
                  onClick={exportToCSV}
                  className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-[var(--surface-2)] transition-colors text-left"
                >
                  <FileSpreadsheet className="w-5 h-5 text-green-500" />
                  <div>
                    <p className="font-medium text-sm">Export CSV</p>
                    <p className="text-xs text-[var(--text-muted)]">Spreadsheet format</p>
                  </div>
                </button>
                <button
                  onClick={exportToJSON}
                  className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-[var(--surface-2)] transition-colors text-left"
                >
                  <FileText className="w-5 h-5 text-blue-500" />
                  <div>
                    <p className="font-medium text-sm">Export JSON</p>
                    <p className="text-xs text-[var(--text-muted)]">Data format</p>
                  </div>
                </button>
                <button
                  onClick={printReport}
                  className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-[var(--surface-2)] transition-colors text-left"
                >
                  <Download className="w-5 h-5 text-purple-500" />
                  <div>
                    <p className="font-medium text-sm">Print / PDF</p>
                    <p className="text-xs text-[var(--text-muted)]">Printable report</p>
                  </div>
                </button>
              </div>
            )}
          </div>
          
          {canModify && (
            <button
              onClick={() => setShowCreateModal(true)}
              className="btn-primary flex items-center gap-2 btn-3d"
            >
              <Plus className="w-5 h-5" />
              Add Transaction
            </button>
          )}
        </div>
      </div>
      
      {/* Filters */}
      <div className="glass-card p-4">
        <div className="flex items-center gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--text-muted)]" />
            <input
              type="text"
              placeholder="Search transactions..."
              className="input-field pl-10"
              value={filters.search || ''}
              onChange={(e) => setFilters({ ...filters, search: e.target.value || undefined })}
            />
          </div>
          
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={cn(
              'btn-secondary flex items-center gap-2',
              showFilters && 'bg-[var(--primary-light)] border-[var(--primary)]'
            )}
          >
            <Filter className="w-5 h-5" />
            Filters
          </button>
        </div>
        
        {/* Filter options */}
        {showFilters && (
          <div className="flex items-center gap-4 mt-4 pt-4 border-t border-[var(--border)] animate-fade-in">
            <select
              className="input-field w-auto"
              value={filters.type || ''}
              onChange={(e) => setFilters({ ...filters, type: e.target.value || undefined })}
            >
              <option value="">All Types</option>
              {transactionTypes.map((type) => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
            
            <select
              className="input-field w-auto"
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
                className="text-sm text-[var(--text-muted)] hover:text-[var(--danger)]"
              >
                Clear filters
              </button>
            )}
          </div>
        )}
      </div>
      
      {/* Transactions Table */}
      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[var(--border)]">
                <th className="text-left p-4 text-sm font-medium text-[var(--text-secondary)]">Type</th>
                <th className="text-left p-4 text-sm font-medium text-[var(--text-secondary)]">Category</th>
                <th className="text-left p-4 text-sm font-medium text-[var(--text-secondary)]">Amount</th>
                <th className="text-left p-4 text-sm font-medium text-[var(--text-secondary)]">Date</th>
                <th className="text-left p-4 text-sm font-medium text-[var(--text-secondary)]">Notes</th>
                <th className="text-left p-4 text-sm font-medium text-[var(--text-secondary)]">Status</th>
                {canModify && (
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
                    {canModify && (
                      <td className="p-4 text-right">
                        <button
                          onClick={() => handleDelete(tx.id)}
                          className="p-2 rounded-lg hover:bg-red-500/20 text-[var(--text-muted)] hover:text-red-400 transition-colors"
                          disabled={deleteMutation.isPending}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination */}
        {data && data.total > 20 && (
          <div className="flex items-center justify-between p-4 border-t border-[var(--border)]">
            <p className="text-sm text-[var(--text-muted)]">
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
  <div className="fixed inset-0 bg-black/50 flex items-start justify-center z-[9999]">
  
  <div className="glass-card max-h-[90vh] w-120 p-20  overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold">New Transaction</h2>
              <button
                onClick={() => {
                  setShowCreateModal(false);
                  setCreateError('');
                }}
                className="p-2 rounded-lg hover:bg-[var(--surface-2)]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            {createError && (
              <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-500 text-sm">
                {createError}
              </div>
            )}
            
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleCreate(new FormData(e.currentTarget));
              }}
              className="space-y-4"
            >
              <div>
                <label className="block text-sm font-medium mb-2">Type</label>
                <select name="type" className="input-field" required>
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
                  className="input-field"
                  placeholder="0.00"
                  required
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
                  onClick={() => {
                    setShowCreateModal(false);
                    setCreateError('');
                  }}
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
    </div>
  );
}
