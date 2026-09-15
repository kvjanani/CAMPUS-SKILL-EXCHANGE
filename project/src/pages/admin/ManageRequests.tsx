import { useEffect, useState, useCallback, useMemo } from 'react';
import { Search, HandHelping, Trash2, Filter, X } from 'lucide-react';
import DashboardLayout from '@/components/DashboardLayout';
import LoadingState from '@/components/LoadingState';
import ErrorState from '@/components/ErrorState';
import EmptyState from '@/components/EmptyState';
import Badge from '@/components/Badge';
import ConfirmDialog from '@/components/ConfirmDialog';
import { useToast } from '@/context/ToastContext';
import { getAdminRequests } from '@/services/admin';
import { deleteHelpRequest } from '@/services/helpRequests';
import { CATEGORIES, PRIORITY_OPTIONS, STATUS_OPTIONS } from '@/types';
import { formatDate } from '@/utils/format';
import type { HelpRequestWithProfile } from '@/types';

const statusVariant: Record<string, 'success' | 'warning' | 'info' | 'neutral' | 'error'> = {
  Open: 'info',
  'In Progress': 'warning',
  Completed: 'success',
  Cancelled: 'neutral',
};

export default function ManageRequests() {
  const { showSuccess, showError } = useToast();
  const [requests, setRequests] = useState<HelpRequestWithProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [priority, setPriority] = useState('');
  const [status, setStatus] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<HelpRequestWithProfile | null>(null);

  const loadRequests = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await getAdminRequests();
      setRequests(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to load data. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadRequests();
  }, [loadRequests]);

  const filtered = useMemo(() => {
    return requests.filter((r) => {
      if (search && !r.title.toLowerCase().includes(search.toLowerCase()) && !r.skill_needed.toLowerCase().includes(search.toLowerCase())) return false;
      if (category && r.category !== category) return false;
      if (priority && r.priority !== priority) return false;
      if (status && r.status !== status) return false;
      return true;
    });
  }, [requests, search, category, priority, status]);

  const hasFilters = !!(search || category || priority || status);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteHelpRequest(deleteTarget.id);
      setRequests((prev) => prev.filter((r) => r.id !== deleteTarget.id));
      showSuccess('Request deleted successfully.');
    } catch (err) {
      showError(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Manage Help Requests</h1>
          <p className="text-sm text-gray-500 mt-1">View and moderate all help requests.</p>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 p-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by title or skill..."
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
            <div className="mt-4 pt-4 border-t border-gray-100 grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Category</label>
                <select value={category} onChange={(e) => setCategory(e.target.value)} className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm bg-white outline-none focus:border-emerald-500">
                  <option value="">All</option>
                  {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Priority</label>
                <select value={priority} onChange={(e) => setPriority(e.target.value)} className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm bg-white outline-none focus:border-emerald-500">
                  <option value="">All</option>
                  {PRIORITY_OPTIONS.map((p) => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Status</label>
                <select value={status} onChange={(e) => setStatus(e.target.value)} className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm bg-white outline-none focus:border-emerald-500">
                  <option value="">All</option>
                  {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              {hasFilters && (
                <button onClick={() => { setSearch(''); setCategory(''); setPriority(''); setStatus(''); }} className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-red-600 transition-colors sm:col-span-3 justify-self-start">
                  <X className="h-4 w-4" /> Clear all filters
                </button>
              )}
            </div>
          )}
        </div>

        {loading ? (
          <LoadingState />
        ) : error ? (
          <ErrorState message={error} onRetry={loadRequests} />
        ) : filtered.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100">
            <EmptyState icon={<HandHelping className="h-12 w-12" />} title="No requests found" message={hasFilters ? "Try adjusting your filters." : "No help requests have been created yet."} />
          </div>
        ) : (
          <>
            <p className="text-sm text-gray-500">{filtered.length} request{filtered.length !== 1 ? 's' : ''} found</p>
            <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 border-b border-gray-100">
                    <tr>
                      <th className="text-left font-medium text-gray-500 px-4 py-3">Title</th>
                      <th className="text-left font-medium text-gray-500 px-4 py-3 hidden sm:table-cell">Skill</th>
                      <th className="text-left font-medium text-gray-500 px-4 py-3 hidden md:table-cell">Requester</th>
                      <th className="text-left font-medium text-gray-500 px-4 py-3">Priority</th>
                      <th className="text-left font-medium text-gray-500 px-4 py-3">Status</th>
                      <th className="text-left font-medium text-gray-500 px-4 py-3 hidden lg:table-cell">Created</th>
                      <th className="text-right font-medium text-gray-500 px-4 py-3">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {filtered.map((req) => (
                      <tr key={req.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-4 py-3 font-medium text-gray-900">{req.title}</td>
                        <td className="px-4 py-3 text-gray-600 hidden sm:table-cell">{req.skill_needed}</td>
                        <td className="px-4 py-3 text-gray-600 hidden md:table-cell">{req.profiles?.full_name}</td>
                        <td className="px-4 py-3"><Badge variant={req.priority === 'High' ? 'error' : req.priority === 'Medium' ? 'warning' : 'neutral'}>{req.priority}</Badge></td>
                        <td className="px-4 py-3"><Badge variant={statusVariant[req.status]}>{req.status}</Badge></td>
                        <td className="px-4 py-3 text-gray-500 hidden lg:table-cell">{formatDate(req.created_at)}</td>
                        <td className="px-4 py-3 text-right">
                          <button
                            onClick={() => setDeleteTarget(req)}
                            className="p-2 rounded-lg text-gray-500 hover:bg-red-50 hover:text-red-600 transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
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
        title="Delete Request"
        message={`Are you sure you want to delete "${deleteTarget?.title}"? This action cannot be undone.`}
      />
    </DashboardLayout>
  );
}
