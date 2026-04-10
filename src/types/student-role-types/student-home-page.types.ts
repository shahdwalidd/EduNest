// types/student-role-types/homepage.types.ts

// ── Raw API shapes ───────────────────────────────────────────────────────────

export interface ContinueLearningDto {
  mentorshipId:       number;
  title:              string;
  coverImageUrl:      string | null;
  mentorName:         string;
  progressPercentage: number;
  completedItems:     number;
  totalItems:         number;
}

export interface RecommendedMentorshipDto {
  id:                 number;
  title:              string;
  duration:           number;
  description:        string;
  coverImageUrl:      string | null;
  mentorName:         string;
  subtitle:           string;
  difficultyLevel:    'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED' | 'ALL_LEVEL';
  price:              number;
  discountPercentage: number;
  mentorEmail:        string;
}

export interface UpcomingItemDto {
  id:          number | string;
  type:        'MENTORSHIP' | 'ASSIGNMENT' | 'PROJECT' | 'QUIZ';
  title:       string;
  description?: string;
  dueDate?:    string;    // ISO
  startTime?:  string;    // ISO
  status:      'UPCOMING' | 'IN_PROGRESS' | 'COMPLETED';
}

export interface HomepageDataDto {
  continueLearning:       ContinueLearningDto[];
  recommendedMentorships: RecommendedMentorshipDto[];
  upcomingItems:          UpcomingItemDto[];
}

export interface HomepageApiResponse {
  apiResponse: {
    data:    HomepageDataDto;
    message: string;
  };
}

export interface DashboardStats {
  mentorshipSessions: number;   // MENTORSHIP type items
  projectDeadlines:   number;   // PROJECT type items
  assignments:        number;   // ASSIGNMENT type items
  totalUpcoming:      number;
}