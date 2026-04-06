'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getAuthHeaders, useAuthStore } from './store';

const API_BASE = '/api';

// Generic fetch wrapper
async function apiFetch(endpoint, options) {
  const headers = {
    'Content-Type': 'application/json',
    ...getAuthHeaders(),
    ...(options?.headers || {}),
  };
  
  const response = await fetch(API_BASE + endpoint, {
    ...options,
    headers,
  });
  
  const data = await response.json();
  
  if (!data.success) {
    throw new Error(data.error || 'Request failed');
  }
  
  return data.data;
}

// AUTH HOOKS
export function useLogin() {
  const setAuth = useAuthStore((s) => s.setAuth);
  
  return useMutation({
    mutationFn: async (input) => {
      const data = await apiFetch('/auth/login', {
        method: 'POST',
        body: JSON.stringify(input),
      });
      return data;
    },
    onSuccess: (data) => {
      setAuth(data.user, data.token);
    },
  });
}

export function useRegister() {
  const setAuth = useAuthStore((s) => s.setAuth);
  
  return useMutation({
    mutationFn: async (input) => {
      const data = await apiFetch('/auth/register', {
        method: 'POST',
        body: JSON.stringify(input),
      });
      return data;
    },
    onSuccess: (data) => {
      setAuth(data.user, data.token);
    },
  });
}

export function useCurrentUser() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  
  return useQuery({
    queryKey: ['currentUser'],
    queryFn: () => apiFetch('/auth/me'),
    enabled: isAuthenticated,
  });
}

// ANALYTICS HOOKS
export function useSummary(period = 'month') {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  
  return useQuery({
    queryKey: ['summary', period],
    queryFn: () => apiFetch('/analytics/summary?period=' + period),
    enabled: isAuthenticated,
    staleTime: 1000 * 60 * 5,
  });
}

export function useTrends(period = 'month', groupBy = 'day') {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  
  return useQuery({
    queryKey: ['trends', period, groupBy],
    queryFn: () => apiFetch('/analytics/trends?period=' + period + '&groupBy=' + groupBy),
    enabled: isAuthenticated,
    staleTime: 1000 * 60 * 5,
  });
}

export function useHealthScore() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  
  return useQuery({
    queryKey: ['healthScore'],
    queryFn: () => apiFetch('/analytics/health-score'),
    enabled: isAuthenticated,
    staleTime: 1000 * 60 * 30,
  });
}

export function useInsights() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  
  return useQuery({
    queryKey: ['insights'],
    queryFn: () => apiFetch('/analytics/insights'),
    enabled: isAuthenticated,
    staleTime: 1000 * 60 * 15,
  });
}

// TRANSACTION HOOKS
export function useTransactions(filters) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  
  const queryString = filters
    ? '?' + new URLSearchParams(
        Object.entries(filters)
          .filter(([, v]) => v !== undefined)
          .map(([k, v]) => [k, String(v)])
      ).toString()
    : '';
  
  return useQuery({
    queryKey: ['transactions', filters],
    queryFn: () => apiFetch('/transactions' + queryString),
    enabled: isAuthenticated,
  });
}

export function useCreateTransaction() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (input) => {
      return apiFetch('/transactions', {
        method: 'POST',
        body: JSON.stringify(input),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['summary'] });
      queryClient.invalidateQueries({ queryKey: ['trends'] });
      queryClient.invalidateQueries({ queryKey: ['healthScore'] });
      queryClient.invalidateQueries({ queryKey: ['insights'] });
    },
  });
}

export function useDeleteTransaction() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id) => {
      return apiFetch('/transactions/' + id, { method: 'DELETE' });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['summary'] });
    },
  });
}

export function useUpdateTransaction() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, data }) => {
      return apiFetch('/transactions/' + id, {
        method: 'PATCH',
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['summary'] });
      queryClient.invalidateQueries({ queryKey: ['trends'] });
      queryClient.invalidateQueries({ queryKey: ['healthScore'] });
    },
  });
}

// EVENTS HOOKS
export function useEvents(filters) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  
  const queryString = filters
    ? '?' + new URLSearchParams(
        Object.entries(filters)
          .filter(([, v]) => v !== undefined)
          .map(([k, v]) => [k, String(v)])
      ).toString()
    : '';
  
  return useQuery({
    queryKey: ['events', filters],
    queryFn: () => apiFetch('/events' + queryString),
    enabled: isAuthenticated,
  });
}

// USERS HOOKS (Admin)
export function useUsers(page = 1, limit = 20) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const role = useAuthStore((s) => s.user?.role);
  
  return useQuery({
    queryKey: ['users', page, limit],
    queryFn: () => apiFetch('/users?page=' + page + '&limit=' + limit),
    enabled: isAuthenticated && role === 'ADMIN',
  });
}
