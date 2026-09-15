import { useEffect, useState, useCallback } from 'react';
import { Users, BookOpen, HandHelping, MessageSquare, CheckCircle2, Clock } from 'lucide-react';
import DashboardLayout from '@/components/DashboardLayout';
import LoadingState from '@/components/LoadingState';
import ErrorState from '@/components/ErrorState';
import { getAdminStats } from '@/services/admin';

export default function AdminDashboard() {
  const [stats, setStats] = useState<Awaited<ReturnType<typeof getAdminStats>> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadStats = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await getAdminStats();
      setStats(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to load data. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  if (loading) return <DashboardLayout><LoadingState /></DashboardLayout>;
  if (error) return <DashboardLayout><ErrorState message={error} onRetry={loadStats} /></DashboardLayout>;
  if (!stats) return <DashboardLayout><ErrorState /></DashboardLayout>;

  const cards = [
    { label: 'Total Users', value: stats.totalUsers, icon: Users, color: 'bg-emerald-500' },
    { label: 'Total Skills', value: stats.totalSkills, icon: BookOpen, color: 'bg-sky-500' },
    { label: 'Total Requests', value: stats.totalRequests, icon: HandHelping, color: 'bg-teal-500' },
    { label: 'Open Requests', value: stats.openRequests, icon: Clock, color: 'bg-amber-500' },
    { label: 'In Progress', value: stats.inProgressRequests, icon: HandHelping, color: 'bg-indigo-500' },
    { label: 'Completed', value: stats.completedRequests, icon: CheckCircle2, color: 'bg-teal-600' },
    { label: 'Total Feedback', value: stats.totalFeedback, icon: MessageSquare, color: 'bg-rose-500' },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-sm text-gray-500 mt-1">Platform overview and statistics.</p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {cards.map((card, i) => {
            const Icon = card.icon;
            return (
              <div key={i} className="bg-white rounded-2xl border border-gray-100 p-5 hover:shadow-md transition-shadow">
                <div className={`h-10 w-10 rounded-xl ${card.color} flex items-center justify-center mb-3`}>
                  <Icon className="h-5 w-5 text-white" />
                </div>
                <div className="text-2xl font-bold text-gray-900">{card.value}</div>
                <div className="text-sm text-gray-500">{card.label}</div>
              </div>
            );
          })}
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <h2 className="font-bold text-gray-900 mb-4">Platform Health</h2>
          <div className="space-y-3">
            <HealthBar label="Open Requests" value={stats.openRequests} total={stats.totalRequests} color="bg-amber-500" />
            <HealthBar label="In Progress" value={stats.inProgressRequests} total={stats.totalRequests} color="bg-indigo-500" />
            <HealthBar label="Completed" value={stats.completedRequests} total={stats.totalRequests} color="bg-teal-600" />
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

function HealthBar({ label, value, total, color }: { label: string; value: number; total: number; color: string }) {
  const pct = total > 0 ? Math.round((value / total) * 100) : 0;
  return (
    <div>
      <div className="flex items-center justify-between text-sm mb-1">
        <span className="text-gray-600">{label}</span>
        <span className="text-gray-400">{value} / {total} ({pct}%)</span>
      </div>
      <div className="h-2 rounded-full bg-gray-100 overflow-hidden">
        <div className={`h-full ${color} rounded-full transition-all`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}
