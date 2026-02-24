import type { FC } from 'react';
import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Star, Users, Book, FileText, Activity } from 'lucide-react';
import DashLayout from '../../components/layout/Dash-layout';
import { getMentorshipDetail, getMentorshipStats, getTopLearners, getMentorshipReviews } from '../../services/dashboardService';
import { useAuthStore } from '../../store/authStore';
import type { MentorshipApiResponse } from '../../services/dashboardService';

const MentorshipDetail: FC = () => {
  const params = useParams<{ mentorshipId?: string; id?: string }>();
  const mentorshipId = params.mentorshipId ?? params.id;
  const navigate = useNavigate();
  const token = useAuthStore((s) => s.token);
  
  interface Learner { name?: string; userName?: string; progress?: number | string; points?: number | string }
  interface Review { userName?: string; name?: string; rating?: number; comment?: string; message?: string }
  interface Student { name?: string; fullName?: string; email?: string; status?: string; progress?: number | string }

  const [mentorship, setMentorship] = useState<MentorshipApiResponse | null>(null);
  const [stats, setStats] = useState<Record<string, unknown> | null>(null);
  const [topLearners, setTopLearners] = useState<Learner[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) {
      navigate('/login');
      return;
    }

    if (!mentorshipId) {
      setError('Mentorship ID not provided');
      setLoading(false);
      return;
    }

    const loadMentorshipDetail = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await getMentorshipDetail(mentorshipId);
        setMentorship(data);

        // try getting stats, top learners and reviews (fail silently)
        try {
          const s = await getMentorshipStats(mentorshipId);
          setStats(s as Record<string, unknown>);
        } catch (e) {
          console.warn('Could not load mentorship stats', e);
        }

        try {
          const learners = await getTopLearners(String(mentorshipId));
          setTopLearners(Array.isArray(learners) ? learners : []);
        } catch (e) {
          console.warn('Could not load top learners', e);
        }

        try {
          const rev = await getMentorshipReviews(String(mentorshipId));
          setReviews(Array.isArray(rev) ? rev : []);
        } catch (e) {
          console.warn('Could not load reviews', e);
        }

      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to load mentorship details';
        setError(message);
        console.error('Error loading mentorship:', err);
      } finally {
        setLoading(false);
      }
    };

    loadMentorshipDetail();
  }, [mentorshipId, token, navigate]);

  const handleEditClick = () => {
    if (!mentorshipId) return;
    navigate(`/mentor/mentorships/${mentorshipId}/edit`);
  };

  if (loading) {
    return (
      <DashLayout pageTitle="Mentorship Details">
        <div className="flex items-center justify-center h-screen">
          <div className="text-gray-500">Loading...</div>
        </div>
      </DashLayout>
    );
  }

  if (error || !mentorship) {
    return (
      <DashLayout pageTitle="Mentorship Details">
        <div className="flex items-center justify-center h-screen">
          <div className="text-red-500">{error || 'Mentorship not found'}</div>
        </div>
      </DashLayout>
    );
  }

  // derive counts (fallback to stats or mentorship fields)
  const totalLessons = stats?.['lessons'] ?? mentorship?.lessonsCount ?? 0;
  const totalQuizzes = stats?.['quizzes'] ?? mentorship?.quizzesCount ?? 0;
  const totalAssignments = stats?.['assignments'] ?? mentorship?.assignmentsCount ?? 0;
  const totalSessions = stats?.['sessions'] ?? mentorship?.sessionsCount ?? 0;

  const mentorshipRecord = mentorship as unknown as Record<string, unknown> | null;
  const rawStudents = (mentorshipRecord?.students ?? mentorshipRecord?.enrolledUsers) as unknown;
  const students: Student[] = Array.isArray(rawStudents) ? (rawStudents as Student[]) : [];

  return (
    <DashLayout pageTitle="My Mentorships / Details">
      <div className="px-6 py-6 max-w-7xl mx-auto">
        <div className="flex items-start gap-6 mb-6">
          <div className="flex-1">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="w-full">
                <h1 className="text-2xl sm:text-4xl font-bold text-gray-900 break-words">{mentorship.title}</h1>
                <div className="flex items-center gap-3 mt-3 flex-wrap">
                  <span className="px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">{(mentorship.status ?? 'Active').toString()}</span>
                  <p className="text-sm text-gray-500">My Mentorships</p>
                </div>
              </div>

           <div className="flex items-center shrink-0 gap-4 w-full sm:w-auto">

  {/* Overview */}
  <button
    onClick={() => navigate('/mentor/mentorships')}
    className="flex items-center gap-3 w-full sm:w-auto px-5 py-3 
               bg-white hover:bg-gray-200 
               rounded-xl text-sm font-medium
               border-l-4 border-gray-700 transition"
  >
    <i className="fa-regular fa-pen-to-square text-lg text-gray-700"></i>
    Overview
  </button>

  {/* Create Content */}
  <button
    onClick={handleEditClick}
    className="flex items-center gap-3 w-full sm:w-auto px-5 py-3 
               bg-white hover:bg-gray-200 
               rounded-xl text-sm font-medium
               border-l-4 border-gray-700 transition"
  >
    <i className="fa-regular fa-file-lines text-lg text-gray-700"></i>
    Create Content
  </button>



</div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
              <div className="bg-white rounded-lg p-4 shadow flex items-center gap-3">
                <div className="p-3 bg-blue-50 rounded-lg"><Book className="text-blue-500" /></div>
                <div>
                  <p className="text-xs text-gray-500">Total Lessons</p>
                  <p className="text-xl font-bold">{totalLessons}</p>
                </div>
              </div>

              <div className="bg-white rounded-lg p-4 shadow flex items-center gap-3">
                <div className="p-3 bg-blue-50 rounded-lg"><FileText className="text-blue-500" /></div>
                <div>
                  <p className="text-xs text-gray-500">Total Quizes</p>
                  <p className="text-xl font-bold">{totalQuizzes}</p>
                </div>
              </div>

              <div className="bg-white rounded-lg p-4 shadow flex items-center gap-3">
                <div className="p-3 bg-blue-50 rounded-lg"><Activity className="text-blue-500" /></div>
                <div>
                  <p className="text-xs text-gray-500">Total Assignments</p>
                  <p className="text-xl font-bold">{totalAssignments}</p>
                </div>
              </div>

              <div className="bg-white rounded-lg p-4 shadow flex items-center gap-3">
                <div className="p-3 bg-blue-50 rounded-lg"><Users className="text-blue-500" /></div>
                <div>
                  <p className="text-xs text-gray-500">Total Sessions</p>
                  <p className="text-xl font-bold">{totalSessions}</p>
                </div>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 bg-white rounded-lg shadow p-4">
                <h3 className="font-semibold text-gray-900 mb-4">Reviews on this Mentorship</h3>
                <div className="divide-y divide-gray-100 max-h-44 md:max-h-56 overflow-y-auto pr-2">
                  {reviews.length === 0 ? (
                    <p className="text-sm text-gray-500">No reviews yet</p>
                  ) : (
                    reviews.map((r: Review, idx: number) => (
                      <div key={idx} className="py-3">
                        <div className="flex items-start gap-3">
                          <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">{(r.userName || 'U').charAt(0)}</div>
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="font-semibold text-sm">{r.userName ?? r.name ?? 'Anonymous'}</p>
                              <div className="text-xs text-yellow-500 flex items-center gap-1"><Star className="w-3 h-3" />{r.rating ?? 5}</div>
                            </div>
                            <p className="text-xs text-gray-500">{r.comment ?? r.message ?? ''}</p>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-gray-900">Top learner</h3>
                  <button className="text-xs text-blue-500">View all</button>
                </div>
                <div className="space-y-3">
                  {topLearners.length === 0 ? (
                    <p className="text-sm text-gray-500">No learners data</p>
                  ) : (
                    topLearners.slice(0,3).map((t: Learner, i: number) => (
                      <div key={i} className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center">{(t.name||'T').charAt(0)}</div>
                          <div>
                            <p className="text-sm font-semibold">{t.name ?? t.userName}</p>
                            <p className="text-xs text-gray-400">Progress: {t.progress ?? '—'}</p>
                          </div>
                        </div>
                        <div className="text-xs text-yellow-500">{t.points ?? ''}</div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* Students table */}
            <div className="mt-6 bg-white rounded-lg shadow p-4">
              <h3 className="font-semibold mb-4">Students on This Mentorship</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="text-xs text-gray-400">
                    <tr>
                      <th className="py-3">Student</th>
                      <th className="py-3">Status</th>
                      <th className="py-3">Progress</th>
                      <th className="py-3">...</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 text-sm">
                    {Array.isArray(students) && students.length > 0 ? (
                      students.map((s: Student, idx: number) => (
                        <tr key={idx} className="odd:bg-white even:bg-gray-50">
                          <td className="py-3">{s.name ?? s.fullName ?? s.email ?? 'Student'}</td>
                          <td className="py-3">
                            <span className={`px-3 py-1 rounded-full text-xs ${s.status === 'completed' ? 'bg-green-100 text-green-800' : s.status === 'in_progress' ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100 text-gray-800'}`}>
                              {s.status ?? 'In progress'}
                            </span>
                          </td>
                          <td className="py-3">{s.progress ? `${s.progress} %` : '—'}</td>
                          <td className="py-3">...</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={4} className="py-6 text-center text-sm text-gray-500">No students enrolled</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashLayout>
  );
};

export default MentorshipDetail;
