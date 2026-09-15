import { useEffect, useState, useCallback } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Clock, Wifi, User, BookOpen, FileText, HandHelping } from 'lucide-react';
import DashboardLayout from '@/components/DashboardLayout';
import LoadingState from '@/components/LoadingState';
import ErrorState from '@/components/ErrorState';
import Badge from '@/components/Badge';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { getSkillById } from '@/services/skills';
import { createHelpRequest } from '@/services/helpRequests';
import type { SkillWithProfile } from '@/types';

export default function SkillDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { profile } = useAuth();
  const { showSuccess, showError } = useToast();
  const [skill, setSkill] = useState<SkillWithProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [requesting, setRequesting] = useState(false);

  const loadSkill = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    setError('');
    try {
      const data = await getSkillById(id);
      setSkill(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to load data. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadSkill();
  }, [loadSkill]);

  const handleRequestHelp = async () => {
    if (!skill || !profile) return;
    if (skill.user_id === profile.id) {
      showError('You cannot request help on your own skill.');
      return;
    }
    setRequesting(true);
    try {
      await createHelpRequest({
        title: `Help with ${skill.skill_name}`,
        skill_needed: skill.skill_name,
        category: skill.category,
        description: `I need help with ${skill.skill_name} from ${skill.profiles?.full_name}.`,
        priority: 'Medium',
        preferred_mode: skill.preferred_mode,
        deadline: null,
      });
      showSuccess('Help request created successfully.');
      navigate('/my-requests');
    } catch (err) {
      showError(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
    } finally {
      setRequesting(false);
    }
  };

  if (loading) return <DashboardLayout><LoadingState /></DashboardLayout>;
  if (error) return <DashboardLayout><ErrorState message={error} onRetry={loadSkill} /></DashboardLayout>;
  if (!skill) return <DashboardLayout><ErrorState message="Skill not found." /></DashboardLayout>;

  const isOwner = skill.user_id === profile?.id;

  return (
    <DashboardLayout>
      <div className="max-w-3xl mx-auto space-y-6">
        <Link to="/browse-skills" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-emerald-600 transition-colors">
          <ArrowLeft className="h-4 w-4" /> Back to Browse Skills
        </Link>

        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{skill.skill_name}</h1>
              <p className="text-sm text-gray-500 mt-1">{skill.category}</p>
            </div>
            <Badge variant={skill.skill_level === 'Advanced' ? 'success' : skill.skill_level === 'Intermediate' ? 'info' : 'neutral'}>
              {skill.skill_level}
            </Badge>
          </div>

          {skill.description && (
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-1.5">
                <FileText className="h-4 w-4 text-gray-400" />
                <span className="text-sm font-medium text-gray-500">Description</span>
              </div>
              <p className="text-sm text-gray-700 leading-relaxed">{skill.description}</p>
            </div>
          )}

          {skill.experience && (
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-1.5">
                <BookOpen className="h-4 w-4 text-gray-400" />
                <span className="text-sm font-medium text-gray-500">Experience</span>
              </div>
              <p className="text-sm text-gray-700">{skill.experience}</p>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="flex items-center gap-3 p-3 rounded-xl bg-gray-50">
              <Clock className="h-5 w-5 text-gray-400" />
              <div>
                <p className="text-xs text-gray-500">Availability</p>
                <p className="text-sm font-medium text-gray-900">{skill.availability}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-xl bg-gray-50">
              <Wifi className="h-5 w-5 text-gray-400" />
              <div>
                <p className="text-xs text-gray-500">Preferred Mode</p>
                <p className="text-sm font-medium text-gray-900">{skill.preferred_mode}</p>
              </div>
            </div>
          </div>

          {/* Provider info */}
          <div className="pt-6 border-t border-gray-100">
            <div className="flex items-center gap-2 mb-3">
              <User className="h-4 w-4 text-gray-400" />
              <span className="text-sm font-medium text-gray-500">Skill Provider</span>
            </div>
            <div className="flex items-center gap-4 p-4 rounded-xl bg-emerald-50">
              <div className="h-12 w-12 rounded-full bg-emerald-200 flex items-center justify-center text-lg font-bold text-emerald-700">
                {skill.profiles?.full_name?.charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="font-bold text-gray-900">{skill.profiles?.full_name}</p>
                <p className="text-sm text-gray-500">{skill.profiles?.department} · {skill.profiles?.year}</p>
                {skill.profiles?.bio && <p className="text-xs text-gray-500 mt-1 line-clamp-2">{skill.profiles.bio}</p>}
              </div>
            </div>
          </div>

          {!isOwner && (
            <button
              onClick={handleRequestHelp}
              disabled={requesting}
              className="mt-6 w-full inline-flex items-center justify-center gap-2 py-3 rounded-xl text-white bg-emerald-600 hover:bg-emerald-700 font-semibold shadow-lg shadow-emerald-600/20 transition-all disabled:opacity-60"
            >
              <HandHelping className="h-5 w-5" />
              {requesting ? 'Creating request...' : 'Request Help'}
            </button>
          )}
          {isOwner && (
            <div className="mt-6 p-4 rounded-xl bg-gray-50 text-center text-sm text-gray-500">
              This is your skill. You can edit it from <Link to="/my-skills" className="text-emerald-600 font-medium">My Skills</Link>.
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
