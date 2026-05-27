import type { LucideIcon } from 'lucide-react';

import type { StudentActivity } from './RecentActivity.types';

import {
  Award,
  BadgeCheck,
  BookOpen,
  CheckCircle,
  Clock3,
  FileText,
  HelpCircle,
  MessageCircle,
  Star,
  Trophy as TrophyIcon,
  UserPlus,
  Bell,
} from 'lucide-react';

/**
 * =========================================================
 * Activity Config
 * =========================================================
 */

type ActivityConfig = {
  icon: LucideIcon;
  color: string;
};

export const ACTIVITY_CONFIG: Record<string, ActivityConfig> = {
  submission: {
    icon: FileText,
    color: 'bg-[var(--primary-500)]',
  },
  question: {
    icon: HelpCircle,
    color: 'bg-[var(--primary-500)]',
  },
  completion: {
    icon: CheckCircle,
    color: 'bg-[var(--primary-500)]',
  },
  badge: {
    icon: BadgeCheck,
    color: 'bg-[var(--primary-500)]',
  },
  joined: {
    icon: UserPlus,
    color: 'bg-[var(--primary-500)]',
  },
  review: {
    icon: Star,
    color: 'bg-[var(--primary-500)]',
  },
  achievement: {
    icon: TrophyIcon,
    color: 'bg-[var(--primary-500)]',
  },
  comment: {
    icon: MessageCircle,
    color: 'bg-[var(--primary-500)]',
  },
  course: {
    icon: BookOpen,
    color: 'bg-[var(--primary-500)]',
  },
  reminder: {
    icon: Clock3,
    color: 'bg-[var(--primary-500)]',
  },
  certificate: {
    icon: Award,
    color: 'bg-[var(--primary-500)]',
  },
  default: {
    icon: Bell,
    color: 'bg-[var(--primary-500)]',
  },
};

/**
 * =========================================================
 * Smart Activity Detector
 * =========================================================
 */

export const detectActivityType = (activity: StudentActivity): string => {
  const text = `
    ${activity.type || ''}
    ${activity.action || ''}
    ${activity.mentorshipTitle || ''}
  `
    .toLowerCase()
    .trim();

  // Badge
  if (
    text.includes('badge') ||
    text.includes('award badge') ||
    text.includes('admin badge')
  ) {
    return 'badge';
  }

  // Joined mentorship
  if (
    text.includes('joined') ||
    text.includes('join') ||
    text.includes('enrolled')
  ) {
    return 'joined';
  }

  // Review
  if (
    text.includes('review') ||
    text.includes('rating') ||
    text.includes('feedback')
  ) {
    return 'review';
  }

  // Achievement
  if (
    text.includes('achievement') ||
    text.includes('won') ||
    text.includes('trophy')
  ) {
    return 'achievement';
  }

  // Comment
  if (
    text.includes('comment') ||
    text.includes('reply') ||
    text.includes('message')
  ) {
    return 'comment';
  }

  // Course
  if (
    text.includes('course') ||
    text.includes('lesson')
  ) {
    return 'course';
  }

  // Reminder
  if (
    text.includes('reminder') ||
    text.includes('pending')
  ) {
    return 'reminder';
  }

  // Certificate
  if (text.includes('certificate')) {
    return 'certificate';
  }

  // fallback to original type
  return activity.type?.toLowerCase() || 'default';
};

/**
 * =========================================================
 * Relative Time
 * =========================================================
 */

export const getRelativeTime = (timestamp: string) => {
  if (!timestamp) return 'Just now';

  const dateString = timestamp.endsWith('Z') ? timestamp : `${timestamp}Z`;
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return 'Just now';

  const now = new Date();
  const diffInMs = now.getTime() - date.getTime();
  const seconds = Math.floor(diffInMs / 1000);

  if (seconds < 60) return 'Just now';

  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;

  const days = Math.floor(hours / 24);
  return `${days}d ago`;
};

