import { useEffect, useState, useCallback, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { HandHelping, Search, Filter, X, Plus, Clock, Wifi } from 'lucide-react';
import DashboardLayout from '@/components/DashboardLayout';
import LoadingState from '@/components/LoadingState';
import ErrorState from '@/components/ErrorState';
import EmptyState from '@/components/EmptyState';
import Badge from '@/components/Badge';
import { getAllHelpRequests, offerHelp } from '@/services/helpRequests';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { CATEGORIES, PRIORITY_OPTIONS, STATUS_OPTIONS } from '@/types';
import { formatDate } from '@/utils/format';
import type { HelpRequestWithProfile } from '@/types';

const statusVariant: Record<string, 'success' | 'warning' | 'info' | 'neutral' | 'error'> = {
  Open: 'info',
  'In Progress': 'warning',
  Completed: 'success',
  Cancelled: 'neutral',
};

export default function HelpRequests() {
  const { profile } = useAuth();
  const { showSuccess, showError } = useToast();
  const [requests, setRequests] = useState<HelpRequestWithProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [priority, setPriority] = useState('');
  const [status, setStatus] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [showFilters, setShowFilters] = useState(false);

  const loadRequests = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await getAllHelpRequests();
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
    let result = requests.filter((r) => {
      if (search && !r.title.toLowerCase().includes(search.toLowerCase()) && !r.skill_needed.toLowerCase().includes(search.toLowerCase())) return false;
      if (category && r.category !== category) return false;
      if (priority && r.priority !== priority) return false;
      if (status && r.status !== status) return false;
      return true;
    });
    if (sortBy === 'newest') result = [...result].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    if (sortBy === 'oldest') result = [...result].sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
    if (sortBy === 'priority') {
      const order = { High: 0, Medium: 1, Low: 2 };
      result = [...result].sort((a, b) => order[a.priority] - order[b.priority]);
    }
    return result;
  }, [requests, search, category, priority, status, sortBy]);

  const hasFilters = !!(search || category || priority || status);
  const clearFilters = () => { setSearch(''); setCategory(''); setPriority(''); setStatus(''); };

  const handleOfferHelp = async (requestId: string) => {
    try {
      const result = await offerHelp(requestId);
      if (result.success) {
        showSuccess(result.message || 'Help offered successfully.');
        loadRequests();
      } else {
        showError(result.error || 'Unable to offer help.');
      }
    } catch (err) {
      showError(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Help Requests</h1>
            <p className="text-sm text-gray-500 mt-1">Browse help requests from other students.</p>
          </div>
          <Link
            to="/help-requests/new"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-white bg-emerald-600 hover:bg-emerald-700 text-sm font-semibold transition-colors"
          >
            <Plus className="h-4 w-4" /> Request Help
          </Link>
        </div>

        {/* Search + Filter */}
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
            <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="px-4 py-2.5 rounded-xl border border-gray-200 text-sm bg-white outline-none focus:border-emerald-500">
              <option value="newest">Newest first</option>
              <option value="oldest">Oldest first</option>
              <option value="priority">By priority</option>
            </select>
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
                <button onClick={clearFilters} className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-red-600 transition-colors sm:col-span-3 justify-self-start">
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
            <EmptyState
              icon={<HandHelping className="h-12 w-12" />}
              title="No help requests found"
              message={hasFilters ? "Try adjusting your filters." : "No one has created a help request yet."}
            />
          </div>
        ) : (
          <>
            <p className="text-sm text-gray-500">{filtered.length} request{filtered.length !== 1 ? 's' : ''} found</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filtered.map((req) => (
                <div key={req.id} className="bg-white rounded-2xl border border-gray-100 p-5 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between mb-3">
                    <Link to={`/requests/${req.id}`} className="flex-1">
                      <h3 className="font-bold text-gray-900 hover:text-emerald-600 transition-colors">{req.title}</h3>
                      <p className="text-xs text-gray-500">{req.skill_needed} · {req.category}</p>
                    </Link>
                    <Badge variant={statusVariant[req.status]}>{req.status}</Badge>
                  </div>
                  {req.description && <p className="text-sm text-gray-600 mb-3 line-clamp-2">{req.description}</p>}
                  <div className="flex items-center gap-3 text-xs text-gray-500 mb-3">
                    <Badge variant={req.priority === 'High' ? 'error' : req.priority === 'Medium' ? 'warning' : 'neutral'}>
                      {req.priority}
                    </Badge>
                    <span className="flex items-center gap-1"><Wifi className="h-3.5 w-3.5" /> {req.preferred_mode}</span>
                    {req.deadline && <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" /> {formatDate(req.deadline)}</span>}
                  </div>
                  <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                    <div className="flex items-center gap-2">
                      <div className="h-7 w-7 rounded-full bg-sky-100 flex items-center justify-center text-xs font-bold text-sky-700">
                        {req.profiles?.full_name?.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="text-xs font-medium text-gray-900">{req.profiles?.full_name}</p>
                        <p className="text-xs text-gray-400">{formatDate(req.created_at)}</p>
                      </div>
                    </div>
                    {req.status === 'Open' && req.user_id !== profile?.id && (
                      <button
                        onClick={() => handleOfferHelp(req.id)}
                        className="px-3 py-1.5 rounded-lg text-xs font-medium text-white bg-emerald-600 hover:bg-emerald-700 transition-colors"
                      >
                        Offer Help
                      </button>
                    )}
                    {req.user_id === profile?.id && (
                      <Link to={`/requests/${req.id}`} className="text-xs font-medium text-emerald-600 hover:text-emerald-700">
                        View →
                      </Link>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
