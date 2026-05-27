
import { useState, useCallback } from 'react';
import {
  ApiValidationError,
  getBadgesByMentorship, createBadge, updateBadge, deleteBadge, awardBadge,
  type BadgeDto, type CreateBadgeInput, type AwardInput,
} from '../services/Badgesservice';

export interface BadgeToast {
  id:      number;
  message: string;
  type:    'success' | 'error';
}

export const useBadges = (mentorshipId: string) => {
  const [badges,      setBadges      ] = useState<BadgeDto[]>([]);
  const [loading,     setLoading     ] = useState(false);
  const [saving,      setSaving      ] = useState(false);
  const [toasts,      setToasts      ] = useState<BadgeToast[]>([]);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const clearFieldErrors = useCallback(() => setFieldErrors({}), []);

  // ── handleRequest now throws a string or ApiValidationError — catch and display it ─────
  const addToast = useCallback((message: string, type: 'success' | 'error') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 4000);
  }, []);

  const fetchBadges = useCallback(async () => {
    if (!mentorshipId) return;
    clearFieldErrors();
    setLoading(true);
    try {
      const res = await getBadgesByMentorship(mentorshipId);
      setBadges(res.apiResponse?.badges ?? []);
    } catch (e) {
      clearFieldErrors();
      addToast(String(e), 'error');
    } finally { setLoading(false); }
  }, [mentorshipId, addToast, clearFieldErrors]);

  const create = useCallback(async (data: CreateBadgeInput): Promise<boolean> => {
    clearFieldErrors();
    setSaving(true);
    try {
      const res   = await createBadge(mentorshipId, data);
      const badge = res.apiResponse?.badge;
      const msg   = res.apiResponse?.message ?? (badge ? `Badge "${badge.title}" created successfully` : 'Badge created successfully');
      if (badge) setBadges(prev => [...prev, badge]);
      addToast(msg, 'success');
      return true;
    } catch (e) {
      if (e instanceof ApiValidationError) {
        setFieldErrors(e.fieldErrors);
        addToast(e.message, 'error');
      } else {
        addToast(String(e), 'error');
      }
      return false;
    } finally { setSaving(false); }
  }, [mentorshipId, addToast, clearFieldErrors]);

  const update = useCallback(async (badgeId: number, data: Partial<CreateBadgeInput>): Promise<boolean> => {
    clearFieldErrors();
    setSaving(true);
    try {
      const res     = await updateBadge(badgeId, data);
      const updated = res.apiResponse?.badge;
      const msg     = res.apiResponse?.message ?? `Badge updated successfully`;
      if (updated) setBadges(prev => prev.map(b => b.id === badgeId ? updated : b));
      addToast(msg, 'success');
      return true;
    } catch (e) {
      if (e instanceof ApiValidationError) {
        setFieldErrors(e.fieldErrors);
        addToast(e.message, 'error');
      } else {
        addToast(String(e), 'error');
      }
      return false;
    } finally { setSaving(false); }
  }, [addToast, clearFieldErrors]);

  const remove = useCallback(async (badgeId: number): Promise<boolean> => {
    clearFieldErrors();
    setSaving(true);
    try {
      const res = await deleteBadge(badgeId);
      setBadges(prev => prev.filter(b => b.id !== badgeId));
      const msg = res.apiResponse?.message ?? 'Badge deleted successfully';
      addToast(msg, 'success');
      return true;
    } catch (e) {
      if (e instanceof ApiValidationError) {
        setFieldErrors(e.fieldErrors);
        addToast(e.message, 'error');
      } else {
        addToast(String(e), 'error');
      }
      return false;
    } finally { setSaving(false); }
  }, [addToast, clearFieldErrors]);

  const award = useCallback(async (badgeId: number, input: AwardInput): Promise<boolean> => {
    clearFieldErrors();
    setSaving(true);
    try {
      const res = await awardBadge(badgeId, input);
      const msg = res.apiResponse?.message ??
        (res.apiResponse?.award ? `Badge "${res.apiResponse.award.badgeTitle}" awarded successfully!` : 'Badge awarded successfully');
      addToast(msg, 'success');
      return true;
    } catch (e) {
      if (e instanceof ApiValidationError) {
        setFieldErrors(e.fieldErrors);
        addToast(e.message, 'error');
      } else {
        addToast(String(e), 'error');
      }
      return false;
    } finally { setSaving(false); }
  }, [addToast, clearFieldErrors]);

  return { badges, loading, saving, toasts, fieldErrors, clearFieldErrors, fetchBadges, create, update, remove, award, addToast };
};