
import type { FC } from 'react';
import { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, ChevronDown } from 'lucide-react';
import DashLayout from '../../components/layout/Dash-layout';
import MentorshipTable from '../../components/my-mentorships-com/MentorshipTable/MentorshipTable';
import Pagination from '../../components/common/Pagination/Pagination';
import { getMentorships, extractMentorshipsData } from '../../services/dashboardService';
import { useAuthStore } from '../../store/authStore';
import type { Mentorship } from '../../types/mentorship.types';


/** تحويل عنصر API إلى Mentorship */
function mapApiMentorshipToUi(item: unknown): Mentorship {
  const m = item as Record<string, unknown>;
  const status = String(m.status ?? 'DRAFT').toLowerCase();
  const uiStatus = status === 'published' || status === 'active' ? 'active' : status === 'draft' ? 'draft' : 'completed';
  const created = m.createdAt ?? m.createdDate ?? m.created_at;
  const dateStr = typeof created === 'string'
    ? new Date(created).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })
    : '—';
  return {
    id: String(m.id ?? ''),
    title: String(m.title ?? 'Untitled'),
    icon: '📋',
    level: String(m.difficultyLevel ?? m.level ?? 'All Level'),
    rating: Number(m.rating ?? 0),
    totalEnrolled: Number(m.totalEnrolled ?? m.enrolledCount ?? 0),
    revenue: Number(m.price ?? m.revenue ?? 0),
    createdDate: dateStr,
    status: uiStatus,
  };
}

