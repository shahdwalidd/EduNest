
import type { FC } from 'react';
import { useState } from 'react';
import type { Project, ProjectTab, AwardedBadge } from '../../../types/viewStudent.types';


const PRIMARY = '#0f5e8b';

interface ProjectsListProps {
  projects:              Project[];
  projectsPage:          number;
  projectsTotalPages:    number;
  onProjectsPageChange:  (page: number) => void;
  awardedBadges?:        AwardedBadge[];
}

// ── Status ────────────────────────────────────────────────────────────────────
const STATUS_MAP: Record<string, { label: string; bg: string; text: string; dot: string }> = {
  SUBMITTED:        { label: 'Pending Review', bg: '#fffbeb', text: '#b45309', dot: '#f59e0b' },
  'Pending Review': { label: 'Pending Review', bg: '#fffbeb', text: '#b45309', dot: '#f59e0b' },
  GRADED:           { label: 'Approved',       bg: '#f0fdf4', text: '#15803d', dot: '#22c55e' },
  Approved:         { label: 'Approved',       bg: '#f0fdf4', text: '#15803d', dot: '#22c55e' },
  REJECTED:         { label: 'Rejected',       bg: '#fff1f2', text: '#be123c', dot: '#f43f5e' },
  Rejected:         { label: 'Rejected',       bg: '#fff1f2', text: '#be123c', dot: '#f43f5e' },
};
const getStatus = (raw: string) =>
  STATUS_MAP[raw] ?? { label: raw, bg: '#f9fafb', text: '#6b7280', dot: '#9ca3af' };

const formatDate = (d?: string | null) => {
  if (!d) return 'N/A';
  try { return new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }); }
  catch { return d; }
};

// ── Badge categories cycle ────────────────────────────────────────────────────
// Natural, distinct palette – no glow/gradients
const BADGE_CATS = [
  { emoji: '🏆', color: '#d97706', bg: '#fef3c7', border: '#fcd34d', label: 'Achievement'   },
  { emoji: '⚡', color: '#2563eb', bg: '#eff6ff', border: '#93c5fd', label: 'Performance'   },
  { emoji: '🔥', color: '#dc2626', bg: '#fef2f2', border: '#fca5a5', label: 'Consistency'   },
  { emoji: '🧩', color: '#7c3aed', bg: '#f5f3ff', border: '#c4b5fd', label: 'Problem Solving'},
  { emoji: '🎨', color: '#db2777', bg: '#fdf2f8', border: '#f9a8d4', label: 'Creativity'    },
  { emoji: '👑', color: '#b45309', bg: '#fffbeb', border: '#fcd34d', label: 'Leadership'    },
  { emoji: '🤝', color: '#059669', bg: '#f0fdf4', border: '#6ee7b7', label: 'Community'     },
  { emoji: '⭐', color: '#4f46e5', bg: '#eef2ff', border: '#a5b4fc', label: 'Recognition'   },
];
const getCat = (idx: number) => BADGE_CATS[idx % BADGE_CATS.length];

// ── Pagination ────────────────────────────────────────────────────────────────
const Pagination: FC<{ current: number; total: number; onChange: (p: number) => void }> = ({
  current, total, onChange,
}) => {
  if (total <= 1) return null;
  return (
    <div className="flex items-center justify-center gap-1.5 pt-5">
      <button onClick={() => onChange(current - 1)} disabled={current === 0}
        className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 text-gray-400 hover:text-gray-700 hover:border-gray-300 disabled:opacity-30 disabled:cursor-not-allowed transition text-sm">‹</button>
      {Array.from({ length: total }).map((_, i) => (
        <button key={i} onClick={() => onChange(i)}
          className="w-8 h-8 flex items-center justify-center rounded-lg text-sm font-semibold transition"
          style={i === current ? { backgroundColor: PRIMARY, color: '#fff' } : { border: '1px solid #e5e7eb', color: '#6b7280' }}
        >{i + 1}</button>
      ))}
      <button onClick={() => onChange(current + 1)} disabled={current === total - 1}
        className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 text-gray-400 hover:text-gray-700 hover:border-gray-300 disabled:opacity-30 disabled:cursor-not-allowed transition text-sm">›</button>
    </div>
  );
};

const BADGES_PER_PAGE = 2;

