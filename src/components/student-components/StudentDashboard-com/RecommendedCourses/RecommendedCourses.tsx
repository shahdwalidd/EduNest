
import type { FC } from 'react';
import { Link } from 'react-router-dom';
import RecommendedCourseCard from './CourseCard';
import type { Course } from '../../../../types/student-role-types/course.types';

interface RecommendedCoursesProps {
  courses: Course[];
  onAddToCart: (courseId: string) => void;
}

const RecommendedCourses: FC<RecommendedCoursesProps> = ({ 
  courses, 
  onAddToCart 
}) => {
  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-1">
            Recommended for you
          </h2>
          <p className="text-gray-600 text-sm">
            Curated programs to expand your potential.
          </p>
        </div>
        
        <Link
          to="/explore"
          className="text-sm font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1"
        >
          Explore more
          <span>→</span>
        </Link>
      </div>

      {/* Courses Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {courses.map((course) => (
          <RecommendedCourseCard
            key={course.id}
            course={course}
            onAddToCart={onAddToCart}
          />
        ))}
      </div>
    </div>
  );
};

export default RecommendedCourses;