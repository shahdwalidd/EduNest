
import React, { useEffect, useState, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import DashLayout from '../../../components/layout/Dash-layout';
import { getProjectDashboard, type FullProjectDashboard, type ProjectListItem } from '../../../services/projectService';
import { Briefcase, CheckCircle, Clock, BarChart2, Search, Eye, MoreVertical, Edit, Trash2, ArrowLeft } from 'lucide-react';
import { type ProjectResponse } from '../../../services/projectService';
import { EditProjectModal, DeleteProjectModal } from './components/ProjectModals';
import GlobalLoadingOverlay from '../../../loadingApp/GlobalLoadingOverlay';

const PAGE_SIZE = 10;

const MentorshipProjects: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [dashboard, setDashboard] = useState<FullProjectDashboard | null>(null);
  const [allProjects, setAllProjects] = useState<ProjectListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Client-side pagination
  const [currentPage, setCurrentPage] = useState(0);

  // Actions state
  const [activeDropdown, setActiveDropdown] = useState<number | null>(null);
  const [projectToEdit, setProjectToEdit] = useState<ProjectResponse | null>(null);
  const [projectToDelete, setProjectToDelete] = useState<number | null>(null);

  const fetchDashboard = async () => {
    if (!id) return;
    try {
      setLoading(true);
      // Fetch all projects at once — filtering & pagination handled client-side
      const res = await getProjectDashboard(id, { page: 0, size: 1000 });
      setDashboard(res.fullDashboard);
      setAllProjects(res.fullDashboard?.projectResponsePageResponse?.content || []);
      setCurrentPage(0);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to load project dashboard';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  // Client-side filter
  const filtered = useMemo(() => {
    let list = allProjects;
    if (searchQuery)
      list = list.filter(item =>
        item.project.title.toLowerCase().includes(searchQuery.toLowerCase())
      );
    if (statusFilter)
      list = list.filter(item => item.project.status === statusFilter);
    return list;
  }, [allProjects, searchQuery, statusFilter]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const safePage = Math.min(currentPage, Math.max(0, totalPages - 1));
  const projectsList = filtered.slice(safePage * PAGE_SIZE, (safePage + 1) * PAGE_SIZE);

  const handleSearchChange = (val: string) => { setSearchQuery(val); setCurrentPage(0); };
  const handleStatusChange = (val: string) => { setStatusFilter(val); setCurrentPage(0); };

  if (loading && allProjects.length === 0) {
    return (
      <DashLayout pageTitle="Dashboard / My Mentorships / Projects">
        <div className="flex h-[50vh] items-center justify-center">
      <GlobalLoadingOverlay/>
        </div>
      </DashLayout>
    );
  }

  if (error && allProjects.length === 0) {
    return (
      <DashLayout pageTitle="Dashboard / My Mentorships / Projects">
        <div className="flex h-[50vh] items-center justify-center text-red-500">
          <p>{error}</p>
        </div>
      </DashLayout>
    );
  }

  const stats = dashboard?.projectDashboardDTO;

  return (
    <DashLayout pageTitle="Dashboard / My Mentorships / Projects">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">

        {/* Header Section */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <div
              className="flex items-baseline gap-2 cursor-pointer text-gray-600 hover:text-gray-900"
              onClick={() => navigate(`/mentor/mentorships/${id}`)}
            >
              <ArrowLeft size={20} />
              <h1 className="text-3xl font-bold text-gray-900">Projects</h1>
            </div>
            <p className="text-sm text-gray-500 mt-1">Manage and review all projects</p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 font-medium">Total Projects</p>
              <h3 className="text-2xl font-bold mt-1 text-gray-900">{stats?.totalProjects || 0}</h3>
            </div>
            <div className="h-10 w-10 rounded-full bg-blue-50 flex items-center justify-center text-[var(--primary-500)]">
              <Briefcase size={20} />
            </div>
          </div>

          <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 font-medium">Published</p>
              <h3 className="text-2xl font-bold mt-1 text-gray-900">
                {(stats?.publishedCount || 0).toString().padStart(2, '0')}
              </h3>
            </div>
            <div className="h-10 w-10 rounded-full bg-green-50 flex items-center justify-center text-green-500">
              <CheckCircle size={20} />
            </div>
          </div>

          <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 font-medium">Draft</p>
              <h3 className="text-2xl font-bold mt-1 text-gray-900">
                {(stats?.draftCount || 0).toString().padStart(2, '0')}
              </h3>
            </div>
            <div className="h-10 w-10 rounded-full bg-gray-50 flex items-center justify-center text-gray-500">
              <Clock size={20} />
            </div>
          </div>

          <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 font-medium">Avg Score</p>
              <h3 className="text-2xl font-bold mt-1 text-gray-900">{stats?.averageScore || 0} %</h3>
            </div>
            <div className="h-10 w-10 rounded-full bg-yellow-50 flex items-center justify-center text-yellow-500">
              <BarChart2 size={20} />
            </div>
          </div>
        </div>

        {/* Search Bar */}
        <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex items-center gap-3">
          <Search size={20} className="text-gray-400 shrink-0" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
            placeholder="Search project..."
            className="w-full bg-transparent border-none outline-none text-gray-700"
          />
        </div>

        {/* Projects List Section */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="p-5 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
            <div>
              <h2 className="text-lg font-bold text-gray-900">All Projects</h2>
              <p className="text-sm text-gray-500">Total {filtered.length}</p>
            </div>
            <select
              value={statusFilter}
              onChange={(e) => handleStatusChange(e.target.value)}
              className="flex items-center gap-2 border border-gray-200 px-3 py-1.5 rounded-lg text-sm text-gray-600 bg-white outline-none focus:ring-2 focus:ring-primary/20"
            >
              <option value="">All Statuses</option>
              <option value="PUBLISHED">Published</option>
              <option value="DRAFT">Draft</option>
            </select>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse mb-4">
              <thead>
                <tr className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider">
                  <th className="p-4 font-medium">Project Title</th>
                  <th className="p-4 font-medium">Status</th>
                  <th className="p-4 font-medium">Submissions</th>
                  <th className="p-4 font-medium">Created</th>
                  <th className="p-4 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {projectsList.length > 0 ? projectsList.map((item: ProjectListItem) => (
                  <tr key={item.project.id} className="hover:bg-gray-50 transition-colors">
                    <td className="p-4 cursor-pointer">
                      <Link to={`/mentor/mentorships/${id}/projects/${item.project.id}`}>
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-blue-50 rounded text-[var(--primary-500)]">
                            <Briefcase size={16} />
                          </div>
                          <span className="font-semibold text-gray-900">{item.project.title}</span>
                        </div>
                      </Link>
                    </td>

                    <td className="p-4">
                      {item.project.status === 'PUBLISHED' ? (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-green-50 text-green-600">
                          <CheckCircle size={12} /> Published
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                          <Clock size={12} /> Draft
                        </span>
                      )}
                    </td>

                    <td className="px-10 font-medium">
                      <span className="text-[var(--primary-500)]">{item.submissionsCount}/{item.totalStudents}</span>
                    </td>

                    <td className="p-4 text-sm text-gray-500">
                      {item.project.createdAt
                        ? new Date(item.project.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' })
                        : 'N/A'}
                    </td>

                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          to={`/mentor/mentorships/${id}/projects/${item.project.id}`}
                          className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-[var(--primary-500)] bg-white border border-blue-200 rounded-lg hover:bg-blue-50 transition-colors"
                        >
                          <Eye size={16} /> Details
                        </Link>
                        <div className="relative">
                          {activeDropdown === item.project.id && (
                            <div
                              className="fixed inset-0 z-40"
                              onClick={() => setActiveDropdown(null)}
                            />
                          )}
                          <button
                            onClick={() => setActiveDropdown(activeDropdown === item.project.id ? null : item.project.id)}
                            className="relative z-5 p-1.5 text-gray-400 hover:bg-gray-100 rounded-lg border border-gray-200"
                          >
                            <MoreVertical size={16} />
                          </button>
                          {activeDropdown === item.project.id && (
                            <div className="absolute right-0 top-full mt-1 z-50 w-32 bg-white rounded-lg shadow-lg border border-gray-100 overflow-hidden py-1">
                              <button
                                onClick={() => { setProjectToEdit(item.project); setActiveDropdown(null); }}
                                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                              >
                                <Edit size={14} /> Edit
                              </button>
                              <button
                                onClick={() => { setProjectToDelete(item.project.id); setActiveDropdown(null); }}
                                className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                              >
                                <Trash2 size={14} /> Delete
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-gray-500">
                      No projects found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between bg-white">
              <div className="text-sm text-gray-500">
                Showing {safePage * PAGE_SIZE + 1}–{Math.min((safePage + 1) * PAGE_SIZE, filtered.length)} of {filtered.length}
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setCurrentPage(p => Math.max(0, p - 1))}
                  disabled={safePage === 0}
                  className="px-3 py-1.5 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg disabled:opacity-50 transition-colors"
                >
                  Previous
                </button>

                {Array.from({ length: totalPages }).map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrentPage(i)}
                    className={`w-8 h-8 flex items-center justify-center text-sm font-medium rounded-lg transition-colors ${
                      i === safePage
                        ? 'text-white bg-[var(--primary-500)]'
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    {i + 1}
                  </button>
                ))}

                <button
                  onClick={() => setCurrentPage(p => Math.min(totalPages - 1, p + 1))}
                  disabled={safePage === totalPages - 1}
                  className="px-3 py-1.5 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg disabled:opacity-50 transition-colors"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <EditProjectModal
        project={projectToEdit}
        isOpen={!!projectToEdit}
        onClose={() => setProjectToEdit(null)}
        onSuccess={fetchDashboard}
      />
      <DeleteProjectModal
        projectId={projectToDelete}
        isOpen={!!projectToDelete}
        onClose={() => setProjectToDelete(null)}
        onSuccess={fetchDashboard}
      />
    </DashLayout>
  );
};

export default MentorshipProjects;