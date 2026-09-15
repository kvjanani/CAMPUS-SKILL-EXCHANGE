import { useEffect, useState, useCallback, useMemo } from 'react';
import { Search, BookOpen, Trash2, Filter, X } from 'lucide-react';
import DashboardLayout from '@/components/DashboardLayout';
import LoadingState from '@/components/LoadingState';
import ErrorState from '@/components/ErrorState';
import EmptyState from '@/components/EmptyState';
import Badge from '@/components/Badge';
import ConfirmDialog from '@/components/ConfirmDialog';
import { useToast } from '@/context/ToastContext';
import { getAdminSkills } from '@/services/admin';
import { deleteSkill } from '@/services/skills';
import { CATEGORIES, SKILL_LEVELS } from '@/types';
import { formatDate } from '@/utils/format';
import type { SkillWithProfile } from '@/types';

export default function ManageSkills() {
  const { showSuccess, showError } = useToast();
  const [skills, setSkills] = useState<SkillWithProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [level, setLevel] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<SkillWithProfile | null>(null);

  const loadSkills = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await getAdminSkills();
      setSkills(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to load data. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSkills();
  }, [loadSkills]);

  const filtered = useMemo(() => {
    return skills.filter((s) => {
      if (search && !s.skill_name.toLowerCase().includes(search.toLowerCase()) && !(s.profiles?.full_name || '').toLowerCase().includes(search.toLowerCase())) return false;
      if (category && s.category !== category) return false;
      if (level && s.skill_level !== level) return false;
      return true;
    });
  }, [skills, search, category, level]);

  const hasFilters = !!(search || category || level);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteSkill(deleteTarget.id);
      setSkills((prev) => prev.filter((s) => s.id !== deleteTarget.id));
      showSuccess('Skill deleted successfully.');
    } catch (err) {
      showError(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Manage Skills</h1>
          <p className="text-sm text-gray-500 mt-1">View and moderate all skills on the platform.</p>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 p-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by skill name or provider..."
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
                <label className="block text-xs font-medium text-gray-500 mb-1">Category</label>
                <select value={category} onChange={(e) => setCategory(e.target.value)} className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm bg-white outline-none focus:border-emerald-500">
                  <option value="">All</option>
                  {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Level</label>
                <select value={level} onChange={(e) => setLevel(e.target.value)} className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm bg-white outline-none focus:border-emerald-500">
                  <option value="">All</option>
                  {SKILL_LEVELS.map((l) => <option key={l} value={l}>{l}</option>)}
                </select>
              </div>
              {hasFilters && (
                <button onClick={() => { setSearch(''); setCategory(''); setLevel(''); }} className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-red-600 transition-colors sm:col-span-2 justify-self-start">
                  <X className="h-4 w-4" /> Clear all filters
                </button>
              )}
            </div>
          )}
        </div>

        {loading ? (
          <LoadingState />
        ) : error ? (
          <ErrorState message={error} onRetry={loadSkills} />
        ) : filtered.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100">
            <EmptyState icon={<BookOpen className="h-12 w-12" />} title="No skills found" message={hasFilters ? "Try adjusting your filters." : "No skills have been added yet."} />
          </div>
        ) : (
          <>
            <p className="text-sm text-gray-500">{filtered.length} skill{filtered.length !== 1 ? 's' : ''} found</p>
            <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 border-b border-gray-100">
                    <tr>
                      <th className="text-left font-medium text-gray-500 px-4 py-3">Skill</th>
                      <th className="text-left font-medium text-gray-500 px-4 py-3 hidden sm:table-cell">Category</th>
                      <th className="text-left font-medium text-gray-500 px-4 py-3">Level</th>
                      <th className="text-left font-medium text-gray-500 px-4 py-3 hidden md:table-cell">Provider</th>
                      <th className="text-left font-medium text-gray-500 px-4 py-3 hidden lg:table-cell">Created</th>
                      <th className="text-right font-medium text-gray-500 px-4 py-3">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {filtered.map((skill) => (
                      <tr key={skill.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-4 py-3 font-medium text-gray-900">{skill.skill_name}</td>
                        <td className="px-4 py-3 text-gray-600 hidden sm:table-cell">{skill.category}</td>
                        <td className="px-4 py-3"><Badge variant={skill.skill_level === 'Advanced' ? 'success' : skill.skill_level === 'Intermediate' ? 'info' : 'neutral'}>{skill.skill_level}</Badge></td>
                        <td className="px-4 py-3 text-gray-600 hidden md:table-cell">{skill.profiles?.full_name}</td>
                        <td className="px-4 py-3 text-gray-500 hidden lg:table-cell">{formatDate(skill.created_at)}</td>
                        <td className="px-4 py-3 text-right">
                          <button
                            onClick={() => setDeleteTarget(skill)}
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
        title="Delete Skill"
        message={`Are you sure you want to delete "${deleteTarget?.skill_name}"? This action cannot be undone.`}
      />
    </DashboardLayout>
  );
}
