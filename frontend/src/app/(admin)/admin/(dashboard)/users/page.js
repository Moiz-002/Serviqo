'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Search,
  Filter,
  MoreVertical,
  UserPlus,
  ArrowUpDown,
  CheckCircle2,
  XCircle,
  AlertCircle
} from 'lucide-react';
import * as api from '@/lib/api';

export default function UserManagementPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [users, setUsers] = useState([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchUsers = useCallback(() => {
    setIsLoading(true);
    const params = new URLSearchParams();
    if (searchTerm) params.set('q', searchTerm);
    if (roleFilter !== 'all') params.set('role', roleFilter);
    if (statusFilter !== 'all') params.set('status', statusFilter);
    params.set('page', String(page));
    params.set('limit', '10');
    api.getAdminUsers(params.toString())
      .then((data) => {
        setUsers(data.users || []);
        setTotal(data.total || (data.users || []).length);
        setTotalPages(data.totalPages || 1);
      })
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, [searchTerm, roleFilter, statusFilter, page]);

  useEffect(() => {
    const t = setTimeout(fetchUsers, 300);
    return () => clearTimeout(t);
  }, [fetchUsers]);

  const handleStatusToggle = async (user) => {
    const newIsActive = user.isActive === false;
    try {
      await api.updateUserStatus(user._id || user.id, { isActive: newIsActive });
      setUsers((prev) => prev.map((u) => (u._id === user._id ? { ...u, isActive: newIsActive } : u)));
    } catch {}
  };

  const filteredUsers = users;

  const getAccountStatus = (user) => {
    if (user.isActive === false) return 'suspended';
    if (user.role === 'worker' && user.cnicRejectionReason) return 'rejected';
    if (user.role === 'worker') return user.cnicVerified ? 'approved' : 'pending';
    return user.isVerified ? 'approved' : 'pending';
  };

  const getStatusStyle = (status) => {
    switch (status) {
      case 'active': return 'bg-cyan-50 text-cyan-700 border-cyan-100';
      case 'suspended': return 'bg-error-light text-error border-error-light';
      case 'pending': return 'bg-warning-light text-warning border-warning-light';
      default: return 'bg-neutral-50 text-neutral-600 border-neutral-100';
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-neutral-900">User Management</h1>
          <p className="text-neutral-500 mt-2">Manage customer and worker accounts across the platform.</p>
        </div>
        <button className="inline-flex items-center gap-2 px-6 py-3 bg-navy-600 text-white font-bold rounded-2xl hover:bg-navy-700 transition-colors shadow-sm">
          <UserPlus className="w-5 h-5" />
          Add New User
        </button>
      </div>

      {/* Filters & Search */}
      <div className="bg-white p-6 rounded-[24px] border border-neutral-200 shadow-sm space-y-4 sm:space-y-0 sm:flex sm:items-center sm:gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
          <input 
            type="text" 
            placeholder="Search by name or email..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 transition-all"
          />
        </div>
        <div className="flex items-center gap-3">
          <select 
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-navy-500/20 focus:border-navy-500 transition-all text-neutral-600 font-medium"
          >
            <option value="all">All Roles</option>
            <option value="customer">Customers</option>
            <option value="worker">Workers</option>
          </select>
          <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }} aria-label="Filter by status" className="px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl text-neutral-600 font-medium">
            <option value="all">All Statuses</option>
            <option value="active">Active</option>
            <option value="approved">Approved</option>
            <option value="pending">Pending</option>
            <option value="rejected">Rejected</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
      </div>

      {/* User Table */}
      <div className="bg-white rounded-[32px] border border-neutral-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-neutral-50/50 text-left text-xs font-bold text-neutral-500 uppercase tracking-wider border-b border-neutral-200">
                <th className="px-6 py-5">User</th>
                <th className="px-6 py-5">Role</th>
                <th className="px-6 py-5">Status</th>
                <th className="px-6 py-5">Joined Date</th>
                <th className="px-6 py-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {isLoading ? (
                <tr><td colSpan={5} className="px-6 py-12 text-center text-neutral-400">Loading users…</td></tr>
              ) : filteredUsers.length === 0 ? (
                <tr><td colSpan={5} className="px-6 py-12 text-center text-neutral-400">No users found.</td></tr>
              ) : filteredUsers.map((user) => (
                <tr key={user._id || user.id} className="group hover:bg-neutral-50/50 transition-colors">
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-neutral-100 flex items-center justify-center font-bold text-neutral-600 border border-neutral-200">
                        {(user.name || '?').charAt(0)}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-neutral-900">{user.name}</p>
                        <p className="text-xs text-neutral-500">{user.email || user.phone}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-5 text-sm">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold capitalize ${
                      user.role === 'worker' ? 'bg-cyan-50 text-cyan-700' : 'bg-navy-50 text-navy-700'
                    }`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="px-6 py-5">
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${getStatusStyle(getAccountStatus(user))}`}>
                      <div className={`w-1.5 h-1.5 rounded-full ${
                        getAccountStatus(user) === 'rejected' || getAccountStatus(user) === 'suspended' ? 'bg-error' : getAccountStatus(user) === 'pending' ? 'bg-warning' : 'bg-cyan-600'
                      }`}></div>
                      {getAccountStatus(user).toUpperCase()}
                    </span>
                  </td>
                  <td className="px-6 py-5 text-sm text-neutral-500">
                    {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : user.joinedAt || '—'}
                  </td>
                  <td className="px-6 py-5 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleStatusToggle(user)}
                        className="p-2 text-neutral-400 hover:text-navy-600 transition-colors"
                        title={user.isActive === false ? 'Activate User' : 'Suspend User'}
                        aria-label={user.isActive === false ? 'Activate User' : 'Suspend User'}
                      >
                        {user.isActive === false ? <CheckCircle2 className="w-5 h-5" /> : <XCircle className="w-5 h-5" />}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {/* Pagination placeholder */}
        <div className="px-6 py-4 bg-neutral-50/50 border-t border-neutral-200 flex items-center justify-between">
          <p className="text-sm text-neutral-500">Showing {filteredUsers.length} of {total} users</p>
          <div className="flex gap-2">
            <button onClick={() => setPage((current) => Math.max(1, current - 1))} disabled={page === 1 || isLoading} className="px-4 py-2 bg-white border border-neutral-200 rounded-xl text-sm font-semibold text-neutral-600 hover:bg-neutral-50 disabled:opacity-50">Previous</button>
            <span className="px-3 py-2 text-sm font-semibold text-neutral-500">Page {page} of {totalPages}</span>
            <button onClick={() => setPage((current) => Math.min(totalPages, current + 1))} disabled={page >= totalPages || isLoading} className="px-4 py-2 bg-white border border-neutral-200 rounded-xl text-sm font-semibold text-neutral-600 hover:bg-neutral-50 disabled:opacity-50">Next</button>
          </div>
        </div>
      </div>
    </div>
  );
}
