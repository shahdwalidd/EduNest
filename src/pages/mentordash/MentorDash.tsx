import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import DashLayout from '../../components/layout/Dash-layout';
import StatCard from '../../components/mentor-dash-com/statcard/StatCard';
import SalesChart from '../../components/mentor-dash-com/SalesChart';
import CalendarWidget from '../../components/mentor-dash-com/CalendarWidget/CalendarWidget';
import ScheduledSessions from '../../components/mentor-dash-com/ScheduledSessions/ScheduledSessions';
import { GraduationCap, BookOpen, Star, DollarSign } from 'lucide-react';
import { RecentActivityList } from '../../components/mentor-dash-com/RecentActivity';
import { ReviewsList } from '../../components/mentor-dash-com/Reviews';
import {
  getDashboardCards,
  getUpcomingSessions,
  getMentorReviews,
  getRevenueChart,
  extractRevenueChartData,
  extractSessionsData,
  extractReviewsData,
} from '../../services/dashboardService';
// Local dashboard types (to avoid missing import and keep things explicit here)
type DashboardCardsData = {
  totalStudents: number;
  totalMentorships: number;
  averageRating: number;
  totalRevenue: number;
};
import type { Session } from '../../components/mentor-dash-com/ScheduledSessions/ScheduledSessions.types';
import type { Review } from '../../components/mentor-dash-com/Reviews/Reviews.types';
import type { SalesData } from '../../components/mentor-dash-com/SalesChart/SalesChart.types';

/** التحقق من أن الاستجابة ليست رسالة خطأ من الباكند */
function isApiErrorResponse(res: unknown): res is { error: string } {
  if (res == null || typeof res !== 'object') return false;
  const obj = res as Record<string, unknown>;
  return typeof obj.error === 'string' && obj.error.length > 0;
}

/** استخراج بيانات الكروت من أي شكل شائع للـ API */
function extractCardsData(res: unknown): DashboardCardsData | null {
  if (res == null || typeof res !== 'object') return null;
  if (isApiErrorResponse(res)) return null;

  const obj = res as Record<string, unknown>;

  // محاولة الوصول إلى البيانات من apiResponse.cards
  let cardsData: Record<string, unknown> | undefined;

  // الطريقة الأولى: obj.apiResponse.cards
  if (obj.apiResponse && typeof obj.apiResponse === 'object') {
    const apiRes = obj.apiResponse as Record<string, unknown>;
    cardsData = apiRes.cards as Record<string, unknown> | undefined;
  }

  // الطريقة الثانية: obj.data.apiResponse.cards
  if (!cardsData && obj.data && typeof obj.data === 'object') {
    const dataObj = obj.data as Record<string, unknown>;
    if (dataObj.apiResponse && typeof dataObj.apiResponse === 'object') {
      const dataApiRes = dataObj.apiResponse as Record<string, unknown>;
      cardsData = dataApiRes.cards as Record<string, unknown> | undefined;
    }
  }

  // الطريقة الثالثة: obj.cards مباشرة
  if (!cardsData && obj.cards && typeof obj.cards === 'object') {
    cardsData = obj.cards as Record<string, unknown>;
  }

  if (!cardsData || typeof cardsData !== 'object') {
    return { totalStudents: 0, totalMentorships: 0, averageRating: 0, totalRevenue: 0 };
  }

  // استخراج البيانات مع دعم عدة أسماء مفاتيح
  const totalStudents = Number(
    cardsData.totalStudents ?? cardsData.total_students ?? cardsData['Total Student'] ?? 0
  );
  const totalMentorships = Number(
    cardsData.totalMentorships ?? cardsData.total_mentorships ?? cardsData['Total Mentorships'] ?? 0
  );
  const averageRating = Number(
    cardsData.averageRating ?? cardsData.average_rating ?? cardsData['Average Rating'] ?? 0
  );
  const totalRevenue = Number(
    cardsData.totalRevenue ?? cardsData.total_revenue ?? cardsData['Total Revenue'] ?? 0
  );

  return {
    totalStudents,
    totalMentorships,
    averageRating,
    totalRevenue,
  };
}

function mapSessions(raw: unknown): Session[] {
  // Use the helper function from the service to extract data
  const dataArray = extractSessionsData(raw);
  
  if (!Array.isArray(dataArray) || dataArray.length === 0) {
    console.warn('⚠️ No upcoming sessions data found');
    return [];
  }
  
  console.log('📅 Upcoming Sessions Count:', dataArray.length);
  
  return dataArray
    .map((rawItem) => {
      const item = rawItem as Record<string, unknown>;
      const id = String(item.id ?? item.sessionId ?? '');
      const title = String(item.title ?? item.name ?? 'Session');
      const startTime = String(item.startTime ?? item.start ?? '');
      const endTime = String(item.endTime ?? item.end ?? '');
      const type = (item.type as Session['type']) ?? 'course';
      const date = item.date ? String(item.date) : undefined;
      
      if (id && title) {
        console.log(`   📌 ${title} (${type}) | ${startTime} - ${endTime}${date ? ` [${date}]` : ''}`);
      }
      
      return {
        id,
        title,
        startTime,
        endTime,
        type,
        date,
      };
    })
    .filter(s => s.id && s.title); // Filter out invalid sessions
}

