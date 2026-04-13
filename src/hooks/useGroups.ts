'use client';

import { useState, useEffect, useCallback } from 'react';
import type { Group } from '@/lib/types';
import { useAuth } from './useAuth';

export function useGroups() {
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const { getAccessToken } = useAuth();

  const getHeaders = useCallback(async () => {
    const token = await getAccessToken();
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;
    return headers;
  }, [getAccessToken]);

  const fetchGroups = useCallback(async () => {
    setLoading(true);
    const headers = await getHeaders();
    const res = await fetch('/api/v1/groups', { headers });
    const result = await res.json();
    setGroups(result.data || []);
    setLoading(false);
  }, [getHeaders]);

  useEffect(() => {
    fetchGroups();
  }, [fetchGroups]);

  const createGroup = async (name: string, color?: string) => {
    const headers = await getHeaders();
    const res = await fetch('/api/v1/groups', {
      method: 'POST',
      headers,
      body: JSON.stringify({ name, color }),
    });
    const result = await res.json();
    if (result.data) {
      setGroups(prev => [...prev, { ...result.data, contact_count: 0 }]);
    }
    return result.data;
  };

  const deleteGroup = async (id: string) => {
    const headers = await getHeaders();
    await fetch(`/api/v1/groups/${id}`, { method: 'DELETE', headers });
    setGroups(prev => prev.filter(g => g.id !== id));
  };

  return { groups, loading, fetchGroups, createGroup, deleteGroup };
}
