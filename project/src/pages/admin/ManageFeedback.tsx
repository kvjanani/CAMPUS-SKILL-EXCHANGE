import { useEffect, useState, useCallback, useMemo } from 'react';
import { Search, MessageSquare, Trash2, Star } from 'lucide-react';
import DashboardLayout from '@/components/DashboardLayout';
import LoadingState from '@/components/LoadingState';
import ErrorState from '@/components/ErrorState';
import EmptyState from '@/components/EmptyState';
import ConfirmDialog from '@/components/ConfirmDialog';
import StarRating from '@/components/StarRating';
import { useToast } from '@/context/ToastContext';
import { getAdminFeedback } from '@/services/admin';
import { deleteFeedback } from '@/services/feedback';
import { formatDate } from '@/utils/format';
import type { FeedbackWithProfiles } from '@/types';

export default function ManageFeedback() {
  const { showSuccess, showError } = useToast();
  const [feedback, setFeedback] = useState<FeedbackWithProfiles[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [deleteTarget, setDeleteTarget] = useState<FeedbackWithProfiles | null>(null);

  const loadFeedback = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await getAdminFeedback();
      setFeedback(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to load data. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadFeedback();
  }, [loadFeedback]);

  const filtered = useMemo(() => {
    return feedback.filter((f) => {
      if (!search) return true;
      const s = search.toLowerCase();
      return (
        f.comment.toLowerCase().includes(s) ||
        (f.profiles?.full_name || '').toLowerCase().includes(s) ||
        (f.help_requests?.title || '').toLowerCase().includes(s)
      );
    });
  }, [feedback, search]);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteFeedback(deleteTarget.id);
      setFeedback((prev) => prev.filter((f) => f.id !== deleteTarget.id));
      showSuccess('Feedback deleted successfully.');
    } catch (err) {
      showError(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Manage Feedback</h1>
          <p className="text-sm text-gray-500 mt-1">View and moderate all feedback on the platform.</p>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by comment, reviewer, or request title..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all text-sm"
            />
          </div>
        </div>

        {loading ? (
          <LoadingState />
        ) : error ? (
          <ErrorState message={error} onRetry={loadFeedback} />
        ) : filtered.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100">
            <EmptyState icon={<MessageSquare className="h-12 w-12" />} title="No feedback found" message={search ? "Try adjusting your search." : "No feedback has been submitted yet."} />
          </div>
        ) : (
          <>
            <p className="text-sm text-gray-500">{filtered.length} feedback entr{filtered.length !== 1 ? 'ies' : 'y'} found</p>
            <div className="space-y-3">
              {filtered.map((f) => (
                <div key={f.id} className="bg-white rounded-2xl border border-gray-100 p-5 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <StarRating rating={f.rating} size="sm" />
                        <span className="text-xs text-gray-400">{formatDate(f.created_at)}</span>
                      </div>
                      <p className="text-sm text-gray-700">{f.comment}</p>
                    </div>
                    <button
                      onClick={() => setDeleteTarget(f)}
                      className="p-2 rounded-lg text-gray-500 hover:bg-red-50 hover:text-red-600 transition-colors flex-shrink-0"
                      title="Delete"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                  <div className="flex items-center gap-4 pt-3 border-t border-gray-100 text-xs text-gray-500">
                    <span>By <strong className="text-gray-700">{f.profiles?.full_name}</strong></span>
                    <span>For: <strong className="text-gray-700">{f.help_requests?.title}</strong></span>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Delete Feedback"
        message="Are you sure you want to delete this feedback? This action cannot be undone."
      />
    </DashboardLayout>
  );
}