function mapReviews(raw: unknown): Review[] {
  // Use the helper function from the service to extract data (handles apiResponse.reviews.content format)
  const dataArray = extractReviewsData(raw);
  
  if (!Array.isArray(dataArray) || dataArray.length === 0) {
    console.warn('⚠️ No reviews data found');
    return [];
  }
  
  console.log('⭐ Reviews Count:', dataArray.length);
  
  return dataArray
    .map((rawItem) => {
      const item = rawItem as Record<string, unknown>;
      const id = String(item.id ?? '');
      const studentName = String(item.studentName ?? 'Student');
      const courseTitle = String(item.courseTitle ?? item.mentorshipTitle ?? 'Course');
      const rating = Number(item.rating) || 0;
      const comment = String(item.comment ?? '');
      const date = String(item.date ?? item.createdAt ?? '');
      const studentAvatar = item.studentAvatar ? String(item.studentAvatar) : undefined;
      
      if (id && rating > 0) {
        console.log(`   ⭐ ${studentName}: ${rating}/5 - "${comment.substring(0, 40)}${comment.length > 40 ? '...' : ''}"`);
      }
      
      return {
        id,
        studentName,
        studentAvatar,
        courseTitle,
        rating,
        comment,
        date,
      };
    })
    .filter(r => r.id && r.rating > 0); // Filter out invalid reviews
}

function mapRevenueChart(raw: unknown): SalesData[] {
  // Use the helper function from the service to extract data
  const dataArray = extractRevenueChartData(raw);
  
  if (!Array.isArray(dataArray) || dataArray.length === 0) {
    console.warn('⚠️ No revenue chart data found');
    return [];
  }
  
  console.log('📊 Revenue Chart Data Points:', dataArray.length);
  
  return dataArray
    .map((rawItem) => {
      const item = rawItem as Record<string, unknown>;
      const value = Number(item.value ?? item.sales ?? item.revenue ?? item.amount ?? 0);
      const month = String(item.month ?? item.label ?? item.date ?? '');
      
      if (value > 0 && month) {
        console.log(`   📈 ${month}: $${value.toLocaleString()}`);
      }
      
      return {
        month,
        value,
      };
    })
    .filter(d => d.month && d.value > 0);
}

