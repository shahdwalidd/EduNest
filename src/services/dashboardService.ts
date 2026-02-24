import api from './api';

const BASE = 'api/v1/dashboard';

const handleRequest = async <T>(request: Promise<{ data: T }>): Promise<T> => {
  try {
    const response = await request;
    return response.data;
  } catch (error: unknown) {
    const err = error as { response?: { data?: unknown }; message?: string };
    throw err.response?.data ?? err.message;
  }
};

/** GET /api/v1/dashboard/{id}/top-learners */
export const getTopLearners = (mentorshipId: string) =>
  handleRequest(api.get(`${BASE}/${mentorshipId}/top-learners`));

/** GET /api/v1/dashboard/{id}/stats */
export const getMentorshipStats = (mentorshipId: string) =>
  handleRequest(api.get(`${BASE}/${mentorshipId}/stats`));

/** GET /api/v1/dashboard/{id}/reviews */
export const getMentorshipReviews = (mentorshipId: string) =>
  handleRequest(api.get(`${BASE}/${mentorshipId}/reviews`));

/** GET /api/v1/dashboard/students */
export const getMentorStudents = () =>
  handleRequest(api.get(`${BASE}/students`));

/** GET /api/v1/dashboard/sessions */
export const getUpcomingSessions = () =>
  handleRequest(api.get(`${BASE}/sessions`));

/** GET /api/v1/dashboard/reviews */
export const getMentorReviews = () =>
  handleRequest(api.get(`${BASE}/reviews`));

/** GET /api/v1/dashboard/revenue-chart */
export const getRevenueChart = () =>
  handleRequest(api.get(`${BASE}/revenue-chart`));

/** GET /api/v1/dashboard/mentorships */
export const getMentorships = () =>
  handleRequest(api.get(`api/v1/mentorship`));

/** GET /api/v1/dashboard/cards */
export const getDashboardCards = () =>
  handleRequest(api.get(`${BASE}/cards`));

// --- Mentorship API types and functions ---

export interface MentorshipApiResponse {
  id: string | number;
  title: string;
  description?: string;
  difficultyLevel?: string;
  level?: string;
  price?: number;
  revenue?: number;
  rating?: number;
  totalEnrolled?: number;
  enrolledCount?: number;
  status?: string;
  createdAt?: string;
  createdDate?: string;
  created_at?: string;
  [key: string]: unknown;
}

/**
 * استخراج بيانات المنتوريات من استجابة API
 */
export const extractMentorshipsData = (response: unknown): MentorshipApiResponse[] => {
  if (!response) return [];

  // إذا كانت الاستجابة مصفوفة مباشرة
  if (Array.isArray(response)) {
    return response.filter((item) => item && typeof item === 'object') as MentorshipApiResponse[];
  }

  // إذا كانت الاستجابة كائن يحتوي على مصفوفة
  const data = response as Record<string, unknown>;
  
  // البحث عن مصفوفة في الخصائص الشائعة
  const commonKeys = ['mentorships', 'data', 'items', 'results', 'courses'];
  for (const key of commonKeys) {
    if (Array.isArray(data[key])) {
      return (data[key] as unknown[]).filter((item) => item && typeof item === 'object') as MentorshipApiResponse[];
    }
  }

  return [];
};

/**
 * جلب تفاصيل منتورية محددة
 */
export const getMentorshipDetail = async (mentorshipId: string | number): Promise<MentorshipApiResponse> => {
  const id = String(mentorshipId);
  const candidates = [
    `api/v1/mentorship/${id}`,
    `api/v1/mentorship/${id}`,
    `api/v1/mentorships/${id}`,
    `${BASE.replace('/dashboard', '')}/mentorships/${id}`,
  ];

  const errors: Array<{ url: string; status?: number; data?: unknown; message?: string }> = [];

  for (const url of candidates) {
    try {
      const response = await api.get<unknown>(url);
      console.log('✅ Fetched mentorship detail from', url);
      const raw = response.data as Record<string, unknown> | null;

      if (!raw) return raw as unknown as MentorshipApiResponse;

      // common envelope: { apiResponse: { mentorShip: {...} } }
      if (raw.apiResponse && typeof raw.apiResponse === 'object') {
        const apiRes = raw.apiResponse as Record<string, unknown>;
        if (apiRes.mentorShip && typeof apiRes.mentorShip === 'object') {
          return apiRes.mentorShip as MentorshipApiResponse;
        }
        if (apiRes.mentorship && typeof apiRes.mentorship === 'object') {
          return apiRes.mentorship as MentorshipApiResponse;
        }
      }

      // direct properties
      if (raw.mentorShip && typeof raw.mentorShip === 'object') {
        return raw.mentorShip as MentorshipApiResponse;
      }
      if (raw.mentorship && typeof raw.mentorship === 'object') {
        return raw.mentorship as MentorshipApiResponse;
      }

      // if response already looks like a mentorship object
      if ('id' in raw && ('title' in raw || 'description' in raw)) {
        return raw as MentorshipApiResponse;
      }

      // fallback
      return raw as unknown as MentorshipApiResponse;
    } catch (err: unknown) {
      const e = err as { response?: { status?: number; data?: unknown }; message?: string };
      errors.push({ url, status: e.response?.status, data: e.response?.data, message: e.message });
      // if the error is 409, 401, or 403 we continue to try other endpoints
      console.warn(`Attempt to ${url} failed with status ${e.response?.status}:`, e.response?.data ?? e.message);
    }
  }

  console.error(`All attempts to fetch mentorship ${id} failed:`, errors);
  const first = errors[0];
  const msg = `Failed to load mentorship (${id}). Last error: ${first?.status ?? 'unknown'} ${JSON.stringify(first?.data ?? first?.message)}`;
  throw new Error(msg);
};

