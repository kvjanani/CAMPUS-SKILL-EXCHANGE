import { useEffect, useState, useCallback } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Clock, Wifi, User, FileText, HandHelping, Star, MessageSquare } from 'lucide-react';
import DashboardLayout from '@/components/DashboardLayout';
import LoadingState from '@/components/LoadingState';
import ErrorState from '@/components/ErrorState';
import Badge from '@/components/Badge';
import StarRating from '@/components/StarRating';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { getHelpRequestById, updateRequestStatus } from '@/services/helpRequests';
import { getFeedbackForRequest, createFeedback, type FeedbackInput } from '@/services/feedback';
import { formatDate } from '@/utils/format';
import type { HelpRequestWithProfile, Feedback, RequestStatus } from '@/types';

const statusVariant: Record<string, 'success' | 'warning' | 'info' | 'neutral' | 'error'> = {
  Open: 'info',
  'In Progress': 'warning',
  Completed: 'success',
  Cancelled: 'neutral',
};

export default function HelpRequestDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { profile } = useAuth();
  const { showSuccess, showError } = useToast();
  const [request, setRequest] = useState<HelpRequestWithProfile | null>(null);
  const [existingFeedback, setExistingFeedback] = useState<Feedback | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showFeedbackForm, setShowFeedbackForm] = useState(false);
  const [feedbackRating, setFeedbackRating] = useState(5);
  const [feedbackComment, setFeedbackComment] = useState('');
  const [submittingFeedback, setSubmittingFeedback] = useState(false);

  const loadData = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    setError('');
    try {
      const [reqData, feedbackData] = await Promise.all([
        getHelpRequestById(id),
        getFeedbackForRequest(id),
      ]);
      setRequest(reqData);
      setExistingFeedback(feedbackData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to load data. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const isOwner = request?.user_id === profile?.id;
  const isProvider = request?.provider_id === profile?.id;
  const canSubmitFeedback = isOwner && request?.status === 'Completed' && !existingFeedback;

  const handleStatusChange = async (status: RequestStatus) => {
    if (!request) return;
    try {
      await updateRequestStatus(request.id, status);
      setRequest({ ...request, status });
      showSuccess('Status updated successfully.');
    } catch (err) {
      showError(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
    }
  };

  const handleSubmitFeedback = async () => {
    if (!request || !request.provider_id) return;
    if (feedbackComment.trim().length < 10) {
      showError('Comment must be at least 10 characters long.');
      return;
    }
    setSubmittingFeedback(true);
    try {
      const input: FeedbackInput = {
        request_id: request.id,
        provider_id: request.provider_id,
        rating: feedbackRating,
        comment: feedbackComment.trim(),
      };
      const result = await createFeedback(input);
      setExistingFeedback(result);
      setShowFeedbackForm(false);
      showSuccess('Feedback submitted successfully.');
    } catch (err) {
      showError(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
    } finally {
      setSubmittingFeedback(false);
    }
  };

  if (loading) return <DashboardLayout><LoadingState /></DashboardLayout>;
  if (error) return <DashboardLayout><ErrorState message={error} onRetry={loadData} /></DashboardLayout>;
  if (!request) return <DashboardLayout><ErrorState message="Request not found." /></DashboardLayout>;

  return (
    <DashboardLayout>
      <div className="max-w-3xl mx-auto space-y-6">
        <Link to={isOwner ? '/my-requests' : '/help-requests'} className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-emerald-600 transition-colors">
          <ArrowLeft className="h-4 w-4" /> Back
        </Link>

        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{request.title}</h1>
              <p className="text-sm text-gray-500 mt-1">{request.skill_needed} · {request.category}</p>
            </div>
            <Badge variant={statusVariant[request.status]}>{request.status}</Badge>
          </div>

          {request.description && (
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-1.5">
                <FileText className="h-4 w-4 text-gray-400" />
                <span className="text-sm font-medium text-gray-500">Description</span>
              </div>
              <p className="text-sm text-gray-700 leading-relaxed">{request.description}</p>
            </div>
          )}

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-6">
            <div className="p-3 rounded-xl bg-gray-50">
              <p className="text-xs text-gray-500 mb-1">Priority</p>
              <Badge variant={request.priority === 'High' ? 'error' : request.priority === 'Medium' ? 'warning' : 'neutral'}>
                {request.priority}
              </Badge>
            </div>
            <div className="p-3 rounded-xl bg-gray-50">
              <p className="text-xs text-gray-500 mb-1">Preferred Mode</p>
              <p className="text-sm font-medium text-gray-900 flex items-center gap-1"><Wifi className="h-3.5 w-3.5" /> {request.preferred_mode}</p>
            </div>
            <div className="p-3 rounded-xl bg-gray-50">
              <p className="text-xs text-gray-500 mb-1">Deadline</p>
              <p className="text-sm font-medium text-gray-900 flex items-center gap-1"><Clock className="h-3.5 w-3.5" /> {formatDate(request.deadline)}</p>
            </div>
          </div>

          {/* Requester info */}
          <div className="pt-6 border-t border-gray-100 mb-6">
            <div className="flex items-center gap-2 mb-3">
              <User className="h-4 w-4 text-gray-400" />
              <span className="text-sm font-medium text-gray-500">Requester</span>
            </div>
            <div className="flex items-center gap-4 p-4 rounded-xl bg-sky-50">
              <div className="h-12 w-12 rounded-full bg-sky-200 flex items-center justify-center text-lg font-bold text-sky-700">
                {request.profiles?.full_name?.charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="font-bold text-gray-900">{request.profiles?.full_name}</p>
                <p className="text-sm text-gray-500">{request.profiles?.department} · {request.profiles?.year}</p>
              </div>
            </div>
          </div>

          {/* Provider info */}
          {request.provider_id && request.provider && (
            <div className="pt-6 border-t border-gray-100 mb-6">
              <div className="flex items-center gap-2 mb-3">
                <HandHelping className="h-4 w-4 text-gray-400" />
                <span className="text-sm font-medium text-gray-500">Help Provider</span>
              </div>
              <div className="flex items-center gap-4 p-4 rounded-xl bg-emerald-50">
                <div className="h-12 w-12 rounded-full bg-emerald-200 flex items-center justify-center text-lg font-bold text-emerald-700">
                  {request.provider?.full_name?.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="font-bold text-gray-900">{request.provider?.full_name}</p>
                  <p className="text-sm text-gray-500">Helping with this request</p>
                </div>
              </div>
            </div>
          )}

          {/* Owner actions */}
          {isOwner && (
            <div className="pt-6 border-t border-gray-100">
              <h3 className="text-sm font-bold text-gray-900 mb-3">Update Status</h3>
              <div className="flex flex-wrap gap-2">
                {(['Open', 'In Progress', 'Completed', 'Cancelled'] as RequestStatus[]).map((s) => (
                  <button
                    key={s}
                    onClick={() => handleStatusChange(s)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      request.status === s
                        ? 'bg-emerald-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
              <div className="mt-4 flex gap-3">
                <Link to={`/requests/${request.id}/edit`} className="px-4 py-2 rounded-lg text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 transition-colors">
                  Edit Request
                </Link>
              </div>
            </div>
          )}

          {/* Feedback section */}
          {request.status === 'Completed' && (
            <div className="pt-6 border-t border-gray-100">
              <h3 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
                <MessageSquare className="h-4 w-4" /> Feedback
              </h3>

              {existingFeedback ? (
                <div className="p-4 rounded-xl bg-amber-50 border border-amber-200">
                  <div className="flex items-center justify-between mb-2">
                    <StarRating rating={existingFeedback.rating} />
                    <span className="text-xs text-gray-500">{formatDate(existingFeedback.created_at)}</span>
                  </div>
                  <p className="text-sm text-gray-700">{existingFeedback.comment}</p>
                </div>
              ) : canSubmitFeedback ? (
                showFeedbackForm ? (
                  <div className="p-4 rounded-xl bg-gray-50 border border-gray-200">
                    <div className="mb-3">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Rating</label>
                      <StarRating rating={feedbackRating} interactive onChange={setFeedbackRating} size="lg" />
                    </div>
                    <div className="mb-3">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Comment (min 10 characters)</label>
                      <textarea
                        value={feedbackComment}
                        onChange={(e) => setFeedbackComment(e.target.value)}
                        rows={3}
                        placeholder="Share your experience..."
                        className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all text-sm resize-none"
                      />
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={handleSubmitFeedback}
                        disabled={submittingFeedback}
                        className="px-4 py-2 rounded-lg text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 transition-colors disabled:opacity-60"
                      >
                        {submittingFeedback ? 'Submitting...' : 'Submit Feedback'}
                      </button>
                      <button
                        onClick={() => setShowFeedbackForm(false)}
                        className="px-4 py-2 rounded-lg text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => setShowFeedbackForm(true)}
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium text-white bg-amber-500 hover:bg-amber-600 transition-colors"
                  >
                    <Star className="h-4 w-4" /> Submit Feedback
                  </button>
                )
              ) : null}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
