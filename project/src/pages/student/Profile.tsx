import { useEffect, useState, useCallback, type FormEvent } from 'react';
import { User, Mail, Building2, BookOpen, Calendar, FileText, Save, Star } from 'lucide-react';
import DashboardLayout from '@/components/DashboardLayout';
import LoadingState from '@/components/LoadingState';
import ErrorState from '@/components/ErrorState';
import Badge from '@/components/Badge';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { updateProfile } from '@/services/profiles';
import { getSkillsByUser } from '@/services/skills';
import { getAverageRatingForProvider } from '@/services/feedback';
import { getMyHelpRequests } from '@/services/helpRequests';
import { YEAR_OPTIONS } from '@/types';

export default function Profile() {
  const { profile, refreshProfile } = useAuth();
  const { showSuccess, showError } = useToast();
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [stats, setStats] = useState({ skillsCount: 0, completedCount: 0, avgRating: 0 });

  const [form, setForm] = useState({
    full_name: '',
    department: '',
    year: '',
    college: '',
    bio: '',
  });

  const loadStats = useCallback(async () => {
    if (!profile) return;
    try {
      const [skills, requests, rating] = await Promise.all([
        getSkillsByUser(profile.id),
        getMyHelpRequests(),
        getAverageRatingForProvider(profile.id),
      ]);
      setStats({
        skillsCount: skills.length,
        completedCount: requests.filter((r) => r.status === 'Completed' && r.provider_id === profile.id).length,
        avgRating: Math.round(rating * 10) / 10,
      });
    } catch (err) {
      console.error('Error loading stats:', err);
    } finally {
      setLoading(false);
    }
  }, [profile]);

  useEffect(() => {
    if (profile) {
      setForm({
        full_name: profile.full_name,
        department: profile.department,
        year: profile.year,
        college: profile.college,
        bio: profile.bio || '',
      });
      loadStats();
    }
  }, [profile, loadStats]);

  const handleSave = async (e: FormEvent) => {
    e.preventDefault();
    if (!profile) return;
    if (!form.full_name.trim() || !form.department.trim() || !form.college.trim()) {
      showError('Please fill in all required fields.');
      return;
    }
    setSaving(true);
    try {
      await updateProfile(profile.id, form);
      await refreshProfile();
      setEditing(false);
      showSuccess('Profile updated successfully.');
    } catch (err) {
      showError(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <DashboardLayout><LoadingState /></DashboardLayout>;
  if (error) return <DashboardLayout><ErrorState message={error} /></DashboardLayout>;
  if (!profile) return <DashboardLayout><ErrorState message="Profile not found." /></DashboardLayout>;

  return (
    <DashboardLayout>
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">My Profile</h1>
          {!editing && (
            <button
              onClick={() => setEditing(true)}
              className="px-4 py-2 rounded-lg text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 transition-colors"
            >
              Edit Profile
            </button>
          )}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-white rounded-2xl border border-gray-100 p-5 text-center">
            <div className="text-2xl font-bold text-emerald-600">{stats.skillsCount}</div>
            <div className="text-sm text-gray-500">Skills</div>
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 p-5 text-center">
            <div className="text-2xl font-bold text-teal-600">{stats.completedCount}</div>
            <div className="text-sm text-gray-500">Completed Help</div>
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 p-5 text-center">
            <div className="text-2xl font-bold text-amber-500 flex items-center justify-center gap-1">
              {stats.avgRating > 0 ? stats.avgRating : '—'}
              {stats.avgRating > 0 && <Star className="h-5 w-5 fill-amber-400 text-amber-400" />}
            </div>
            <div className="text-sm text-gray-500">Avg Rating</div>
          </div>
        </div>

        {/* Profile Card */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          {editing ? (
            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Full Name *</label>
                <input
                  type="text"
                  value={form.full_name}
                  onChange={(e) => setForm({ ...form, full_name: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all text-sm"
                  required
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Department *</label>
                  <input
                    type="text"
                    value={form.department}
                    onChange={(e) => setForm({ ...form, department: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all text-sm"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Year</label>
                  <select
                    value={form.year}
                    onChange={(e) => setForm({ ...form, year: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all text-sm bg-white"
                  >
                    {YEAR_OPTIONS.map((y) => (
                      <option key={y} value={y}>{y}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">College *</label>
                <input
                  type="text"
                  value={form.college}
                  onChange={(e) => setForm({ ...form, college: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all text-sm"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Bio</label>
                <textarea
                  value={form.bio}
                  onChange={(e) => setForm({ ...form, bio: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all text-sm resize-none"
                />
              </div>
              <div className="flex items-center gap-3">
                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 transition-colors disabled:opacity-60"
                >
                  <Save className="h-4 w-4" />
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setEditing(false);
                    if (profile) {
                      setForm({
                        full_name: profile.full_name,
                        department: profile.department,
                        year: profile.year,
                        college: profile.college,
                        bio: profile.bio || '',
                      });
                    }
                  }}
                  className="px-5 py-2.5 rounded-lg text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="h-16 w-16 rounded-full bg-emerald-100 flex items-center justify-center">
                  <User className="h-8 w-8 text-emerald-600" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">{profile.full_name}</h2>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="primary">{profile.role}</Badge>
                    {profile.is_active ? (
                      <Badge variant="success">Active</Badge>
                    ) : (
                      <Badge variant="error">Inactive</Badge>
                    )}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-gray-100">
                <InfoRow icon={Mail} label="Email" value={profile.email} />
                <InfoRow icon={BookOpen} label="Department" value={profile.department} />
                <InfoRow icon={Calendar} label="Year" value={profile.year} />
                <InfoRow icon={Building2} label="College" value={profile.college} />
              </div>

              {profile.bio && (
                <div className="pt-4 border-t border-gray-100">
                  <div className="flex items-center gap-2 mb-1.5">
                    <FileText className="h-4 w-4 text-gray-400" />
                    <span className="text-sm font-medium text-gray-500">Bio</span>
                  </div>
                  <p className="text-sm text-gray-700 leading-relaxed">{profile.bio}</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}

function InfoRow({ icon: Icon, label, value }: { icon: typeof Mail; label: string; value: string }) {
  return (
    <div className="flex items-center gap-3">
      <div className="h-9 w-9 rounded-lg bg-gray-50 flex items-center justify-center">
        <Icon className="h-4 w-4 text-gray-400" />
      </div>
      <div>
        <p className="text-xs text-gray-500">{label}</p>
        <p className="text-sm font-medium text-gray-900">{value}</p>
      </div>
    </div>
  );
}