const MentorDash: React.FC = () => {
  const navigate = useNavigate();
  const [cards, setCards] = useState<DashboardCardsData | null>(null);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [revenueData, setRevenueData] = useState<SalesData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const token = useAuthStore((s) => s.token);
  const isHydrated = useAuthStore((s) => s.isHydrated);
  const logout = useAuthStore((s) => s.logout);
  const userName = useAuthStore((s) => s.userName);
  const displayName = userName?.trim().split(/\s+/)[0] || userName || 'Mentor';
  const welcomeDate = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric', year: 'numeric' });

  useEffect(() => {
    // انتظر قليلاً للسماح للـ hydration بالاكتمال
    const timer = setTimeout(() => {
      const currentToken = useAuthStore.getState().token;
      if (!currentToken) {
        navigate('/login');
      }
    }, 100);

    return () => clearTimeout(timer);
  }, [navigate]);

  useEffect(() => {
    // لا تفعل أي شيء حتى تنتهي الـ hydration
    if (!isHydrated || token) {
      return;
    }

    // إذا لم يكن هناك توكن، اذهب إلى الـ login
    if (!token) {
      navigate('/login');
      return;
    }
  }, [isHydrated, token, navigate]);

  useEffect(() => {
    // تحميل البيانات بعد التأكد من الـ hydration والـ token
    if (!isHydrated || !token) {
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError(null);

    Promise.all([
      getDashboardCards().catch((e) => e),
      getUpcomingSessions().catch((e) => e),
      getMentorReviews().catch((e) => e),
      getRevenueChart().catch((e) => e),
    ])
      .then(([cardsRes, sessionsRes, reviewsRes, revenueRes]) => {
        if (cancelled) return;

        // التحقق من أخطاء API
        const allRes = [cardsRes, sessionsRes, reviewsRes, revenueRes];
        const apiError = allRes.find((r) => r && typeof r === 'object' && isApiErrorResponse(r)) as { error: string } | undefined;
        
        if (apiError) {
          setError(apiError.error);
          if (/invalid jwt|jwt token|unauthorized/i.test(apiError.error)) {
            logout();
            navigate('/login');
          }
          setLoading(false);
          return;
        }

        // معالجة بيانات الكروت
        if (cardsRes instanceof Error) {
          setError(cardsRes.message);
        } else if (cardsRes && typeof cardsRes === 'object') {
          const extracted = extractCardsData(cardsRes);
          setCards(extracted);
        }

        // معالجة الجلسات
        if (sessionsRes && !(sessionsRes instanceof Error) && !isApiErrorResponse(sessionsRes)) {
          const mappedSessions = mapSessions(sessionsRes);
          console.log('✅ Sessions mapped:', mappedSessions.length, 'sessions');
          setSessions(mappedSessions);
        } else if (sessionsRes instanceof Error) {
          console.warn('⚠️ Sessions error:', sessionsRes.message);
        }

        // معالجة المراجعات
        if (reviewsRes && !(reviewsRes instanceof Error) && !isApiErrorResponse(reviewsRes)) {
          const mappedReviews = mapReviews(reviewsRes);
          console.log('✅ Reviews mapped:', mappedReviews.length, 'reviews');
          setReviews(mappedReviews);
        } else if (reviewsRes instanceof Error) {
          console.warn('⚠️ Reviews error:', reviewsRes.message);
        }

        // معالجة بيانات الإيرادات
        if (revenueRes && !(revenueRes instanceof Error) && !isApiErrorResponse(revenueRes)) {
          const mapped = mapRevenueChart(revenueRes);
          console.log('✅ Revenue chart mapped:', mapped.length, 'points');
          setRevenueData(mapped.length > 0 ? mapped : []);
        } else if (revenueRes instanceof Error) {
          console.warn('⚠️ Revenue chart error:', revenueRes.message);
        }

        setLoading(false);
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err?.message ?? 'Failed to load dashboard');
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [token, navigate, logout, isHydrated]);

  const totalStudents = Number(cards?.totalStudents ?? 0);
  const totalMentorships = Number(cards?.totalMentorships ?? 0);
  const averageRating = Number(cards?.averageRating ?? 0);
  const totalRevenue = Number(cards?.totalRevenue ?? 0);

  // فورمات الأرقام بشكل أفضل
  const formatNumber = (num: number): string => {
    return new Intl.NumberFormat('en-US', { 
      minimumFractionDigits: 0,
      maximumFractionDigits: 0 
    }).format(num);
  };

  const formatRevenue = (num: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(num);
  };

  const formatRating = (num: number): string => {
    return num.toFixed(1);
  };

  const stats = [
    { title: 'Total Students', value: formatNumber(totalStudents), icon: <GraduationCap /> },
    { title: 'Total Mentorships', value: formatNumber(totalMentorships), icon: <BookOpen /> },
    { title: 'Average Rating', value: formatRating(averageRating), icon: <Star /> },
    { title: 'Total Revenue', value: formatRevenue(totalRevenue), icon: <DollarSign /> },
  ];

  return (
    <DashLayout pageTitle="Dashboard">
      <div className="bg-[#F7F7F8] min-h-screen px-4 md:px-8 py-4">
        {!isHydrated ? (
          <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
            <div className="text-center">
              <div className="inline-flex flex-col items-center gap-4">
                <div className="relative w-16 h-16">
                  <div className="absolute inset-0 rounded-full border-4 border-gray-200"></div>
                  <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-blue-500 border-r-blue-500 animate-spin"></div>
                </div>
                <div>
                  <p className="text-gray-700 font-semibold text-lg">Loading...</p>
                  <p className="text-gray-500 text-sm mt-1">Please wait while we prepare your dashboard</p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <>
            <div className="mb-6">
              <h1 className="text-3xl font-bold text-gray-900 capitalize">
                Welcome back, {displayName}
              </h1>
              <p className="text-gray-500 text-sm mt-1">{welcomeDate}</p>
            </div>

            {error && (
              <div className="mb-4 p-4 rounded-xl bg-red-50 border border-red-200 text-red-800 text-sm flex items-start gap-3">
                <svg className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4v.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                  <p className="font-semibold">{error}</p>
                  <button
                    onClick={() => window.location.reload()}
                    className="mt-2 text-xs font-semibold underline hover:no-underline"
                  >
                    Reload Page
                  </button>
                </div>
              </div>
            )}

            <div className="space-y-6">
          {loading ? (
            <div className="flex flex-col items-center justify-center gap-4 py-16 bg-white rounded-[20px] border border-gray-200">
              <div className="relative w-12 h-12">
                <div className="absolute inset-0 rounded-full border-4 border-gray-200"></div>
                <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-blue-500 border-r-blue-500 animate-spin"></div>
              </div>
              <div className="text-center">
                <p className="text-gray-700 font-semibold">Loading...</p>
                <p className="text-gray-500 text-sm mt-1">Preparing your dashboard data</p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {stats.map((stat, index) => (
                <StatCard
                  key={index}
                  title={stat.title}
                  value={stat.value}
                  icon={stat.icon}
                />
              ))}
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
            <div className="lg:col-span-2 space-y-6">
              <SalesChart
                title="Sales"
                data={revenueData.length > 0 ? revenueData : undefined}
              />
              <ReviewsList
                reviews={reviews}
                onViewAll={() => navigate('/mentor/mentorships')}
              />
            </div>
            <div className="space-y-6">
              <CalendarWidget 
                sessions={sessions.map(s => ({
                  id: s.id,
                  title: s.title,
                  startTime: s.startTime,
                  endTime: s.endTime,
                  type: s.type,
                  date: s.date || new Date().toISOString().split('T')[0]
                }))}
              />
              <ScheduledSessions sessions={sessions} />
              <RecentActivityList />
            </div>
          </div>
        </div>
          </>
        )}
      </div>
    </DashLayout>
  );
};

export default MentorDash;
