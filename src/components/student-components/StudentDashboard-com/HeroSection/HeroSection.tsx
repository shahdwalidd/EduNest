
import type { FC } from 'react';
import { PlayCircle, Calendar } from 'lucide-react';
import { useAuthStore } from '../../../../store/authStore';
import { useHomeImages } from '../../../../hooks/useHomeImages';
import type { DashboardStats } from '../../../../types/student-role-types/student-home-page.types';

interface HeroSectionProps {
  stats:            DashboardStats;
  averageProgress?: number;  
  loading?:         boolean;
  onResume?:        () => void;
  onSchedule?:      () => void;
}

const getGreeting = (): string => {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
};

const buildSentence = (stats: DashboardStats): React.ReactNode => {
  if (stats.totalUpcoming === 0) {
    return <>You're all caught up this week. Keep up the great work!</>;
  }

  const parts: { value: number; label: string }[] = [];
  if (stats.mentorshipSessions > 0)
    parts.push({ value: stats.mentorshipSessions, label: `mentorship session${stats.mentorshipSessions !== 1 ? 's' : ''}` });
  if (stats.projectDeadlines > 0)
    parts.push({ value: stats.projectDeadlines, label: `project deadline${stats.projectDeadlines !== 1 ? 's' : ''}` });
  if (stats.assignments > 0)
    parts.push({ value: stats.assignments, label: `assignment${stats.assignments !== 1 ? 's' : ''}` });

  if (parts.length === 0) return <>Ready to start something new today.</>;

  return (
    <>
      Ready to continue your journey? You have{' '}
      {parts.map((p, i) => (
        <span key={i}>
          <span className="font-bold text-white">{p.value} {p.label}</span>
          {i < parts.length - 2 && ', '}
          {i === parts.length - 2 && ' and '}
        </span>
      ))}{' '}this week.
    </>
  );
};

const HeroSection: FC<HeroSectionProps> = ({
  stats,
  averageProgress,
  loading = false,
  onResume,
  onSchedule,
}) => {
  const img       = useHomeImages();
  const userName  = useAuthStore(s => s.userName) || 'Student';
  const firstName = userName.split(' ')[0];
  const greeting  = getGreeting();
  const progress  = averageProgress ?? 0;

  return (
    <div className="bg-gradient-to-br from-[#0a1628] to-[#1a2d4a] rounded-3xl p-8 md:p-12 relative overflow-hidden">

      {/* Background dot pattern */}
      <div className="absolute inset-0 opacity-5 pointer-events-none">
        <div className="absolute inset-0" style={{
          backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
          backgroundSize: '32px 32px',
        }} />
      </div>

      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">

        {/* ── Left ── */}
        <div>
          <div className="inline-block px-3 py-1 bg-white/10 backdrop-blur-sm rounded-full text-xs font-medium text-white mb-4">
            ✨ ACTIVE STUDENT PORTAL
          </div>

          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 leading-tight">
            {greeting},<br />
            {firstName}.
          </h1>

          <p className="text-gray-300 text-lg mb-8 leading-relaxed">
            {loading ? (
              <span className="flex flex-col gap-2">
                <span className="h-4 w-3/4 bg-white/10 rounded animate-pulse block" />
                <span className="h-4 w-1/2 bg-white/10 rounded animate-pulse block" />
              </span>
            ) : (
              buildSentence(stats)
            )}
          </p>

          <div className="flex flex-wrap gap-4">
            <button
              onClick={onResume}
              className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors shadow-lg shadow-blue-600/50"
            >
              <PlayCircle className="w-5 h-5" />
              Resume Learning
            </button>

            <button
              onClick={onSchedule}
              className="flex items-center gap-2 px-6 py-3 bg-white/10 backdrop-blur-sm text-white rounded-xl font-semibold hover:bg-white/20 transition-colors border border-white/20"
            >
              <Calendar className="w-5 h-5" />
              View Schedule
            </button>
          </div>
        </div>

        {/* ── Right ── */}
        <div className="relative">
          <div className="rounded-2xl overflow-hidden shadow-2xl">
            {img.img1 ? (
              <img
                src={img.img1}
                alt="Student learning"
                className="w-full h-auto object-cover"
                onError={e => {
                  e.currentTarget.src =
                    'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800&q=80';
                }}
              />
            ) : (
              <div className="w-full h-64 bg-white/5 rounded-2xl flex items-center justify-center">
                <span className="text-white/40 text-sm">Loading image…</span>
              </div>
            )}
          </div>

          {/* Floating progress card */}
          <div className="absolute -bottom-4 -left-4 bg-white rounded-xl p-4 shadow-xl">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <span className="text-2xl">🎯</span>
              </div>
              <div>
                <p className="text-xs text-gray-600">Progress</p>
                {loading ? (
                  <div className="h-5 w-10 bg-gray-200 rounded animate-pulse mt-0.5" />
                ) : (
                  <p className="text-lg font-bold text-gray-900">
                    {progress >= 0 ? `${Math.round(progress)}%` : '—'}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default HeroSection;