// ── Main ──────────────────────────────────────────────────────────────────────
const ProjectsList: FC<ProjectsListProps> = ({
  projects,
  projectsPage, projectsTotalPages = 1, onProjectsPageChange,
  awardedBadges = [],
}) => {
  const [activeTab,  setActiveTab ] = useState<ProjectTab>('projects');
  const [badgesPage, setBadgesPage] = useState(0);
  const badgesTotalPages = Math.max(1, Math.ceil(awardedBadges.length / BADGES_PER_PAGE));
  const visibleBadges    = awardedBadges.slice(
    badgesPage * BADGES_PER_PAGE,
    (badgesPage + 1) * BADGES_PER_PAGE
  );

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">

      {/* ── Tabs ── */}
      <div className="flex border-b border-gray-100">
        {(['projects', 'badges'] as ProjectTab[]).map((tab) => {
          const count = tab === 'projects' ? projects.length : awardedBadges.length;
          const active = activeTab === tab;
          return (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className={`flex-1 px-5 py-4 text-sm font-semibold transition-colors relative flex items-center justify-center gap-2 ${
                active ? 'text-gray-900' : 'text-gray-400 hover:text-gray-600'
              }`}>
              {tab === 'projects' ? '📂 Projects' : '🏅 Badges'}
              {/* Count pill */}
              <span
                className="px-2 py-0.5 rounded-full text-[11px] font-bold"
                style={
                  active
                    ? { backgroundColor: PRIMARY, color: '#fff' }
                    : { backgroundColor: '#f3f4f6', color: '#6b7280' }
                }
              >{count}</span>
              {active && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 rounded-t" style={{ backgroundColor: PRIMARY }} />
              )}
            </button>
          );
        })}
      </div>

      <div className="p-5">

        {/* ── Projects Tab ── */}
        {activeTab === 'projects' && (
          projects.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-14 text-center">
              <div className="w-14 h-14 bg-gray-50 rounded-2xl flex items-center justify-center text-2xl mb-3">📂</div>
              <p className="text-sm font-medium text-gray-400">No projects submitted yet.</p>
            </div>
          ) : (
            <>
              <div className="space-y-3">
                {projects.map((project) => {
                  const s       = getStatus(project.status);
                  const hasScore = project.finalScore != null || project.rawScore != null;
                  const hasLink  = !!project.submissionLink;
                  const hasFiles = (project.filesCount ?? 0) > 0;

                  return (
                    <div key={project.projectSubmissionId}
                      className="border border-gray-100 rounded-xl p-4 hover:border-gray-200 hover:shadow-sm transition-all duration-150 bg-white">

                      {/* Top */}
                      <div className="flex items-start justify-between gap-3 mb-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap mb-1">
                            <h4 className="text-sm font-bold text-gray-900">{project.projectTitle}</h4>
                            {/* Status pill */}
                            <span
                              className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-semibold border"
                              style={{ background: s.bg, color: s.text, borderColor: s.dot + '55' }}
                            >
                              <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: s.dot }} />
                              {s.label}
                            </span>
                          </div>
                          <p className="text-xs text-gray-400">
                            <span className="font-medium text-gray-500">{project.mentorshipTitle}</span> · Submitted {formatDate(project.submittedAt)}
                          </p>
                        </div>
                        {hasScore && (
                          <div className="shrink-0 text-center px-3 py-1.5 rounded-xl border"
                            style={{ borderColor: PRIMARY + '30', background: PRIMARY + '08' }}>
                            <p className="text-[10px] font-semibold uppercase tracking-wide" style={{ color: PRIMARY }}>Score</p>
                            <p className="text-xl font-black" style={{ color: PRIMARY }}>
                              {project.finalScore ?? project.rawScore}
                            </p>
                          </div>
                        )}
                      </div>

                      {/* ── Submission: link OR files ── */}
                      {(hasLink || hasFiles) && (
                        <div className="flex flex-wrap gap-2 mb-3">
                          {hasLink && (
                            <a
                              href={project.submissionLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-white transition-opacity hover:opacity-80"
                              style={{ backgroundColor: PRIMARY }}
                            >
                              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                  d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                              </svg>
                              View Submission Link
                            </a>
                          )}
                          {hasFiles && (
                            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border border-gray-200 text-gray-600 bg-gray-50">
                              <svg className="w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                              </svg>
                              {project.filesCount} {project.filesCount === 1 ? 'file' : 'files'} submitted
                            </div>
                          )}
                        </div>
                      )}

                      {/* No submission yet */}
                      {!hasLink && !hasFiles && (
                        <div className="mb-3 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs text-gray-400 border border-dashed border-gray-200 bg-gray-50">
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                              d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                          </svg>
                          No submission yet
                        </div>
                      )}

                      {/* Feedback */}
                      {project.feedback && (
                        <div className="px-3 py-2.5 bg-blue-50 border-l-4 border-blue-400 rounded-r-lg">
                          <p className="text-xs text-blue-700">
                            <span className="font-bold">Feedback: </span>{project.feedback}
                          </p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
              <Pagination current={projectsPage} total={projectsTotalPages} onChange={onProjectsPageChange} />
            </>
          )
        )}

        {/* ── Badges Tab ── */}
        {activeTab === 'badges' && (
          awardedBadges.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-14 text-center">
              <div className="w-14 h-14 bg-amber-50 rounded-2xl flex items-center justify-center text-2xl mb-3">🏆</div>
              <p className="text-sm font-medium text-gray-400">No badges awarded yet.</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {visibleBadges.map((badge, idx) => {
                  const globalIdx = badgesPage * BADGES_PER_PAGE + idx;
                  const cat       = getCat(globalIdx);

                  return (
                    <div key={badge.id}
                      className="flex items-center gap-3 p-3.5 rounded-xl border bg-white hover:shadow-sm transition-all duration-150"
                      style={{ borderColor: cat.border, borderLeftWidth: '3px', borderLeftColor: cat.color }}
                    >
                      {/* Icon */}
                      <div
                        className="w-11 h-11 rounded-xl flex items-center justify-center text-xl flex-shrink-0 border"
                        style={{ background: cat.bg, borderColor: cat.border }}
                      >
                        {cat.emoji}
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-gray-900 truncate leading-tight">{badge.badgeTitle}</p>
                        <p className="text-[11px] font-medium mt-0.5" style={{ color: cat.color }}>{cat.label}</p>
                        <p className="text-[11px] text-gray-400 mt-0.5">{formatDate(badge.awardedAt)}</p>
                        {badge.note && (
                          <p className="text-[11px] text-gray-500 mt-0.5 italic truncate">"{badge.note}"</p>
                        )}
                      </div>

                      {/* Points */}
                      <div
                        className="shrink-0 flex flex-col items-center justify-center w-11 h-11 rounded-xl border font-bold"
                        style={{ background: cat.bg, borderColor: cat.border, color: cat.color }}
                      >
                        <span className="text-base leading-none">⭐</span>
                        <span className="text-[11px] leading-tight mt-0.5">{badge.badgePoints}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
              <Pagination current={badgesPage} total={badgesTotalPages} onChange={setBadgesPage} />
            </>
          )
        )}
      </div>
    </div>
  );
};

export default ProjectsList;