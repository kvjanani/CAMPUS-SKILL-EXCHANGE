import { useEffect, useState, type FormEvent } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { ArrowLeft, Save } from 'lucide-react';
import DashboardLayout from '@/components/DashboardLayout';
import LoadingState from '@/components/LoadingState';
import { useToast } from '@/context/ToastContext';
import { createHelpRequest, updateHelpRequest, getHelpRequestById, type HelpRequestInput } from '@/services/helpRequests';
import { getAllSkills } from '@/services/skills';
import { CATEGORIES, PRIORITY_OPTIONS, MODE_OPTIONS, STATUS_OPTIONS } from '@/types';
import type { SkillWithProfile } from '@/types';

export default function HelpRequestForm() {
  const { id } = useParams();
  const isEdit = !!id;
  const navigate = useNavigate();
  const { showSuccess, showError } = useToast();
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [matchedSkills, setMatchedSkills] = useState<SkillWithProfile[]>([]);

  const [form, setForm] = useState<HelpRequestInput>({
    title: '',
    skill_needed: '',
    category: CATEGORIES[0] as string,
    description: '',
    priority: 'Medium',
    preferred_mode: 'Both',
    deadline: '',
    status: 'Open',
  });

  useEffect(() => {
    if (!isEdit || !id) return;
    (async () => {
      try {
        const req = await getHelpRequestById(id);
        if (req) {
          setForm({
            title: req.title,
            skill_needed: req.skill_needed,
            category: req.category,
            description: req.description,
            priority: req.priority,
            preferred_mode: req.preferred_mode,
            deadline: req.deadline || '',
            status: req.status,
          });
        }
      } catch (err) {
        showError(err instanceof Error ? err.message : 'Unable to load request.');
      } finally {
        setLoading(false);
      }
    })();
  }, [id, isEdit, showError]);

  // Skill matching: find skills that match the requested skill
  useEffect(() => {
    if (!form.skill_needed.trim()) {
      setMatchedSkills([]);
      return;
    }
    (async () => {
      try {
        const allSkills = await getAllSkills();
        const searchTerm = form.skill_needed.toLowerCase();
        const exact = allSkills.filter((s) => s.skill_name.toLowerCase().includes(searchTerm));
        const categoryMatch = allSkills.filter((s) =>
          s.category.toLowerCase().includes(form.category.toLowerCase()) &&
          !exact.includes(s)
        );
        setMatchedSkills([...exact, ...categoryMatch].slice(0, 5));
      } catch {
        setMatchedSkills([]);
      }
    })();
  }, [form.skill_needed, form.category]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!form.title.trim() || !form.skill_needed.trim()) {
      showError('Please fill in all required fields.');
      return;
    }
    setSaving(true);
    try {
      const payload = { ...form, deadline: form.deadline || null };
      if (isEdit && id) {
        await updateHelpRequest(id, payload);
        showSuccess('Request updated successfully.');
      } else {
        await createHelpRequest(payload);
        showSuccess('Request created successfully.');
      }
      navigate('/my-requests');
    } catch (err) {
      showError(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <DashboardLayout><LoadingState /></DashboardLayout>;

  return (
    <DashboardLayout>
      <div className="max-w-2xl mx-auto space-y-6">
        <div>
          <Link to={isEdit ? '/my-requests' : '/help-requests'} className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-emerald-600 transition-colors mb-2">
            <ArrowLeft className="h-4 w-4" /> Back
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">{isEdit ? 'Edit Help Request' : 'Create Help Request'}</h1>
          <p className="text-sm text-gray-500 mt-1">{isEdit ? 'Update your request details.' : 'Request help with a skill you need.'}</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-gray-100 p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Title *</label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="e.g. Need help with Java basics"
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all text-sm"
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Skill Needed *</label>
              <input
                type="text"
                value={form.skill_needed}
                onChange={(e) => setForm({ ...form, skill_needed: e.target.value })}
                placeholder="e.g. Java"
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all text-sm"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Category *</label>
              <select
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all text-sm bg-white"
              >
                {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Description</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Describe what you need help with..."
              rows={3}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all text-sm resize-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Priority *</label>
              <select
                value={form.priority}
                onChange={(e) => setForm({ ...form, priority: e.target.value as HelpRequestInput['priority'] })}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all text-sm bg-white"
              >
                {PRIORITY_OPTIONS.map((p) => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Preferred Mode *</label>
              <select
                value={form.preferred_mode}
                onChange={(e) => setForm({ ...form, preferred_mode: e.target.value as HelpRequestInput['preferred_mode'] })}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all text-sm bg-white"
              >
                {MODE_OPTIONS.map((m) => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Deadline</label>
              <input
                type="date"
                value={form.deadline || ''}
                onChange={(e) => setForm({ ...form, deadline: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all text-sm"
              />
            </div>
            {isEdit && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Status</label>
                <select
                  value={form.status}
                  onChange={(e) => setForm({ ...form, status: e.target.value as HelpRequestInput['status'] })}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all text-sm bg-white"
                >
                  {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            )}
          </div>

          {/* Skill Matching */}
          {!isEdit && matchedSkills.length > 0 && (
            <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200">
              <h3 className="text-sm font-bold text-emerald-800 mb-2">Students Who Can Help</h3>
              <div className="space-y-2">
                {matchedSkills.map((s) => (
                  <Link
                    key={s.id}
                    to={`/skills/${s.id}`}
                    className="flex items-center justify-between p-2 rounded-lg bg-white hover:bg-emerald-50 transition-colors"
                  >
                    <div>
                      <p className="text-sm font-medium text-gray-900">{s.skill_name}</p>
                      <p className="text-xs text-gray-500">{s.profiles?.full_name} · {s.skill_level}</p>
                    </div>
                    <span className="text-xs text-emerald-600 font-medium">View →</span>
                  </Link>
                ))}
              </div>
            </div>
          )}

          <div className="flex items-center gap-3 pt-2">
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 transition-colors disabled:opacity-60"
            >
              <Save className="h-4 w-4" />
              {saving ? 'Saving...' : isEdit ? 'Update Request' : 'Create Request'}
            </button>
            <Link
              to={isEdit ? '/my-requests' : '/help-requests'}
              className="px-5 py-2.5 rounded-lg text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 transition-colors"
            >
              Cancel
            </Link>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
}
