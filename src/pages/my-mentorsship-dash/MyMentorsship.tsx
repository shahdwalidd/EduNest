
import type { FC } from 'react';
import { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, ChevronDown } from 'lucide-react';
import DashLayout from '../../components/layout/Dash-layout';
import MentorshipTable from '../../components/my-mentorships-com/MentorshipTable/MentorshipTable';
import Pagination from '../../components/common/Pagination/Pagination';
import { getMentorships } from '../../services/dashboardService';
import { useAuthStore } from '../../store/authStore';
import type { Mentorship } from '../../types/mentorship.types';

/** استخراج مصفوفة mentorships من أي شكل شائع للـ API */
function ensureMentorshipsArray(raw: unknown): unknown[] {
  console.log('🔍 ensureMentorshipsArray input:', raw);
  
  if (Array.isArray(raw)) {
    console.log('✅ Already an array:', raw.length, 'items');
    return raw;
  }
  
  if (raw == null || typeof raw !== 'object') {
    console.warn('⚠️ Invalid input type:', typeof raw);
    return [];
  }
  
  const obj = raw as Record<string, unknown>;
  
  // Check apiResponse.mentorships (جمع) - both lowercase and camelCase
  const apiRes = obj.apiResponse as Record<string, unknown> | undefined;
  if (apiRes?.mentorships && Array.isArray(apiRes.mentorships)) {
    console.log('✅ Found in apiResponse.mentorships:', (apiRes.mentorships as unknown[]).length);
    return apiRes.mentorships;
  }
  
  // Check apiResponse.mentorShips (with capital S)
  if (apiRes?.mentorShips) {
    const mentorShips = apiRes.mentorShips as Record<string, unknown> | undefined;
    if (mentorShips?.content && Array.isArray(mentorShips.content)) {
      console.log('✅ Found in apiResponse.mentorShips.content:', (mentorShips.content as unknown[]).length);
      return mentorShips.content;
    }
  }
  
  // Check nested data structures
  const keys = ['mentorships', 'mentorShips', 'data', 'items', 'results', 'list', 'courses', 'content'];
  for (const key of keys) {
    const val = obj[key];
    if (Array.isArray(val)) {
      console.log(`✅ Found in obj.${key}:`, val.length);
      return val;
    }
    // If it's an object with content property
    if (val && typeof val === 'object' && 'content' in val && Array.isArray((val as Record<string, unknown>).content)) {
      const content = (val as Record<string, unknown>).content as unknown[];
      console.log(`✅ Found in obj.${key}.content:`, content.length);
      return content;
    }
  }
  
  console.error('❌ No mentorships array found in response structure');
  return [];
}

