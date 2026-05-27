
import api from './api';

export class ApiValidationError extends Error {
  fieldErrors: Record<string, string>;

  constructor(message: string, fieldErrors: Record<string, string>) {
    super(message);
    this.name = 'ApiValidationError';
    this.fieldErrors = fieldErrors;
  }
}

const getValidationFieldErrors = (error: unknown): Record<string, string> | null => {
  const err = error as { response?: { data?: unknown }; message?: string };
  const data = err?.response?.data;
  if (data && typeof data === 'object' && data !== null && 'errorMessages' in data) {
    const messages = (data as { errorMessages?: Record<string, string> }).errorMessages;
    if (messages && typeof messages === 'object') {
      return messages;
    }
  }
  return null;
};

// ── Error extractor — handles all backend error shapes ───────────────────────
const extractError = (error: unknown): string => {
  const err = error as {
    response?: {
      data?: {
        errorMessages?: Record<string, unknown>;
        apiResponse?:   { message?: string };
        message?:       string;
      }
    };
    message?: string;
  };
  const data = err?.response?.data;
  if (data?.errorMessages && typeof data.errorMessages === 'object') {
    const firstValue = Object.values(data.errorMessages)[0];
    if (typeof firstValue === 'string') return firstValue;
    if (typeof firstValue === 'object') return JSON.stringify(firstValue);
  }
  if (data?.apiResponse?.message)       return data.apiResponse.message;
  if (data?.message)                    return data.message;
  if (typeof data === 'string')         return data;
  if (err?.message)                     return err.message;
  return 'Something went wrong';
};

const handleRequest = async <T>(req: Promise<{ data: T }>): Promise<T> => {
  try { return (await req).data; }
  catch (error) {
    const fieldErrors = getValidationFieldErrors(error);
    if (fieldErrors && Object.keys(fieldErrors).length > 0) {
      const message = Object.values(fieldErrors)[0] ?? 'Validation failed';
      throw new ApiValidationError(message, fieldErrors);
    }
    throw extractError(error);
  }
};

export type BadgeCategory =
  | 'ACHIEVEMENT' | 'PERFORMANCE' | 'CONSISTENCY' | 'PROBLEM_SOLVING'
  | 'CREATIVITY'  | 'LEADERSHIP'  | 'COMMUNITY'   | 'SPECIAL_RECOGNITION';

export interface BadgeDto {
  id:           number;
  mentorshipId: number;
  title:        string;
  category:     BadgeCategory;
  description:  string;
  points:       number;
}

export interface CreateBadgeInput {
  title:       string;
  category:    BadgeCategory;
  description: string;
  points:      number;
}

export interface AwardInput {
  studentId: number;
  note?:     string;
}

// GET /api/v1/badges/mentorship/{mentorshipId}
export const getBadgesByMentorship = (mentorshipId: string | number) =>
  handleRequest(api.get(`api/v1/badges/mentorship/${mentorshipId}`)) as
    Promise<{ apiResponse: { badges: BadgeDto[]; message?: string } }>;

// POST /api/v1/badges/mentorship/{mentorshipId}
export const createBadge = (mentorshipId: string | number, data: CreateBadgeInput) =>
  handleRequest(api.post(`api/v1/badges/mentorship/${mentorshipId}`, data)) as
    Promise<{ apiResponse: { badge: BadgeDto; message?: string } }>;

// PATCH /api/v1/badges/{badgeId}
export const updateBadge = (badgeId: number, data: Partial<CreateBadgeInput>) =>
  handleRequest(api.patch(`api/v1/badges/${badgeId}`, data)) as
    Promise<{ apiResponse: { badge: BadgeDto; message?: string } }>;

// DELETE /api/v1/badges/{badgeId}   (400 if already awarded)
export const deleteBadge = (badgeId: number) =>
  handleRequest(api.delete(`api/v1/badges/${badgeId}`)) as
    Promise<{ apiResponse?: { message?: string } }>;

// POST /api/v1/badge-awards/{badgeId}/award
export const awardBadge = (badgeId: number, data: AwardInput) =>
  handleRequest(api.post(`api/v1/badge-awards/${badgeId}/award`, data)) as
    Promise<{ apiResponse: { award: { id: number; badgeTitle: string; badgePoints: number; message?: string }; message?: string } }>;