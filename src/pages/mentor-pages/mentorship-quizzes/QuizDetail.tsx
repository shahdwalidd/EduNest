import type { FC } from 'react';
import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FileText, CheckCircle, Clock, XCircle, Search, Filter, HelpCircle, Plus, ArrowLeft, Edit2 } from 'lucide-react';

import DashLayout from '../../../components/layout/Dash-layout';
import type { QuizOverviewResponse, Submission } from '../../../services/mentorshipsContent/quiz';
import { getQuizOverview } from '../../../services/mentorshipsContent/quiz';
import { useAuthStore } from '../../../store/authStore';
import toast from 'react-hot-toast';
import EditQuizModal from './components/EditQuizModal';

const QuizDetail: FC = () => {
    const { id: mentorshipId, quizId } = useParams<{ id: string, quizId: string }>();
    const navigate = useNavigate();
    const token = useAuthStore((s) => s.token);

    const [data, setData] = useState<QuizOverviewResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Edit modal
    const [editQuizId, setEditQuizId] = useState<number | null>(null);
    const [refreshTrigger, setRefreshTrigger] = useState(0);

    const [searchQuery, setSearchQuery] = useState('');
    const [filterStatus, setFilterStatus] = useState<string>('all');
    const [showFilter, setShowFilter] = useState(false);

    const [page] = useState(0);
    const size = 10;

    useEffect(() => {
        if (!token || !quizId) return;

        const loadQuizDetails = async () => {
            try {
                setLoading(true);
                setError(null);
                const responseData = await getQuizOverview(Number(quizId), page, size);
                setData(responseData);
            } catch (err: unknown) {
                const message = err instanceof Error ? err.message : 'Failed to load quiz details';
                setError(message);
                toast.error(message);
            } finally {
                setLoading(false);
            }
        };

        loadQuizDetails();
    }, [quizId, token, page, refreshTrigger]);

    if (loading && !data) {
        return (
            <DashLayout pageTitle="Quiz Detail">
                <div className="flex items-center justify-center h-[calc(100vh-100px)]">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                </div>
            </DashLayout>
        );
    }

    if (error && !data) {
        return (
            <DashLayout pageTitle="Quiz Detail">
                <div className="flex flex-col items-center justify-center h-[50vh] px-4">
                    <div className="bg-red-50 text-red-600 p-4 rounded-lg flex items-center gap-3">
                        <FileText size={24} />
                        <p>{error || 'Failed to find quiz details'}</p>
                    </div>
                </div>
            </DashLayout>
        );
    }

    const { quizStatistics: stats, submissions = [] } = data || {};

    const triggerRefresh = () => setRefreshTrigger((prev) => prev + 1);

    const openEdit = () => {
        if (!quizId) return;
        setEditQuizId(Number(quizId));
    };

    const filteredSubmissions = submissions.filter((sub: Submission) => {
        const matchesSearch = sub.studentName.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesFilter = filterStatus === 'all' || sub.status === filterStatus;
        return matchesSearch && matchesFilter;
    });

    const passes = submissions.filter(s => s.status === 'Passed').length;
    const totalSubmits = passes + submissions.filter(s => s.status === 'Failed').length;
    const passRate = totalSubmits > 0 ? Math.round((passes / totalSubmits) * 100) : 0;

    return (
        <DashLayout pageTitle={`My Mentorships / Design Systems / Quizzes / ${stats?.quizTitle || 'Quiz'}`}>
            <div className="px-4 sm:px-6 py-6 max-w-7xl mx-auto space-y-6 bg-white rounded-xl shadow-sm border border-gray-100 min-h-[calc(100vh-120px)] w-full min-w-0 overflow-hidden">

                {/* Header Section */}
                <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center border-b border-gray-100 pb-6 gap-6 w-full min-w-0">
                    <div className="space-y-3 min-w-0 flex-1 w-full">
                        {/* Title & Back Button */}
                        <div className="flex items-start gap-2 text-gray-600 w-full min-w-0  ">
                            <button 
                                onClick={() => navigate(-1)} 
                                className="mt-2.5 hover:text-gray-900 transition-colors shrink-0"
                                aria-label="Go back"
                            >
                                <ArrowLeft  size={22} />
                            </button>
                            <div className="min-w-0 flex-1">
                                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 break-words leading-tight">
                                    {stats?.quizTitle || 'Untitled Quiz'}
                                </h1>
                                {/* Description Box placed perfectly below title */}
                                {'description' in (stats ?? {}) ? (
                                    (stats as unknown as { description?: string }).description ? (
                                        <p className="mt-2 text-base text-gray-500 break-words leading-relaxed max-w-3xl">
                                            {(stats as unknown as { description?: string }).description}
                                        </p>
                                    ) : null
                                ) : null}
                            </div>
                        </div>

                        {/* Status and Badges */}
                        <div className="flex flex-wrap items-center gap-3 pt-1">
                            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium ${
                                stats?.status === 'PUBLISHED'
                                    ? 'bg-green-100 text-green-700'
                                    : 'bg-gray-100 text-gray-600'
                            }`}>
                                {stats?.status === 'PUBLISHED' ? <CheckCircle size={14} /> : <Clock size={14} />}
                                {stats?.status === 'PUBLISHED' ? 'Published' : 'Draft'}
                            </span>
                            
                            <span className="flex items-center gap-1.5 text-orange-500 bg-orange-50 px-2.5 py-1 rounded-lg text-sm font-medium">
                                <FileText size={16} />
                                Quiz
                            </span>
                            
                            <span className="flex items-center gap-1.5 text-sm text-gray-500 font-medium bg-gray-50 px-2.5 py-1 rounded-lg">
                                <HelpCircle size={16} />
                                {stats?.totalQuestions || 0} Questions
                            </span>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-wrap sm:flex-nowrap items-center gap-3 w-full lg:w-auto shrink-0">
                        <button
                            onClick={openEdit}
                            className="flex items-center justify-center gap-2 flex-1 sm:flex-none px-4 py-2.5 bg-white text-[#0f5e8b] border border-[#d1e9f3] rounded-xl font-medium hover:bg-blue-50 transition-colors shadow-sm"
                            title="Edit Quiz"
                        >
                            <Edit2 size={18} />
                            Edit
                        </button>

                        <button
                            onClick={() => navigate(`/mentor/mentorships/${mentorshipId}/quizzes/${quizId}/questions`)}
                            className="flex items-center justify-center gap-2 flex-1 sm:flex-none px-5 py-2.5 bg-[#0f5e8b] text-white rounded-xl font-medium hover:bg-[#0a4a6e] transition-colors shadow-sm whitespace-nowrap"
                        >
                            <Plus size={20} />
                            Create Questions
                        </button>
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 md:flex md:flex-wrap gap-6 md:gap-12 py-4 border-b border-gray-100 w-full">
                    <div className="min-w-[120px]">
                        <p className="text-sm font-medium text-gray-500 mb-1">Total students</p>
                        <h3 className="text-2xl font-bold text-gray-900">{stats?.totalStudents || 0}</h3>
                    </div>
                    <div className="md:pl-12 md:border-l border-gray-100 min-w-[120px]">
                        <p className="text-sm font-medium text-gray-500 mb-1">Submissions</p>
                        <h3 className="text-2xl font-bold text-gray-900">{stats?.totalSubmissions || 0}</h3>
                    </div>
                    <div className="md:pl-12 md:border-l border-gray-100 min-w-[120px]">
                        <p className="text-sm font-medium text-gray-500 mb-1">Avg Score</p>
                        <h3 className="text-2xl font-bold text-gray-900">{stats?.averageScore || 0}/{stats?.totalPoints || 10}</h3>
                    </div>
                    <div className="md:pl-12 md:border-l border-gray-100 min-w-[120px]">
                        <p className="text-sm font-medium text-gray-500 mb-1">Pass Rate</p>
                        <h3 className="text-2xl font-bold text-gray-900">{passRate} %</h3>
                    </div>
                </div>

                {/* Search Bar & Filter */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between pt-4 gap-4 w-full">
                    <div className="px-4 py-2 bg-gray-50 rounded-xl flex items-center gap-3 w-full sm:w-72 border border-gray-100 focus-within:border-gray-200 transition-colors">
                        <Search className="text-gray-400 shrink-0" size={18} />
                        <input
                            type="text"
                            placeholder="Search student..."
                            className="flex-1 outline-none border-none text-gray-700 bg-transparent text-sm w-full"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <div className="relative self-end sm:self-auto">
                        <button 
                            onClick={() => setShowFilter(!showFilter)}
                            className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors bg-white shadow-sm"
                        >
                            Filter
                            {filterStatus !== 'all' && (
                                <span className="bg-blue-100 text-blue-600 px-1.5 py-0.5 rounded text-xs font-semibold">1</span>
                            )}
                            <Filter size={16} />
                        </button>
                        {showFilter && (
                            <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-100 py-2 z-10">
                                <button className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 ${filterStatus === 'all' ? 'text-[#0f5e8b] font-medium bg-gray-50' : 'text-gray-700'}`} onClick={() => { setFilterStatus('all'); setShowFilter(false); }}>All Status</button>
                                <button className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 ${filterStatus === 'Passed' ? 'text-[#0f5e8b] font-medium bg-gray-50' : 'text-gray-700'}`} onClick={() => { setFilterStatus('Passed'); setShowFilter(false); }}>Passed</button>
                                <button className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 ${filterStatus === 'Failed' ? 'text-[#0f5e8b] font-medium bg-gray-50' : 'text-gray-700'}`} onClick={() => { setFilterStatus('Failed'); setShowFilter(false); }}>Failed</button>
                                <button className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 ${filterStatus === 'Not Submitted' ? 'text-[#0f5e8b] font-medium bg-gray-50' : 'text-gray-700'}`} onClick={() => { setFilterStatus('Not Submitted'); setShowFilter(false); }}>Not Submitted</button>
                            </div>
                        )}
                    </div>
                </div>

                {/* Students Table */}
                <div className="overflow-x-auto rounded-xl border border-gray-100 w-full">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider">
                                <th className="px-6 py-4 font-semibold rounded-tl-xl rounded-bl-xl">STUDENTS</th>
                                <th className="px-6 py-4 font-semibold">SCORE</th>
                                <th className="px-6 py-4 font-semibold rounded-tr-xl rounded-br-xl">STATUS</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 bg-white">
                            {filteredSubmissions.length === 0 ? (
                                <tr>
                                    <td colSpan={3} className="px-6 py-12 text-center text-gray-500">
                                        No submissions found.
                                    </td>
                                </tr>
                            ) : (
                                filteredSubmissions.map((sub: Submission, index: number) => (
                                    <tr key={sub.id || index} className="hover:bg-gray-50/50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3 min-w-0">
                                                <div className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden shrink-0">
                                                    <img 
                                                        src={`https://ui-avatars.com/api/?name=${encodeURIComponent(sub.studentName)}&background=random`} 
                                                        alt={sub.studentName} 
                                                        className="w-full h-full object-cover" 
                                                    />
                                                </div>
                                                <span className="font-semibold text-gray-900 truncate">{sub.studentName}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            {sub.status === 'Not Submitted' ? (
                                                <span className="text-gray-400 font-bold">—</span>
                                            ) : (
                                                <span className="inline-flex px-2 py-1 rounded text-sm font-bold bg-orange-500 text-white">
                                                    {sub.score}/{stats?.totalPoints || 10}
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4">
                                            {sub.status === 'Passed' && (
                                                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-green-50 text-green-600 rounded-full text-sm font-medium">
                                                    <CheckCircle size={14} /> Passed
                                                </span>
                                            )}
                                            {sub.status === 'Failed' && (
                                                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-red-50 text-red-500 rounded-full text-sm font-medium">
                                                    <XCircle size={14} /> Failed
                                                </span>
                                            )}
                                            {sub.status === 'Not Submitted' && (
                                                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-gray-100 text-gray-500 rounded-full text-sm font-medium">
                                                    <Clock size={14} /> Not Submitted
                                                </span>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

            </div>

            <EditQuizModal
                isOpen={!!editQuizId}
                onClose={() => setEditQuizId(null)}
                quizId={editQuizId}
                onSuccess={triggerRefresh}
            />
        </DashLayout>
    );
};

export default QuizDetail;

