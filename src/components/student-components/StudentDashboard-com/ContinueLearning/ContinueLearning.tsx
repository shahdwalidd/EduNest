

import  type { FC } from 'react';
import { Link } from 'react-router-dom';
import CourseCard from './CourseCard';
import type { Course } from '../../../../types/student-role-types/course.types';

interface ContinueLearningProps {
  courses: Course[];
  onResumeCourse: (courseId: string) => void;
}

const ContinueLearning: FC<ContinueLearningProps> = ({ 
  courses, 
  onResumeCourse 
}) => {
  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-1">
            Continue Learning
          </h2>
          <p className="text-gray-600 text-sm">
            Pick up where you left off in your active programs.
          </p>
        </div>
        
        <Link
          to="/my-courses"
          className="text-sm font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1"
        >
          View all courses
          <span>→</span>
        </Link>
      </div>

      {/* Courses Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {courses.map((course) => (
          <CourseCard
            key={course.id}
            course={course}
            onResume={onResumeCourse}
          />
        ))}
      </div>
    </div>
  );
};

export default ContinueLearning;