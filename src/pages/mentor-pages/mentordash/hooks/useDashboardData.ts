import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../../../store/authStore';
import {
  getMentorDashboard,
  getDashboardReviews,
  getDashboardSessions,
  type MentorDashboardParams,
  type MentorDashboardResponse,
} from '../../../../services/mentorDashboardService';
import {
  isApiErrorResponse,
  extractCardsData,
  mapSessions,
  mapReviews,
  mapRevenueChart,
  mapNotifications,
} from '../utils/mappers';
import { DEFAULT_PAGINATION, getErrorMessage, parsePaginationMeta, type PaginationMeta } from './helpers';
import { useNotificationsSocket } from './useNotificationsSocket';
import type { DashboardCardsData } from '../types';
import type { Session } from '../../../../components/mentor-components/mentor-dash-com/ScheduledSessions/ScheduledSessions.types';
import type { Review } from '../../../../components/mentor-components/mentor-dash-com/Reviews/Reviews.types';
import type { SalesData } from '../../../../components/mentor-components/mentor-dash-com/SalesChart/SalesChart.types';
import type { Notification } from '../../../../types/mentornotification.types';

type AnyDashboard = MentorDashboardResponse & { dashboard?: unknown; data?: unknown };

export const useDashboardData = () => {
  const navigate = useNavigate();
  const token      = useAuthStore((s) => s.token);
  const isHydrated = useAuthStore((s) => s.isHydrated);
  const logout     = useAuthStore((s) => s.logout);
  const userName   = useAuthStore((s) => s.userName);

  const displayName = userName?.trim().split(/\s+/)[0] || userName || 'Mentor';
  const welcomeDate = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  // ─── Grouped States ────────────────────────────────────────────────────────
  const [mainData, setMainData] = useState({
    cards: null as DashboardCardsData | null,
    revenueData: [] as SalesData[],
    notifications: [] as Notification[],
    pagination: DEFAULT_PAGINATION,
    loading: true,
    error: null as string | null,
  });

  const [reviewsState, setReviewsState] = useState({
    data: [] as Review[],
    pagination: DEFAULT_PAGINATION,
    loading: false,
    error: null as string | null,
  });

  const [sessionsState, setSessionsState] = useState({
    data: [] as Session[],
    pagination: DEFAULT_PAGINATION,
    loading: false,
    error: null as string | null,
  });

  // ─── Race Condition Guard Refs ─────────────────────────────────────────────
  const reviewsReqId = useRef(0);
  const sessionsReqId = useRef(0);
  const notificationsReqId = useRef(0);

  // ─── Section Fetches (Callbacks) ───────────────────────────────────────────
  const fetchReviews = useCallback(
    (page: number) => {
      if (!isHydrated || !token) return;
      const requestId = ++reviewsReqId.current;

      setReviewsState((prev) => ({ ...prev, loading: true, error: null }));

      getDashboardReviews(page)
        .then((res) => {
          if (requestId !== reviewsReqId.current) return;

          const reviewsObj = (res as { apiResponse?: { reviews?: Record<string, unknown> } })
            ?.apiResponse?.reviews;

          if (!reviewsObj) throw new Error('Invalid reviews response');
          const content = Array.isArray(reviewsObj.content) ? reviewsObj.content : [];

          setReviewsState({
            data: mapReviews({ content }),
            pagination: parsePaginationMeta(reviewsObj, page),
            loading: false,
            error: null,
          });
        })
        .catch((err) => {
          if (requestId !== reviewsReqId.current) return;
          setReviewsState((prev) => ({ ...prev, loading: false, error: getErrorMessage(err) }));
        });
    },
    [isHydrated, token],
  );

  const fetchSessions = useCallback(
    (page: number) => {
      if (!isHydrated || !token) return;
      const requestId = ++sessionsReqId.current;

      setSessionsState((prev) => ({ ...prev, loading: true, error: null }));

      getDashboardSessions(page)
        .then((res) => {
          if (requestId !== sessionsReqId.current) return;

          const sessionsObj = (res as { apiResponse?: { sessions?: Record<string, unknown> } })
            ?.apiResponse?.sessions;

          if (!sessionsObj) throw new Error('Invalid sessions response');
          const content = Array.isArray(sessionsObj.content) ? sessionsObj.content : [];

          setSessionsState({
            data: mapSessions({ content }),
            pagination: parsePaginationMeta(sessionsObj, page),
            loading: false,
            error: null,
          });
        })
        .catch((err) => {
          if (requestId !== sessionsReqId.current) return;
          setSessionsState((prev) => ({ ...prev, loading: false, error: getErrorMessage(err) }));
        });
    },
    [isHydrated, token],
  );

  // ─── Initial Combined Load ──────────────────────────────────────────────────
  useEffect(() => {
    if (!isHydrated || !token) return;
    let cancelled = false;

    setMainData((prev) => ({ ...prev, loading: true, error: null }));

    const params: MentorDashboardParams = {
      notificationPage: 0,
      notificationSize: 3,
      reviewPage: 0,
      reviewSize: 1,
      sessionPage: 0,
      sessionSize: 1,
    };

    getMentorDashboard(params)
      .then((res) => {
        if (cancelled) return;
        if (!res || typeof res !== 'object') throw new Error('Unexpected response');
        if (isApiErrorResponse(res)) throw res;

        const r = res as AnyDashboard;
        const dashboardObj = r.apiResponse?.dashboard ?? r.dashboard ?? {};
        const dashObj = dashboardObj as Record<string, unknown>;

        setMainData({
          cards: extractCardsData(dashboardObj),
          revenueData: mapRevenueChart(dashObj.salesChart) || [],
          notifications: mapNotifications(dashObj.notifications),
          pagination: parsePaginationMeta((dashObj.notifications as Record<string, unknown>) || {}, 0),
          loading: false,
          error: null,
        });
      })
      .catch((err) => {
        if (cancelled) return;
        const message = getErrorMessage(err);
        setMainData((prev) => ({ ...prev, loading: false, error: message }));
        
        if (/invalid jwt|jwt token|unauthorized/i.test(message)) {
          logout();
          navigate('/login');
        }
      });

    // Parallel fetch initialization
    fetchReviews(0);
    fetchSessions(0);

    return () => {
      cancelled = true;
    };
  }, [token, isHydrated, navigate, logout, fetchReviews, fetchSessions]);

  // ─── Pagination Handlers ────────────────────────────────────────────────────
  const handleNotificationPageChange = useCallback(
    (page: number) => {
      if (!isHydrated || !token) return;
      const requestId = ++notificationsReqId.current;

      getMentorDashboard({
        notificationPage: page,
        notificationSize: 3,
        reviewPage: 0, reviewSize: 1,
        sessionPage: 0, sessionSize: 1,
      })
        .then((res) => {
          if (requestId !== notificationsReqId.current) return;

          const r = res as AnyDashboard;
          const dashObj = (r.apiResponse?.dashboard ?? r.dashboard ?? {}) as Record<string, unknown>;
          const notisRaw = dashObj.notifications as Record<string, unknown> | undefined;

          setMainData((prev) => ({
            ...prev,
            notifications: mapNotifications(dashObj.notifications),
            pagination: parsePaginationMeta(notisRaw || {}, page),
          }));
        })
        .catch((err) => {
          if (requestId !== notificationsReqId.current) return;
          setMainData((prev) => ({ ...prev, error: getErrorMessage(err) }));
        });
    },
    [isHydrated, token],
  );

  // ─── WebSockets Compatibility Wrappers ──────────────────────────────────────
  const setNotificationsWrapper = useCallback((updater: (prev: Notification[]) => Notification[]) => {
    setMainData((prev) => ({ ...prev, notifications: updater(prev.notifications) }));
  }, []);

  const setNotificationPaginationWrapper = useCallback((updater: (prev: PaginationMeta) => PaginationMeta) => {
    setMainData((prev) => ({ ...prev, pagination: updater(prev.pagination) }));
  }, []);

  useNotificationsSocket(token, isHydrated, setNotificationsWrapper, setNotificationPaginationWrapper);

  // ─── Return Clean API ───────────────────────────────────────────────────────
  return {
    // Data
    cards:         mainData.cards,
    sessions:      sessionsState.data,
    reviews:       reviewsState.data,
    revenueData:   mainData.revenueData,
    notifications: mainData.notifications,

    // Global Status
    loading: mainData.loading,
    error:   mainData.error,

    // Inline Statuses
    reviewsLoading:  reviewsState.loading,
    sessionsLoading: sessionsState.loading,
    reviewsError:    reviewsState.error,
    sessionsError:   sessionsState.error,

    // Auth Metadata
    isHydrated,
    displayName,
    welcomeDate,

    // Pagination Metadata
    reviewPagination:       reviewsState.pagination,
    sessionPagination:      sessionsState.pagination,
    notificationPagination: mainData.pagination,

    // Handlers
    handleReviewPageChange:  fetchReviews,
    handleSessionPageChange: fetchSessions,
    handleNotificationPageChange,
  };
};