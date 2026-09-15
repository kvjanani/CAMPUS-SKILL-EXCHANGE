import { useEffect, useState, useCallback, useMemo } from 'react';
import { Search, User, UserCheck, UserX, Trash2, Filter, X } from 'lucide-react';
import DashboardLayout from '@/components/DashboardLayout';
import LoadingState from '@/components/LoadingState';
import ErrorState from '@/components/ErrorState';
import EmptyState from '@/components/EmptyState';
import Badge from '@/components/Badge';
import ConfirmDialog from '@/components/ConfirmDialog';
import { useToast } from '@/context/ToastContext';
import { toggleUserActive } from '@/services/profiles';
import { getAdminProfiles } from '@/services/admin';
import { supabase } from '@/services/supabaseClient';
import { formatDate } from '@/utils/format';
import type { Profile } from '@/types';

export default function ManageUsers() {
  const { showSuccess, showError } = useToast();
  const [users, setUsers] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Profile | null>(null);

  const loadUsers = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await getAdminProfiles();
      setUsers(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to load data. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  const filtered = useMemo(() => {
    return users.filter((u) => {
      if (search && !u.full_name.toLowerCase().includes(search.toLowerCase()) && !u.email.toLowerCase().includes(search.toLowerCase())) return false;
      if (roleFilter && u.role !== roleFilter) return false;
      if (statusFilter === 'active' && !u.is_active) return false;
      if (statusFilter === 'inactive' && u.is_active) return false;
      return true;
    });
  }, [users, search, roleFilter, statusFilter]);

  const hasFilters = !!(search || roleFilter || statusFilter);

  const handleToggleActive = async (user: Profile) => {
    try {
      await toggleUserActive(user.id, !user.is_active);
      setUsers((prev) => prev.map((u) => (u.id === user.id ? { ...u, is_active: !u.is_active } : u)));
      showSuccess(`User ${user.is_active ? 'deactivated' : 'activated'} successfully.`);
    } catch (err) {
      showError(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      const { error: deleteError } = await supabase.auth.admin.deleteUser(deleteTarget.id);
      if (deleteError) throw deleteError;
      setUsers((prev) => prev.filter((u) => u.id !== deleteTarget.id));
      showSuccess('User deleted successfully.');
    } catch (err) {
      showError(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Manage Users</h1>
          <p className="text-sm text-gray-500 mt-1">View and manage all platform users.</p>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 p-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by name or email..."
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all text-sm"
              />
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                showFilters || hasFilters ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-gray-50 text-gray-700 border border-gray-200 hover:bg-gray-100'
              }`}
            >
              <Filter className="h-4 w-4" /> Filters
              {hasFilters && <span className="px-1.5 py-0.5 rounded-full text-xs bg-emerald-600 text-white">!</span>}
            </button>
          </div>
          {showFilters && (
            <div className="mt-4 pt-4 border-t border-gray-100 grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Role</label>
                <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)} className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm bg-white outline-none focus:border-emerald-500">
                  <option value="">All</option>
                  <option value="student">Student</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Status</label>
                <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm bg-white outline-none focus:border-emerald-500">
                  <option value="">All</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
              {hasFilters && (
                <button onClick={() => { setSearch(''); setRoleFilter(''); setStatusFilter(''); }} className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-red-600 transition-colors sm:col-span-2 justify-self-start">
                  <X className="h-4 w-4" /> Clear all filters
                </button>
              )}
            </div>
          )}
        </div>

        {loading ? (
          <LoadingState />
        ) : error ? (
          <ErrorState message={error} onRetry={loadUsers} />
        ) : filtered.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100">
            <EmptyState icon={<User className="h-12 w-12" />} title="No users found" message={hasFilters ? "Try adjusting your filters." : "No users have registered yet."} />
          </div>
        ) : (
          <>
            <p className="text-sm text-gray-500">{filtered.length} user{filtered.length !== 1 ? 's' : ''} found</p>
            <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 border-b border-gray-100">
                    <tr>
                      <th className="text-left font-medium text-gray-500 px-4 py-3">Name</th>
                      <th className="text-left font-medium text-gray-500 px-4 py-3 hidden sm:table-cell">Email</th>
                      <th className="text-left font-medium text-gray-500 px-4 py-3 hidden md:table-cell">Department</th>
                      <th className="text-left font-medium text-gray-500 px-4 py-3">Role</th>
                      <th className="text-left font-medium text-gray-500 px-4 py-3">Status</th>
                      <th className="text-left font-medium text-gray-500 px-4 py-3 hidden lg:table-cell">Joined</th>
                      <th className="text-right font-medium text-gray-500 px-4 py-3">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {filtered.map((user) => (
                      <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <div className="h-8 w-8 rounded-full bg-emerald-100 flex items-center justify-center text-xs font-bold text-emerald-700">
                              {user.full_name.charAt(0).toUpperCase()}
                            </div>
                            <span className="font-medium text-gray-900">{user.full_name}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-gray-600 hidden sm:table-cell">{user.email}</td>
                        <td className="px-4 py-3 text-gray-600 hidden md:table-cell">{user.department}</td>
                        <td className="px-4 py-3"><Badge variant={user.role === 'admin' ? 'primary' : 'neutral'}>{user.role}</Badge></td>
                        <td className="px-4 py-3"><Badge variant={user.is_active ? 'success' : 'error'}>{user.is_active ? 'Active' : 'Inactive'}</Badge></td>
                        <td className="px-4 py-3 text-gray-500 hidden lg:table-cell">{formatDate(user.created_at)}</td>
                        <td className="px-4 py-3">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => handleToggleActive(user)}
                              className={`p-2 rounded-lg transition-colors ${user.is_active ? 'text-gray-500 hover:bg-amber-50 hover:text-amber-600' : 'text-gray-500 hover:bg-emerald-50 hover:text-emerald-600'}`}
                              title={user.is_active ? 'Deactivate' : 'Activate'}
                            >
                              {user.is_active ? <UserX className="h-4 w-4" /> : <UserCheck className="h-4 w-4" />}
                            </button>
                            <button
                              onClick={() => setDeleteTarget(user)}
                              className="p-2 rounded-lg text-gray-500 hover:bg-red-50 hover:text-red-600 transition-colors"
                              title="Delete"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div>

      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Delete User"
        message={`Are you sure you want to delete "${deleteTarget?.full_name}"? This will permanently remove the user and all their data.`}
      />
    </DashboardLayout>
  );
}