/**
 * إنشاء منتورية جديدة
 */
export const createMentorship = async (data: Partial<MentorshipApiResponse>): Promise<MentorshipApiResponse> => {
  try {
    const response = await api.post<MentorshipApiResponse>(`${BASE}/mentorships`, data);
    return response.data;
  } catch (error) {
    console.error('Error creating mentorship:', error);
    throw error;
  }
};

/**
 * تحديث منتورية موجودة
 */
export const updateMentorship = async (mentorshipId: string | number, data: Partial<MentorshipApiResponse>): Promise<MentorshipApiResponse> => {
  try {
    const response = await api.put<MentorshipApiResponse>(`${BASE}/mentorships/${mentorshipId}`, data);
    return response.data;
  } catch (error) {
    console.error(`Error updating mentorship ${mentorshipId}:`, error);
    throw error;
  }
};

/**
 * حذف منتورية
 */
export const deleteMentorship = async (mentorshipId: string | number): Promise<void> => {
  try {
    await api.delete(`${BASE}/mentorships/${mentorshipId}`);
  } catch (error) {
    console.error(`Error deleting mentorship ${mentorshipId}:`, error);
    throw error;
  }
};

// --- Data extraction helper functions ---

/**
 * استخراج بيانات مخطط الإيرادات من استجابة API
 * يتعامل مع تنسيقات استجابة مختلفة
 */
export const extractRevenueChartData = (response: unknown): unknown[] => {
  if (!response) return [];

  // إذا كانت الاستجابة مصفوفة مباشرة
  if (Array.isArray(response)) {
    return response.filter((item) => item && typeof item === 'object');
  }

  // إذا كانت الاستجابة كائن يحتوي على مصفوفة
  const data = response as Record<string, unknown>;
  
  // البحث عن مصفوفة في الخصائص الشائعة
  const commonKeys = ['data', 'chart', 'values', 'points', 'series', 'revenueData', 'revenue_data', 'items', 'results'];
  for (const key of commonKeys) {
    if (Array.isArray(data[key])) {
      return (data[key] as unknown[]).filter((item) => item && typeof item === 'object');
    }
  }

  return [];
};

/**
 * استخراج بيانات الجلسات المقبلة من استجابة API
 * يتعامل مع تنسيقات استجابة مختلفة
 */
export const extractSessionsData = (response: unknown): unknown[] => {
  if (!response) return [];

  // إذا كانت الاستجابة مصفوفة مباشرة
  if (Array.isArray(response)) {
    return response.filter((item) => item && typeof item === 'object');
  }

  // إذا كانت الاستجابة كائن يحتوي على مصفوفة
  const data = response as Record<string, unknown>;
  
  // البحث عن مصفوفة في الخصائص الشائعة
  const commonKeys = ['sessions', 'data', 'items', 'results', 'upcomingSessions', 'upcoming_sessions', 'content'];
  for (const key of commonKeys) {
    if (Array.isArray(data[key])) {
      return (data[key] as unknown[]).filter((item) => item && typeof item === 'object');
    }
  }

  // تحقق من apiResponse.sessions
  if (data.apiResponse && typeof data.apiResponse === 'object') {
    const apiRes = data.apiResponse as Record<string, unknown>;
    if (Array.isArray(apiRes.sessions)) {
      return (apiRes.sessions as unknown[]).filter((item) => item && typeof item === 'object');
    }
  }

  return [];
};

/**
 * استخراج بيانات التقييمات من استجابة API
 * يتعامل مع تنسيقات استجابة مختلفة مثل apiResponse.reviews.content
 */
export const extractReviewsData = (response: unknown): unknown[] => {
  if (!response) return [];

  // إذا كانت الاستجابة مصفوفة مباشرة
  if (Array.isArray(response)) {
    return response.filter((item) => item && typeof item === 'object');
  }

  // إذا كانت الاستجابة كائن يحتوي على مصفوفة
  const data = response as Record<string, unknown>;
  
  // تحقق من apiResponse.reviews.content (الصيغة الشائعة)
  if (data.apiResponse && typeof data.apiResponse === 'object') {
    const apiRes = data.apiResponse as Record<string, unknown>;
    if (apiRes.reviews && typeof apiRes.reviews === 'object') {
      const reviews = apiRes.reviews as Record<string, unknown>;
      if (Array.isArray(reviews.content)) {
        return (reviews.content as unknown[]).filter((item) => item && typeof item === 'object');
      }
    }
  }

  // البحث عن مصفوفة في الخصائص الشائعة
  const commonKeys = ['reviews', 'data', 'items', 'results', 'content'];
  for (const key of commonKeys) {
    if (Array.isArray(data[key])) {
      return (data[key] as unknown[]).filter((item) => item && typeof item === 'object');
    }
  }

  return [];
};
