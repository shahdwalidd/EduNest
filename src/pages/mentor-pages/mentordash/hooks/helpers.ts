import type { Notification } from '../../../../types/mentornotification.types';

export interface PaginationMeta {
  page: number;
  totalPages: number;
  totalElements: number;
}

export const DEFAULT_PAGINATION: PaginationMeta = {
  page: 0,
  totalPages: 1,
  totalElements: 0,
};

export function getErrorMessage(e: unknown): string {
  if (!e) return 'Failed to load data';
  if (typeof e === 'string') return e;
  if (typeof e === 'object' && e !== null) {
    const obj = e as Record<string, unknown>;
    if (typeof obj.message === 'string' && obj.message) return obj.message;
    if (typeof obj.error   === 'string' && obj.error)   return obj.error;
  }
  return 'Failed to load data';
}

export function parsePaginationMeta(raw: Record<string, unknown>, page: number): PaginationMeta {
  return {
    page:          Number(raw.page          ?? page),
    totalPages:    Number(raw.totalPages    ?? 1),
    totalElements: Number(raw.totalElements ?? 0),
  };
}

export type NotificationSetter = (updater: (prev: Notification[]) => Notification[] ) => void;
