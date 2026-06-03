import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import DashLayout from '../../../components/layout/Dash-layout';
import toast from 'react-hot-toast';
import { getProjectStatistics, getProjectDashboard, gradeProjectSubmission, type ProjectStatistics, type TaskSubmission, type ProjectResponse } from '../../../services/projectService';
import { Download, CheckCircle, Clock, AlertCircle, Award, ArrowLeft, Edit } from 'lucide-react';
import { EditProjectModal } from './components/ProjectModals';

const ProjectDetail: React.FC = () => {
  const { id, projectId } = useParams<{ id: string, projectId: string }>();
  const navigate = useNavigate();
  const [stats, setStats] = useState<ProjectStatistics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(0);

  // Edit modal state
  const [projectToEdit, setProjectToEdit] = useState<ProjectResponse | null>(null);
  const [isEditOpen, setIsEditOpen] = useState(false);

  // Modal state
  const [isGradeModalOpen, setIsGradeModalOpen] = useState(false);
  const [activeSubmission, setActiveSubmission] = useState<TaskSubmission | null>(null);
  const [score, setScore] = useState<number | string>('');
  const [feedback, setFeedback] = useState('');
  const [isSubmittingGrade, setIsSubmittingGrade] = useState(false);

  const fetchStats = async () => {
    if (!projectId) return;
    try {
      setLoading(true);
      const res = await getProjectStatistics(projectId, { page, size: 10 });
      setStats(res.projectStatistics);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to load project details';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, [projectId, page]);

  const handleBackToProjects = () => {
    navigate(`/mentor/mentorships/${id}/projects`);
  };

  const openGradeModal = (submission: TaskSubmission) => {
    setActiveSubmission(submission);
    setScore(submission.finalScore ?? submission.rawScore ?? '');
    setFeedback(submission.feedback || '');
    setIsGradeModalOpen(true);
  };

  const openEditModal = async () => {
    if (!id || !projectId) return;
    try {
      const res = await getProjectDashboard(id, { page: 0, size: 200 });
      const projects = res.fullDashboard?.projectResponsePageResponse?.content || [];
      const found = projects.find((it: { project: ProjectResponse }) => it.project.id === Number(projectId));
      if (found) {
        setProjectToEdit(found.project);
        setIsEditOpen(true);
      } else {
        toast.error('Failed to load full project data for editing');
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to load project for edit';
      toast.error(message);
    }
  };

  const closeGradeModal = () => {
    setIsGradeModalOpen(false);
    setActiveSubmission(null);
    setScore('');
    setFeedback('');
  };

  const submitGrade = async () => {
    if (!activeSubmission) return;
    try {
      setIsSubmittingGrade(true);
      await gradeProjectSubmission(activeSubmission.submissionId, {
        score: Number(score),
        feedback
      });
      toast.success('Grade submitted successfully');
      closeGradeModal();
      fetchStats();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to submit grade';
      toast.error(message);
    } finally {
      setIsSubmittingGrade(false);
    }
  };

  if (loading && !stats) {
    return (
      <DashLayout pageTitle={`Dashboard / Projects / Details`}>
        <div className="flex h-[50vh] items-center justify-center p-4">
          <p className="text-gray-500 text-center">Loading details...</p>
        </div>
      </DashLayout>
    );
  }

  if (error) {
    return (
      <DashLayout pageTitle={`Dashboard / Projects / Details`}>
        <div className="flex h-[50vh] items-center justify-center text-red-500 p-4 text-center">
          <p>{error}</p>
        </div>
      </DashLayout>
    );
  }

  const submissionsPage = stats?.taskSubmissionResponsePageResponse;
  const submissionsList = submissionsPage?.content || [];

  return (
    <DashLayout pageTitle={`Dashboard / Projects / ${stats?.projectTitle || 'Details'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
        
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="min-w-0 flex-1">
            <div className="flex items-start gap-2 cursor-pointer text-gray-600 hover:text-gray-900" onClick={handleBackToProjects}>
              <ArrowLeft size={20} className="mt-2.5 flex-shrink-0" />
              <h1 className="break-all text-xl sm:text-2xl font-bold text-gray-900 break-words whitespace-normal leading-tight">
                {stats?.projectTitle || 'Project Details'}
              </h1>
            </div>
            <p className="text-sm text-gray-500 mt-1 pl-7">Review student submissions and statistics</p>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto flex-shrink-0">
            <button
              type="button"
              onClick={openEditModal}
              className="flex items-center justify-center gap-2 w-full sm:w-auto px-4 py-2 text-sm font-medium text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors"
            >
              <Edit size={16} />
              Edit
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm flex items-center justify-between min-w-0">
            <div className="min-w-0 w-full">
              <p className="text-sm text-gray-500 font-medium truncate">Total Submissions</p>
              <h3 className="text-2xl font-bold mt-1 text-gray-900 truncate">{stats?.totalSubmissions || 0}</h3>
            </div>
          </div>
          <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm flex items-center justify-between min-w-0">
            <div className="min-w-0 w-full">
              <p className="text-sm text-gray-500 font-medium truncate">Pending Review</p>
              <h3 className="text-2xl font-bold mt-1 text-yellow-600 truncate">{stats?.pendingReview || 0}</h3>
            </div>
          </div>
          <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm flex items-center justify-between min-w-0">
            <div className="min-w-0 w-full">
              <p className="text-sm text-gray-500 font-medium truncate">Total Points</p>
              <h3 className="text-2xl font-bold mt-1 text-gray-900 truncate">{stats?.totalPoints || 0} pts</h3>
            </div>
          </div>
          <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm flex items-center justify-between min-w-0">
            <div className="min-w-0 w-full">
              <p className="text-sm text-gray-500 font-medium truncate">Deadline</p>
              <h3 className="text-base sm:text-lg font-bold mt-2 text-gray-900 break-words">
                {stats?.deadLine ? new Date(stats.deadLine).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : 'No Deadline'}
              </h3>
            </div>
          </div>
        </div>

        {/* Submissions Table Container */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden mt-6">
          <div className="p-5 border-b border-gray-100 flex justify-between items-center">
            <h2 className="text-lg font-bold text-gray-900">Student Submissions</h2>
          </div>
          
          {/* Responsive Responsive Table Wrapper */}
          <div className="overflow-x-auto w-full">
            <table className="w-full text-left border-collapse min-w-[800px]">
              <thead>
                <tr className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider">
                  <th className="p-4 font-medium w-[25%]">Student Name</th>
                  <th className="p-4 font-medium w-[20%]">Submitted At</th>
                  <th className="p-4 font-medium w-[15%]">Status</th>
                  <th className="p-4 font-medium w-[15%]">File</th>
                  <th className="p-4 font-medium w-[10%]">Score</th>
                  <th className="p-4 font-medium text-right w-[15%]">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {submissionsList.length > 0 ? submissionsList.map((sub: TaskSubmission) => (
                  <tr key={sub.submissionId} className="hover:bg-gray-50 transition-colors">
                    <td className="p-4 font-medium text-gray-900 break-words whitespace-normal max-w-[200px]">
                      {sub.studentFullName}
                    </td>
                    <td className="p-4 text-sm text-gray-500">
                      <div className="flex items-center gap-1.5">
                        <Clock size={14} className={sub.isLate ? 'text-red-500 flex-shrink-0' : 'text-gray-400 flex-shrink-0'} />
                        <span className={sub.isLate ? 'text-red-600 font-medium break-words' : 'break-words'}>
                          {sub.submittedAt ? new Date(sub.submittedAt).toLocaleString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit'}) : 'N/A'}
                        </span>
                      </div>
                    </td>
                    <td className="p-4">
                      {sub.status === 'GRADED' ? (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-green-50 text-green-600">
                          <CheckCircle size={12} /> Graded
                        </span>
                      ) : sub.status === 'SUBMITTED' ? (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-yellow-50 text-yellow-600">
                          <AlertCircle size={12} /> Needs Review
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                          {sub.status}
                        </span>
                      )}
                    </td>
                    <td className="p-4">
                      {sub.fileUrl ? (
                        <a href={sub.fileUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-blue-600 hover:text-blue-800 text-sm font-medium">
                          <Download size={16} className="flex-shrink-0" /> View File
                        </a>
                      ) : (
                        <span className="text-gray-400 text-sm">No File</span>
                      )}
                    </td>
                    <td className="p-4 font-medium">
                      {sub.status === 'GRADED' ? (
                        <span className="text-green-600 break-all">{sub.finalScore || sub.rawScore || 0} / {stats?.totalPoints || 100}</span>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                    <td className="p-4 text-right">
                      <button 
                        onClick={() => openGradeModal(sub)}
                        className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 text-sm font-medium text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors ml-auto"
                      >
                        <Award size={16} /> Grade
                      </button>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-gray-500">
                      No submissions found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          
          {/* Pagination */}
          {submissionsPage && submissionsPage.totalPages > 1 && (
            <div className="p-4 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between sm:justify-end gap-4 text-sm text-gray-500">
              <div className="flex items-center gap-2">
                <button 
                  disabled={page === 0}
                  onClick={() => setPage(p => p - 1)}
                  className="px-3 py-1 bg-gray-50 border border-gray-200 rounded text-gray-600 disabled:opacity-50 transition-colors"
                >
                  Previous
                </button>
                <span className="text-gray-900 font-medium px-2">{page + 1} of {submissionsPage.totalPages}</span>
                <button 
                  disabled={page >= submissionsPage.totalPages - 1}
                  onClick={() => setPage(p => p + 1)}
                  className="px-3 py-1 bg-white border border-gray-200 rounded text-gray-600 hover:bg-gray-50 disabled:opacity-50 transition-colors"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Edit Project Modal */}
      <EditProjectModal
        project={projectToEdit}
        isOpen={isEditOpen}
        onClose={() => { setIsEditOpen(false); setProjectToEdit(null); }}
        onSuccess={fetchStats}
      />

      {/* Grade Modal Overlay */}
      {isGradeModalOpen && activeSubmission && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4 overflow-y-auto">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden flex flex-col my-auto">
            <div className="p-5 sm:p-6 border-b border-gray-100 bg-[var(--primary-500)] bg-indigo-600 text-white">
              <h3 className="text-lg sm:text-xl font-bold">Grade Submission</h3>
              <p className="text-sm opacity-90 mt-1 break-words">
                Student: <span className="font-semibold">{activeSubmission.studentFullName}</span>
              </p>
            </div>
            
            <div className="p-5 sm:p-6 overflow-y-auto space-y-4 max-h-[60vh]">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Score (Out of {stats?.totalPoints || 100})</label>
                <input 
                  type="number" 
                  value={score}
                  onChange={(e) => setScore(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                  placeholder="Enter score"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Feedback</label>
                <textarea 
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all min-h-[120px] resize-y"
                  placeholder="Provide constructive feedback..."
                ></textarea>
              </div>
            </div>
            
            <div className="p-5 sm:p-6 border-t border-gray-100 flex flex-col sm:flex-row justify-end gap-3 bg-gray-50">
              <button 
                onClick={closeGradeModal}
                className="w-full sm:w-auto order-2 sm:order-1 px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                disabled={isSubmittingGrade}
              >
                Cancel
              </button>
              <button 
                onClick={submitGrade}
                className="w-full sm:w-auto order-1 sm:order-2 px-4 py-2 text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors font-medium flex items-center justify-center gap-2 disabled:opacity-50"
                disabled={isSubmittingGrade || score === ''}
              >
                {isSubmittingGrade ? 'Saving...' : 'Submit Grade'}
              </button>
            </div>
          </div>
        </div>
      )}
    </DashLayout>
  );
};

export default ProjectDetail;