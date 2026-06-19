import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import DashLayout from '../../../components/layout/Dash-layout';
import toast from 'react-hot-toast';
import { getProjectStatistics, getProjectDashboard, gradeProjectSubmission, type ProjectStatistics, type TaskSubmission, type ProjectResponse } from '../../../services/projectService';
import { EditProjectModal } from './components/ProjectModals';
import { ProjectDetailHeader } from './components/ProjectDetailHeader';
import { ProjectOverview } from './components/ProjectOverview';
import { ProjectStatsCards } from './components/ProjectStatsCards';
import { ProjectSubmissionsTable } from './components/ProjectSubmissionsTable';
import { GradeSubmissionModal } from './components/GradeSubmissionModal';
import GlobalLoadingOverlay from '../../../loadingApp/GlobalLoadingOverlay';

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
    } catch (err: any) { // تم تغيير النوع هنا إلى any لتسهيل فحص خصائص الـ API response
      // 1. التحقق أولاً إذا كان الخطأ قادم من السيرفر وبداخل الـ response body (مثل axios)
      const apiError = err?.response?.data?.errorMessages?.error || err?.data?.errorMessages?.error;
      
      const directError = err?.errorMessages?.error ;
      const message = apiError || directError || err?.message  || 'Failed to submit grade';
      toast.error(message);
    } finally {
      setIsSubmittingGrade(false);
    }
  };

  if (loading && !stats) {
    return (
      <DashLayout pageTitle={`Dashboard / Projects / Details`}>
        <div className="flex h-[50vh] items-center justify-center p-4">
          <GlobalLoadingOverlay/>
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
        <ProjectDetailHeader
          projectTitle={stats?.projectTitle || 'Project Details'}
          onBack={handleBackToProjects}
          onEdit={openEditModal}
        />

        {/* Project Overview */}
        <ProjectOverview stats={stats} />

        {/* Stats Cards */}
        <ProjectStatsCards stats={stats} />

        {/* Submissions Table Container */}
        <ProjectSubmissionsTable
          submissionsList={submissionsList}
          stats={stats}
          page={page}
          submissionsPage={submissionsPage}
          onPageChange={(nextPage) => setPage(nextPage)}
          onOpenGradeModal={openGradeModal}
        />
      </div>

      {/* Edit Project Modal */}
      <EditProjectModal
        project={projectToEdit}
        isOpen={isEditOpen}
        onClose={() => {
          setIsEditOpen(false);
          setProjectToEdit(null);
        }}
        onSuccess={fetchStats}
      />

      {/* Grade Modal Overlay */}
      <GradeSubmissionModal
        isOpen={isGradeModalOpen}
        stats={stats}
        activeSubmission={activeSubmission}
        score={score}
        feedback={feedback}
        isSubmitting={isSubmittingGrade}
        onClose={closeGradeModal}
        onChangeScore={setScore}
        onChangeFeedback={setFeedback}
        onSubmit={submitGrade}
      />
    </DashLayout>
  );
};

export default ProjectDetail;

