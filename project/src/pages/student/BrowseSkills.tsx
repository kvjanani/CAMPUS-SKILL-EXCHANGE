import { useEffect, useState, useCallback, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Search, BookOpen, Clock, Wifi, Filter, X } from 'lucide-react';
import DashboardLayout from '@/components/DashboardLayout';
import LoadingState from '@/components/LoadingState';
import ErrorState from '@/components/ErrorState';
import EmptyState from '@/components/EmptyState';
import Badge from '@/components/Badge';
import { getAllSkills } from '@/services/skills';
import { CATEGORIES, SKILL_LEVELS, AVAILABILITY_OPTIONS, MODE_OPTIONS } from '@/types';
import type { SkillWithProfile } from '@/types';

export default function BrowseSkills() {
  const [skills, setSkills] = useState<SkillWithProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [level, setLevel] = useState('');
  const [availability, setAvailability] = useState('');
  const [mode, setMode] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  const loadSkills = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await getAllSkills();
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
      if (search && !s.skill_name.toLowerCase().includes(search.toLowerCase())) return false;
      if (category && s.category !== category) return false;
      if (level && s.skill_level !== level) return false;
      if (availability && s.availability !== availability) return false;
      if (mode && s.preferred_mode !== mode) return false;
      return true;
    });
  }, [skills, search, category, level, availability, mode]);

  const hasFilters = !!(search || category || level || availability || mode);
  const clearFilters = () => {
    setSearch('');
    setCategory('');
    setLevel('');
    setAvailability('');
    setMode('');
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Browse Skills</h1>
          <p className="text-sm text-gray-500 mt-1">Discover skills offered by other students.</p>
        </div>

        {/* Search + Filter bar */}
        <div className="bg-white rounded-2xl border border-gray-100 p-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by skill name..."
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all text-sm"
              />
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                showFilters || hasFilters
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  : 'bg-gray-50 text-gray-700 border border-gray-200 hover:bg-gray-100'
              }`}
            >
              <Filter className="h-4 w-4" />
              Filters
              {hasFilters && <span className="px-1.5 py-0.5 rounded-full text-xs bg-emerald-600 text-white">!</span>}
            </button>
          </div>

          {showFilters && (
            <div className="mt-4 pt-4 border-t border-gray-100 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
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
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Availability</label>
                <select value={availability} onChange={(e) => setAvailability(e.target.value)} className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm bg-white outline-none focus:border-emerald-500">
                  <option value="">All</option>
                  {AVAILABILITY_OPTIONS.map((a) => <option key={a} value={a}>{a}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Mode</label>
                <select value={mode} onChange={(e) => setMode(e.target.value)} className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm bg-white outline-none focus:border-emerald-500">
                  <option value="">All</option>
                  {MODE_OPTIONS.map((m) => <option key={m} value={m}>{m}</option>)}
                </select>
              </div>
              {hasFilters && (
                <button onClick={clearFilters} className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-red-600 transition-colors sm:col-span-2 lg:col-span-4 justify-self-start">
                  <X className="h-4 w-4" /> Clear all filters
                </button>
              )}
            </div>
          )}
        </div>

        {/* Results */}
        {loading ? (
          <LoadingState />
        ) : error ? (
          <ErrorState message={error} onRetry={loadSkills} />
        ) : filtered.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100">
            <EmptyState
              icon={<BookOpen className="h-12 w-12" />}
              title="No skills found"
              message={hasFilters ? "Try adjusting your filters or search." : "No skills have been added yet."}
            />
          </div>
        ) : (
          <>
            <p className="text-sm text-gray-500">{filtered.length} skill{filtered.length !== 1 ? 's' : ''} found</p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filtered.map((skill) => (
                <Link
                  key={skill.id}
                  to={`/skills/${skill.id}`}
                  className="bg-white rounded-2xl border border-gray-100 p-5 hover:shadow-lg hover:border-emerald-200 transition-all"
                >
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
                  <div className="flex items-center gap-3 text-xs text-gray-500 mb-3">
                    <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" /> {skill.availability}</span>
                    <span className="flex items-center gap-1"><Wifi className="h-3.5 w-3.5" /> {skill.preferred_mode}</span>
                  </div>
                  <div className="flex items-center gap-2 pt-3 border-t border-gray-100">
                    <div className="h-8 w-8 rounded-full bg-emerald-100 flex items-center justify-center text-xs font-bold text-emerald-700">
                      {skill.profiles?.full_name?.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{skill.profiles?.full_name}</p>
                      <p className="text-xs text-gray-500">{skill.profiles?.department}</p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