/** تحويل عنصر API إلى Mentorship */
function mapApiMentorshipToUi(item: unknown): Mentorship {
  const m = item as Record<string, unknown>;
  const status = String(m.status ?? 'DRAFT').toUpperCase();
  
  // Map status: ACTIVE/PUBLISHED -> active, DRAFT -> draft, COMPLETED -> completed
  const uiStatus = 
    status === 'ACTIVE' || status === 'PUBLISHED' ? 'active' : 
    status === 'DRAFT' ? 'draft' : 
    status === 'COMPLETED' ? 'completed' : 
    'draft';
  
  // Try to get date from various possible fields
  const created = m.createdAt ?? m.createdDate ?? m.created_at ?? m.uploadDate ?? new Date().toISOString();
  const dateStr = typeof created === 'string'
    ? new Date(created).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })
    : '—';
  
  return {
    id: String(m.id ?? ''),
    title: String(m.title ?? 'Untitled'),
    icon: '📋',
    level: String(m.difficultyLevel ?? m.level ?? 'ALL_LEVEL'),
    rating: Number(m.rating ?? 0),
    totalEnrolled: Number(m.totalEnrolled ?? m.enrolledCount ?? m.students ?? 0),
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
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'draft' | 'completed'>('all');
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  useEffect(() => {
    if (!token) {
      navigate('/login');
      return;
    }
    setLoading(true);
    setError(null);
    getMentorships()
      .then((res: unknown) => {
        console.log('📊 Mentorships API Response:', res);
        const raw = res && typeof res === 'object' && 'data' in res ? (res as { data: unknown }).data : res;
        const arr = ensureMentorshipsArray(raw);
        console.log('✅ Mentorships Array:', arr);
        const mapped = arr.map(mapApiMentorshipToUi);
        console.log('✅ Mentorships Mapped:', mapped.length, 'items');
        setAllMentorships(mapped);
      })
      .catch((err: unknown) => {
        const error = err as { response?: { data?: { message?: string } }; message?: string };
        const msg = error?.response?.data?.message ?? error?.message ?? 'Failed to load mentorships';
        console.error('❌ Error Loading Mentorships:', msg);
        setError(String(msg));
      })
      .finally(() => setLoading(false));
  }, [token, navigate]);

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
    
      <div className="bg-[#F7F7F8] min-h-screen px-0 md:px-8 md:pt-4 pb-8">
        
        {/* Header Section: Add button */}
        <div className="flex justify-end mb-6 px-4 md:px-0 pt-4 md:pt-0">
          <button
            onClick={() => navigate('/mentor/mentorships/create')}
            className="w-full sm:w-auto flex items-center justify-center gap-2 h-[44px] px-6 rounded-xl text-white text-sm font-bold bg-gradient-to-r from-[#154d71] via-[#2a7fa8] to-[#33a1e0] shadow-md transition-all active:scale-95"
          >
            <Plus className="w-5 h-5" />
            <span>Create New</span>
          </button>
        </div>

        <div className="bg-white rounded-none md:rounded-3xl border-y md:border border-gray-100 shadow-sm overflow-hidden">
          
          {/* Table Header / Title */}
          <div className="p-4 md:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-50 md:border-none">
            <div>
              <h1 className="text-lg md:text-xl font-bold text-[#1A1C1E]">Mentorships List</h1>
              <p className="text-sm text-gray-400 mt-1">
                Total <span className="text-[#1A1C1E] font-bold">{filteredData.length}</span>
              </p>
            </div>

            <div className="relative">
              <button
                onClick={() => setIsFilterOpen(!isFilterOpen)}
                className="w-full sm:w-auto flex items-center justify-between sm:justify-center gap-2 px-4 py-2 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 transition-all text-sm font-bold text-gray-700 capitalize"
              >
                <span>{statusFilter === 'all' ? 'Filter' : statusFilter}</span>
                <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isFilterOpen ? 'rotate-180' : ''}`} />
              </button>

              {isFilterOpen && (
                <div className="absolute right-0 mt-2 w-full sm:w-40 bg-white border border-gray-100 rounded-xl shadow-xl z-50 py-2">
                  {['all', 'active', 'draft', 'completed'].map((s) => (
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

          {/* Table */}
          {error && (
            <div className="p-8 text-center bg-red-50 border border-red-200 rounded-2xl m-4">
              <div className="inline-block mb-4">
                <svg className="w-12 h-12 text-red-500 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4v.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <p className="text-red-700 font-semibold text-sm">Failed to Load Mentorships</p>
              <p className="text-red-600 text-xs mt-1">{error}</p>
              <button
                onClick={() => window.location.reload()}
                className="mt-3 px-4 py-2 bg-red-600 text-white rounded-lg text-xs font-semibold hover:bg-red-700 transition-colors"
              >
                Try Again
              </button>
            </div>
          )}
          {loading ? (
            <div className="p-12 flex flex-col items-center justify-center gap-4 min-h-[400px]">
              <div className="relative w-14 h-14">
                <div className="absolute inset-0 rounded-full border-4 border-gray-200"></div>
                <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-blue-500 border-r-blue-500 animate-spin"></div>
              </div>
              <div className="text-center">
                <p className="text-gray-700 font-semibold">Loading...</p>
                <p className="text-gray-500 text-sm mt-1">Fetching your mentorships</p>
              </div>
            </div>
          ) : currentMentorships.length === 0 ? (
            <div className="p-12 flex flex-col items-center justify-center gap-4 min-h-[400px]">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              </div>
              <div className="text-center">
                <p className="text-gray-700 font-semibold">No Mentorships Yet</p>
                <p className="text-gray-500 text-sm mt-1">Create your first mentorship to get started</p>
                <button
                  onClick={() => navigate('/mentor/mentorships/create')}
                  className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors"
                >
                  Create Mentorship
                </button>
              </div>
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
                }
              }}
            />
          )}

          {/* Footer / Pagination: Padding  */}
          {!loading && !error && currentMentorships.length > 0 && (
          <div className="p-4 md:p-6 border-t border-gray-50">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              itemsPerPage={itemsPerPage}
              totalItems={filteredData.length}
              onPageChange={setCurrentPage}
              onItemsPerPageChange={(val) => setItemsPerPage(Number(val))}
            />
          </div>
          )}
        </div>
      </div>
    </DashLayout>
  );
};

export default MentorshipsList;