const MentorshipsList: FC = () => {
  const navigate = useNavigate();
  const token = useAuthStore((s) => s.token);
  const [allMentorships, setAllMentorships] = useState<Mentorship[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(6);

  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'draft'>('all');
  const [isFilterOpen, setIsFilterOpen] = useState(false);

<<<<<<< Updated upstream
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const allMentorships: Mentorship[] = [
    { id: '1', title: 'Design Systems Bootcamp', icon: '📋', level: 'All Level', rating: 5.0, totalEnrolled: 342, revenue: 5028, createdDate: '28 Oct, 2026', status: 'active' },
    { id: '2', title: 'Design Systems Bootcamp', icon: '🖥️', level: 'All Level', rating: 5.0, totalEnrolled: 342, revenue: 5028, createdDate: '28 Oct, 2026', status: 'active' },
    { id: '3', title: 'Design Systems Bootcamp', icon: '📊', level: 'All Level', rating: 5.0, totalEnrolled: 342, revenue: 5028, createdDate: '28 Oct, 2026', status: 'active' },
    { id: '4', title: 'Design Systems Bootcamp', icon: '👥', level: 'All Level', rating: 5.0, totalEnrolled: 342, revenue: 5028, createdDate: '28 Oct, 2026', status: 'active' },
    { id: '5', title: 'Design Systems Bootcamp', icon: '📋', level: 'All Level', rating: 5.0, totalEnrolled: 342, revenue: 5028, createdDate: '28 Oct, 2026', status: 'active' },
    { id: '6', title: 'Design Systems Bootcamp', icon: '📋', level: 'All Level', rating: 0, totalEnrolled: 0, revenue: 0, createdDate: '28 Oct, 2026', status: 'draft' },
  ];
=======
  useEffect(() => {
    if (!token) {
      navigate('/login');
      return;
    }
    setLoading(true);
    setError(null);
    getMentorships()
      .then((res) => {
        console.log('📋 Raw Mentorships Response:', res);
        const arr = extractMentorshipsData(res);
        console.log('📝 Extracted Mentorships Array:', arr);
        setAllMentorships(arr.map(mapApiMentorshipToUi));
      })
      .catch((err) => {
        const msg = err?.response?.data?.message ?? err?.message ?? 'Failed to load mentorships';
        console.error('❌ Error loading mentorships:', msg);
        setError(String(msg));
      })
      .finally(() => setLoading(false));
  }, [token, navigate]);
>>>>>>> Stashed changes


  const filteredData = useMemo(() => {
    if (statusFilter === 'all') return allMentorships;
    return allMentorships.filter(item => item.status === statusFilter);
  }, [statusFilter, allMentorships]);

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);

  const currentMentorships = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredData.slice(startIndex, startIndex + itemsPerPage);
  }, [currentPage, itemsPerPage, filteredData]);

  useEffect(() => {
    setCurrentPage(1);
  }, [statusFilter, itemsPerPage]);

  return (
    <DashLayout pageTitle="Dashboard / My Mentorships">
      <div className="bg-[#F7F7F8] min-h-screen px-8 pt-4 pb-8">

        <div className="flex justify-end mb-6">
          <button
            onClick={() => navigate('/mentor/mentorships/create')}
            className="flex items-center justify-center gap-2 min-w-[130px] h-[44px] px-6 rounded-xl border-none text-white text-sm font-bold bg-gradient-to-r from-[#154d71] via-[#2a7fa8] to-[#33a1e0] shadow-md transition-all hover:brightness-110 active:scale-95"
          >
            <Plus className="w-5 h-5" />
            <span>Create New</span>
          </button>
        </div>

        <div className="bg-white rounded-3xl border border-gray-100 overflow-hidden shadow-sm">
          <div className="p-6 pb-4 flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold text-[#1A1C1E]">Mentorships List</h1>
              <p className="text-sm text-gray-400 mt-1">
                Total <span className="text-[#1A1C1E] font-bold">{filteredData.length}</span>
              </p>
            </div>

            <div className="relative">
              <button
                onClick={() => setIsFilterOpen(!isFilterOpen)}
                className="flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 transition-all text-sm font-bold text-gray-700 capitalize"
              >
                <span>{statusFilter === 'all' ? 'Filter' : statusFilter}</span>
                <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isFilterOpen ? 'rotate-180' : ''}`} />
              </button>

              {isFilterOpen && (
                <div className="absolute right-0 mt-2 w-40 bg-white border border-gray-100 rounded-xl shadow-xl z-50 py-2">
                  {['all', 'active', 'draft'].map((s) => (
                    <button
                      key={s}
                      className="w-full text-left px-4 py-2 text-sm font-bold hover:bg-blue-50 capitalize text-gray-700"
                      // eslint-disable-next-line @typescript-eslint/no-explicit-any
                      onClick={() => { setStatusFilter(s as any); setIsFilterOpen(false); }}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

<<<<<<< Updated upstream
          <MentorshipTable
            mentorships={currentMentorships}
            onDetails={(id) => navigate(`/mentor/mentorships/${id}`)}
            onAction={(type, id) => console.log(type, id)}
          />
=======
          {/* Table */}
          {error && (
            <div className="p-6 text-center">
              <p className="text-amber-600 text-sm">{error}</p>
            </div>
          )}
          {loading ? (
            <div className="p-6 space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-16 bg-gray-100 rounded-xl animate-pulse" />
              ))}
            </div>
          ) : (
            <MentorshipTable
              mentorships={currentMentorships}
              onDetails={(id) => navigate(`/mentor/mentorships/${id}`)}
              onAction={(type, id) => {
                if (type === 'edit') {
                  navigate(`/mentor/mentorships/${id}/edit`);
                } else if (type === 'delete') {
                  console.log('Delete mentorship:', id);
                  // Add delete logic here
                }
              }}
            />
          )}
>>>>>>> Stashed changes

          <div className="p-6 border-t border-gray-50">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              itemsPerPage={itemsPerPage}
              totalItems={filteredData.length}
              onPageChange={setCurrentPage}
              onItemsPerPageChange={(val) => setItemsPerPage(Number(val))}
            />
          </div>
        </div>
      </div>
    </DashLayout>
  );
};

export default MentorshipsList;