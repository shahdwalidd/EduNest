
import type { FC } from 'react';
import Navbar             from '../../../components/student-components/common/Navbar/Navbar';
import Footer             from '../../../components/student-components/common/Footer/Footer';
import HeroSection        from '../../../components/student-components/StudentDashboard-com/HeroSection/HeroSection';
import ContinueLearning   from '../../../components/student-components/StudentDashboard-com/ContinueLearning/ContinueLearning';
import Timeline           from '../../../components/student-components/StudentDashboard-com/Timeline/Timeline';
import RecommendedCourses from '../../../components/student-components/StudentDashboard-com/RecommendedCourses/RecommendedCourses';
import Testimonials       from '../../../components/student-components/StudentDashboard-com/Testimonials/Testimonials';
import CTASection         from '../../../components/student-components/StudentDashboard-com/CTASection/CTASection';
import { useHomepage }    from '../../../hooks/student-roleHooks/Usehomepage';
import type { Testimonial } from '../../../types/student-role-types/testimonial.types';

// ── Static testimonials
const TESTIMONIALS: Testimonial[] = [
  {
    id:      '1',
    name:    'Marcus Thomas',
    role:    'Master of Business',
    company: 'EasyPay',
    avatar:  'https://i.pravatar.cc/150?img=12',
    rating:  5,
    content: 'The job placement mentorship at EduNest triggered the transition from a junior designer to a lead role. The curriculum is incredibly practical.',
  },
  {
    id:      '2',
    name:    'Elora Venus',
    role:    'Director of Learning',
    company: 'Tasker',
    avatar:  'https://i.pravatar.cc/150?img=45',
    rating:  5,
    content: "All of my daily struggles that I'm experiencing in the workplace now, they teach systems thinking and creative problem solving.",
  },
  {
    id:      '3',
    name:    'Jordan Black',
    role:    'Full Stack Developer',
    avatar:  'https://i.pravatar.cc/150?img=33',
    rating:  5,
    content: "The community support is what sets this platform apart! I've built a global network of peers that I still collaborate with on a weekly basis.",
  },
];

const StudentDashboard: FC = () => {
  const {
    continueLearning,
    recommended,
    timelineEvents,
    stats,
    loading,
    error,
  } = useHomepage();

  // Average progress across all active courses — shown in the hero card
  const averageProgress = continueLearning.length > 0
    ? continueLearning.reduce((sum, c) => sum + c.progress, 0) / continueLearning.length
    : 0;

  const handleResumeCourse = (courseId: string) => {
    console.log('Resume course:', courseId);
    // navigate(`/student/mentorships/${courseId}`);
  };

  const handleAddToCart = (courseId: string) => {
    console.log('Enroll:', courseId);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar — reads userName & userAvatar from authStore automatically */}
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">

        {/* Error banner */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-5 py-3 text-sm font-medium">
            ⚠️ {error}
          </div>
        )}

        {/* Hero */}
        <HeroSection
          stats={stats}
          averageProgress={averageProgress}
          loading={loading}
          onResume={() => continueLearning[0] && handleResumeCourse(continueLearning[0].id)}
          onSchedule={() => console.log('open schedule')}
        />

        {/* Continue Learning + Timeline */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            {loading ? (
              <div className="space-y-4">
                <div className="h-7 w-48 bg-gray-200 rounded animate-pulse" />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {[0, 1].map(i => (
                    <div key={i} className="h-48 bg-gray-200 rounded-xl animate-pulse" />
                  ))}
                </div>
              </div>
            ) : continueLearning.length > 0 ? (
              <ContinueLearning
                courses={continueLearning}
                onResumeCourse={handleResumeCourse}
              />
            ) : (
              <div className="bg-white rounded-xl p-8 text-center border border-gray-100">
                <p className="text-4xl mb-3">📚</p>
                <p className="font-semibold text-gray-700">No active courses yet</p>
                <p className="text-sm text-gray-400 mt-1">Enroll in a mentorship to get started</p>
              </div>
            )}
          </div>

          <div className="lg:col-span-1">
            {loading ? (
              <div className="h-72 bg-gray-200 rounded-xl animate-pulse" />
            ) : (
              <Timeline events={timelineEvents} />
            )}
          </div>
        </div>

        {/* Recommended */}
        {loading ? (
          <div className="space-y-4">
            <div className="h-7 w-56 bg-gray-200 rounded animate-pulse" />
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[0, 1, 2].map(i => (
                <div key={i} className="h-64 bg-gray-200 rounded-xl animate-pulse" />
              ))}
            </div>
          </div>
        ) : recommended.length > 0 ? (
          <RecommendedCourses
            courses={recommended}
            onAddToCart={handleAddToCart}
          />
        ) : null}

        <Testimonials testimonials={TESTIMONIALS} />
        <CTASection />
      </main>

      <Footer />
    </div>
  );
};

export default StudentDashboard;