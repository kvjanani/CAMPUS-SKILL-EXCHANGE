import { useEffect, useState, type FormEvent } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { ArrowLeft, Save } from 'lucide-react';
import DashboardLayout from '@/components/DashboardLayout';
import LoadingState from '@/components/LoadingState';
import { useToast } from '@/context/ToastContext';
import { createSkill, updateSkill, getSkillById, type SkillInput } from '@/services/skills';
import { CATEGORIES, SKILL_LEVELS, AVAILABILITY_OPTIONS, MODE_OPTIONS } from '@/types';

export default function SkillForm() {
  const { id } = useParams();
  const isEdit = !!id;
  const navigate = useNavigate();
  const { showSuccess, showError } = useToast();
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState<SkillInput>({
    skill_name: '',
    category: CATEGORIES[0] as string,
    skill_level: 'Beginner',
    description: '',
    experience: '',
    availability: 'Both',
    preferred_mode: 'Both',
  });

  useEffect(() => {
    if (!isEdit || !id) return;
    (async () => {
      try {
        const skill = await getSkillById(id);
        if (skill) {
          setForm({
            skill_name: skill.skill_name,
            category: skill.category,
            skill_level: skill.skill_level,
            description: skill.description,
            experience: skill.experience,
            availability: skill.availability,
            preferred_mode: skill.preferred_mode,
          });
        }
      } catch (err) {
        showError(err instanceof Error ? err.message : 'Unable to load skill.');
      } finally {
        setLoading(false);
      }
    })();
  }, [id, isEdit, showError]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!form.skill_name.trim()) {
      showError('Please enter a skill name.');
      return;
    }
    setSaving(true);
    try {
      if (isEdit && id) {
        await updateSkill(id, form);
        showSuccess('Skill updated successfully.');
      } else {
        await createSkill(form);
        showSuccess('Skill added successfully.');
      }
      navigate('/my-skills');
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
          <Link to="/my-skills" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-emerald-600 transition-colors mb-2">
            <ArrowLeft className="h-4 w-4" /> Back to My Skills
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">{isEdit ? 'Edit Skill' : 'Add Skill'}</h1>
          <p className="text-sm text-gray-500 mt-1">{isEdit ? 'Update your skill details.' : 'Share a skill you can help others with.'}</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-gray-100 p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Skill Name *</label>
            <input
              type="text"
              value={form.skill_name}
              onChange={(e) => setForm({ ...form, skill_name: e.target.value })}
              placeholder="e.g. Python Programming"
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all text-sm"
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Category *</label>
              <select
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all text-sm bg-white"
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Skill Level *</label>
              <select
                value={form.skill_level}
                onChange={(e) => setForm({ ...form, skill_level: e.target.value as SkillInput['skill_level'] })}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all text-sm bg-white"
              >
                {SKILL_LEVELS.map((l) => (
                  <option key={l} value={l}>{l}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Description</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Describe what you can teach..."
              rows={3}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all text-sm resize-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Experience</label>
            <input
              type="text"
              value={form.experience}
              onChange={(e) => setForm({ ...form, experience: e.target.value })}
              placeholder="e.g. 2 years of project experience"
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all text-sm"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Availability *</label>
              <select
                value={form.availability}
                onChange={(e) => setForm({ ...form, availability: e.target.value as SkillInput['availability'] })}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all text-sm bg-white"
              >
                {AVAILABILITY_OPTIONS.map((a) => (
                  <option key={a} value={a}>{a}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Preferred Mode *</label>
              <select
                value={form.preferred_mode}
                onChange={(e) => setForm({ ...form, preferred_mode: e.target.value as SkillInput['preferred_mode'] })}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all text-sm bg-white"
              >
                {MODE_OPTIONS.map((m) => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex items-center gap-3 pt-2">
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 transition-colors disabled:opacity-60"
            >
              <Save className="h-4 w-4" />
              {saving ? 'Saving...' : isEdit ? 'Update Skill' : 'Add Skill'}
            </button>
            <Link
              to="/my-skills"
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
