import { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Plus, BookOpen, Pencil, Trash2, Clock, Wifi } from 'lucide-react';
import DashboardLayout from '@/components/DashboardLayout';
import LoadingState from '@/components/LoadingState';
import ErrorState from '@/components/ErrorState';
import EmptyState from '@/components/EmptyState';
import Badge from '@/components/Badge';
import ConfirmDialog from '@/components/ConfirmDialog';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { getMySkills, deleteSkill } from '@/services/skills';
import { formatDate } from '@/utils/format';
import type { SkillWithProfile } from '@/types';

export default function MySkills() {
  const { profile } = useAuth();
  const { showSuccess, showError } = useToast();
  const [skills, setSkills] = useState<SkillWithProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleteTarget, setDeleteTarget] = useState<SkillWithProfile | null>(null);

  const loadSkills = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await getMySkills();
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

  const mySkills = skills.filter((s) => s.user_id === profile?.id);

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
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">My Skills</h1>
            <p className="text-sm text-gray-500 mt-1">Manage the skills you offer to other students.</p>
          </div>
          <Link
            to="/my-skills/new"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-white bg-emerald-600 hover:bg-emerald-700 text-sm font-semibold transition-colors"
          >
            <Plus className="h-4 w-4" />
            Add Skill
          </Link>
        </div>

        {loading ? (
          <LoadingState />
        ) : error ? (
          <ErrorState message={error} onRetry={loadSkills} />
        ) : mySkills.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100">
            <EmptyState
              icon={<BookOpen className="h-12 w-12" />}
              title="No skills yet"
              message="Add your first skill to start helping other students."
              action={
                <Link to="/my-skills/new" className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 transition-colors">
                  <Plus className="h-4 w-4" /> Add Skill
                </Link>
              }
            />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {mySkills.map((skill) => (
              <div key={skill.id} className="bg-white rounded-2xl border border-gray-100 p-5 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-bold text-gray-900">{skill.skill_name}</h3>
                    <p className="text-xs text-gray-500">{skill.category}</p>
                  </div>
                  <Badge variant={skill.skill_level === 'Advanced' ? 'success' : skill.skill_level === 'Intermediate' ? 'info' : 'neutral'}>
                    {skill.skill_level}
                  </Badge>
                </div>
                {skill.description && (
                  <p className="text-sm text-gray-600 mb-3 line-clamp-2">{skill.description}</p>
                )}
                <div className="flex items-center gap-3 text-xs text-gray-500 mb-4">
                  <span className="flex items-center gap-1">
                    <Clock className="h-3.5 w-3.5" /> {skill.availability}
                  </span>
                  <span className="flex items-center gap-1">
                    <Wifi className="h-3.5 w-3.5" /> {skill.preferred_mode}
                  </span>
                </div>
                <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                  <span className="text-xs text-gray-400">Added {formatDate(skill.created_at)}</span>
                  <div className="flex items-center gap-2">
                    <Link
                      to={`/my-skills/${skill.id}/edit`}
                      className="p-2 rounded-lg text-gray-500 hover:bg-emerald-50 hover:text-emerald-600 transition-colors"
                    >
                      <Pencil className="h-4 w-4" />
                    </Link>
                    <button
                      onClick={() => setDeleteTarget(skill)}
                      className="p-2 rounded-lg text-gray-500 hover:bg-red-50 hover:text-red-600 transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
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
        title="Delete Skill"
        message={`Are you sure you want to delete "${deleteTarget?.skill_name}"? This action cannot be undone.`}
      />
    </DashboardLayout>
  );
}
