import { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { ClipboardList, Plus, Pencil, Trash2, Eye, Clock, Wifi } from 'lucide-react';
import DashboardLayout from '@/components/DashboardLayout';
import LoadingState from '@/components/LoadingState';
import ErrorState from '@/components/ErrorState';
import EmptyState from '@/components/EmptyState';
import Badge from '@/components/Badge';
import ConfirmDialog from '@/components/ConfirmDialog';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { getMyHelpRequests, deleteHelpRequest, updateRequestStatus } from '@/services/helpRequests';
import { formatDate } from '@/utils/format';
import type { HelpRequestWithProfile, RequestStatus } from '@/types';

const statusVariant: Record<string, 'success' | 'warning' | 'info' | 'neutral' | 'error'> = {
  Open: 'info',
  'In Progress': 'warning',
  Completed: 'success',
  Cancelled: 'neutral',
};

export default function MyRequests() {
  const { profile } = useAuth();
  const { showSuccess, showError } = useToast();
  const [requests, setRequests] = useState<HelpRequestWithProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleteTarget, setDeleteTarget] = useState<HelpRequestWithProfile | null>(null);
  const [statusTarget, setStatusTarget] = useState<HelpRequestWithProfile | null>(null);

  const loadRequests = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await getMyHelpRequests();
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

  const myRequests = requests.filter((r) => r.user_id === profile?.id);

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

  const handleStatusChange = async (status: RequestStatus) => {
    if (!statusTarget) return;
    try {
      await updateRequestStatus(statusTarget.id, status);
      setRequests((prev) => prev.map((r) => (r.id === statusTarget.id ? { ...r, status } : r)));
      showSuccess('Status updated successfully.');
    } catch (err) {
      showError(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">My Requests</h1>
            <p className="text-sm text-gray-500 mt-1">Manage your help requests.</p>
          </div>
          <Link
            to="/help-requests/new"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-white bg-emerald-600 hover:bg-emerald-700 text-sm font-semibold transition-colors"
          >
            <Plus className="h-4 w-4" /> Request Help
          </Link>
        </div>

        {loading ? (
          <LoadingState />
        ) : error ? (
          <ErrorState message={error} onRetry={loadRequests} />
        ) : myRequests.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100">
            <EmptyState
              icon={<ClipboardList className="h-12 w-12" />}
              title="No requests yet"
              message="Create a help request when you need assistance."
              action={
                <Link to="/help-requests/new" className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 transition-colors">
                  <Plus className="h-4 w-4" /> Request Help
                </Link>
              }
            />
          </div>
        ) : (
          <div className="space-y-3">
            {myRequests.map((req) => (
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
                  <span>{formatDate(req.created_at)}</span>
                </div>
                <div className="flex items-center gap-2 pt-3 border-t border-gray-100">
                  <Link to={`/requests/${req.id}`} className="p-2 rounded-lg text-gray-500 hover:bg-emerald-50 hover:text-emerald-600 transition-colors" title="View">
                    <Eye className="h-4 w-4" />
                  </Link>
                  <Link to={`/requests/${req.id}/edit`} className="p-2 rounded-lg text-gray-500 hover:bg-sky-50 hover:text-sky-600 transition-colors" title="Edit">
                    <Pencil className="h-4 w-4" />
                  </Link>
                  <button
                    onClick={() => setStatusTarget(req)}
                    className="px-3 py-1.5 rounded-lg text-xs font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 transition-colors"
                  >
                    Update Status
                  </button>
                  <button
                    onClick={() => setDeleteTarget(req)}
                    className="p-2 rounded-lg text-gray-500 hover:bg-red-50 hover:text-red-600 transition-colors ml-auto"
                    title="Delete"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Delete Request"
        message={`Are you sure you want to delete "${deleteTarget?.title}"? This action cannot be undone.`}
      />

      {statusTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={() => setStatusTarget(null)}>
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md p-6" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-lg font-bold text-gray-900 mb-4">Update Status</h2>
            <p className="text-sm text-gray-500 mb-4">Select a new status for "{statusTarget.title}".</p>
            <div className="space-y-2">
              {(['Open', 'In Progress', 'Completed', 'Cancelled'] as RequestStatus[]).map((s) => (
                <button
                  key={s}
                  onClick={() => {
                    handleStatusChange(s);
                    setStatusTarget(null);
                  }}
                  className={`w-full text-left px-4 py-2.5 rounded-xl border transition-colors ${
                    statusTarget.status === s
                      ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                      : 'border-gray-200 hover:border-emerald-300 hover:bg-gray-50'
                  }`}
                >
                  <span className="text-sm font-medium">{s}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
