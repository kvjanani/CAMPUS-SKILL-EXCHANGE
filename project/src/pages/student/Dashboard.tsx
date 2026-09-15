import { useEffect, useState, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  BookOpen, HandHelping, CheckCircle2, Clock, Plus, Search,
  ClipboardList, User, ArrowRight, FolderOpen, Loader2,
} from 'lucide-react';
import DashboardLayout from '@/components/DashboardLayout';
import LoadingState from '@/components/LoadingState';
import ErrorState from '@/components/ErrorState';
import Badge from '@/components/Badge';
import { useAuth } from '@/context/AuthContext';
import { getMySkills } from '@/services/skills';
import { getMyHelpRequests } from '@/services/helpRequests';
import { formatDate } from '@/utils/format';
import type { SkillWithProfile, HelpRequestWithProfile } from '@/types';

export default function StudentDashboard() {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const [skills, setSkills] = useState<SkillWithProfile[]>([]);
  const [requests, setRequests] = useState<HelpRequestWithProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadData = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [skillsData, requestsData] = await Promise.all([
        getMySkills(),
        getMyHelpRequests(),
      ]);
      setSkills(skillsData);
      setRequests(requestsData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to load data. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const mySkills = skills.filter((s) => s.user_id === profile?.id);
  const myRequests = requests.filter((r) => r.user_id === profile?.id);
  const activeRequests = myRequests.filter((r) => r.status === 'Open' || r.status === 'In Progress');
  const completedRequests = myRequests.filter((r) => r.status === 'Completed');
  const pendingRequests = myRequests.filter((r) => r.status === 'Open');

  const stats = [
    { label: 'Skills Offered', value: mySkills.length, icon: BookOpen, color: 'bg-emerald-500' },
    { label: 'Active Requests', value: activeRequests.length, icon: HandHelping, color: 'bg-sky-500' },
    { label: 'Completed', value: completedRequests.length, icon: CheckCircle2, color: 'bg-teal-500' },
    { label: 'Pending', value: pendingRequests.length, icon: Clock, color: 'bg-amber-500' },
  ];

  const quickActions = [
    { label: 'Add Skill', icon: Plus, to: '/my-skills/new', color: 'bg-emerald-600 hover:bg-emerald-700' },
    { label: 'Request Help', icon: HandHelping, to: '/help-requests/new', color: 'bg-sky-600 hover:bg-sky-700' },
    { label: 'Browse Skills', icon: Search, to: '/browse-skills', color: 'bg-teal-600 hover:bg-teal-700' },
    { label: 'My Requests', icon: ClipboardList, to: '/my-requests', color: 'bg-amber-600 hover:bg-amber-700' },
    { label: 'Edit Profile', icon: User, to: '/profile', color: 'bg-gray-700 hover:bg-gray-800' },
  ];

  if (loading) return <DashboardLayout><LoadingState /></DashboardLayout>;
  if (error) return <DashboardLayout><ErrorState message={error} onRetry={loadData} /></DashboardLayout>;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Welcome */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Welcome back, {profile?.full_name?.split(' ')[0]}!
          </h1>
          <p className="text-sm text-gray-500 mt-1">Here's what's happening with your skills and requests.</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat, i) => {
            const Icon = stat.icon;
            return (
              <div key={i} className="bg-white rounded-2xl border border-gray-100 p-5 hover:shadow-md transition-shadow">
                <div className={`h-10 w-10 rounded-xl ${stat.color} flex items-center justify-center mb-3`}>
                  <Icon className="h-5 w-5 text-white" />
                </div>
                <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
                <div className="text-sm text-gray-500">{stat.label}</div>
              </div>
            );
          })}
        </div>

        {/* Quick Actions */}
        <div>
          <h2 className="text-lg font-bold text-gray-900 mb-3">Quick Actions</h2>
          <div className="flex flex-wrap gap-3">
            {quickActions.map((action, i) => {
              const Icon = action.icon;
              return (
                <button
                  key={i}
                  onClick={() => navigate(action.to)}
                  className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-white text-sm font-medium transition-all ${action.color}`}
                >
                  <Icon className="h-4 w-4" />
                  {action.label}
                </button>
              );
            })}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Skills */}
          <div className="bg-white rounded-2xl border border-gray-100 p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-gray-900 flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-emerald-600" />
                Recent Skills
              </h2>
              <Link to="/my-skills" className="text-sm text-emerald-600 hover:text-emerald-700 font-medium flex items-center gap-1">
                View all <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
            {mySkills.length === 0 ? (
              <div className="text-center py-8">
                <FolderOpen className="h-10 w-10 text-gray-300 mx-auto mb-2" />
                <p className="text-sm text-gray-500">No skills added yet.</p>
                <Link to="/my-skills/new" className="mt-2 inline-flex items-center gap-1 text-sm text-emerald-600 font-medium">
                  <Plus className="h-4 w-4" /> Add your first skill
                </Link>
              </div>
            ) : (
              <div className="space-y-2">
                {mySkills.slice(0, 4).map((skill) => (
                  <Link
                    key={skill.id}
                    to={`/skills/${skill.id}`}
                    className="flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 transition-colors"
                  >
                    <div>
                      <p className="text-sm font-medium text-gray-900">{skill.skill_name}</p>
                      <p className="text-xs text-gray-500">{skill.category} · {skill.skill_level}</p>
                    </div>
                    <Badge variant={skill.skill_level === 'Advanced' ? 'success' : skill.skill_level === 'Intermediate' ? 'info' : 'neutral'}>
                      {skill.skill_level}
                    </Badge>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Recent Requests */}
          <div className="bg-white rounded-2xl border border-gray-100 p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-gray-900 flex items-center gap-2">
                <HandHelping className="h-5 w-5 text-sky-600" />
                Recent Requests
              </h2>
              <Link to="/my-requests" className="text-sm text-emerald-600 hover:text-emerald-700 font-medium flex items-center gap-1">
                View all <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
            {myRequests.length === 0 ? (
              <div className="text-center py-8">
                <ClipboardList className="h-10 w-10 text-gray-300 mx-auto mb-2" />
                <p className="text-sm text-gray-500">No help requests yet.</p>
                <Link to="/help-requests/new" className="mt-2 inline-flex items-center gap-1 text-sm text-emerald-600 font-medium">
                  <Plus className="h-4 w-4" /> Create a request
                </Link>
              </div>
            ) : (
              <div className="space-y-2">
                {myRequests.slice(0, 4).map((req) => (
                  <Link
                    key={req.id}
                    to={`/requests/${req.id}`}
                    className="flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 transition-colors"
                  >
                    <div>
                      <p className="text-sm font-medium text-gray-900">{req.title}</p>
                      <p className="text-xs text-gray-500">{req.skill_needed} · {formatDate(req.created_at)}</p>
                    </div>
                    <Badge variant={req.status === 'Completed' ? 'success' : req.status === 'Open' ? 'info' : req.status === 'In Progress' ? 'warning' : 'neutral'}>
                      {req.status}
                    </Badge>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
