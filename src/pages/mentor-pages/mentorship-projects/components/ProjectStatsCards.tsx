import React from 'react';
import type { ProjectStatistics } from '../../../../services/projectService';

type Props = {
  stats: ProjectStatistics | null;
};

export const ProjectStatsCards: React.FC<Props> = ({ stats }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm flex items-center justify-between min-w-0">
        <div className="min-w-0 w-full">
          <p className="text-sm text-gray-500 font-medium truncate">Total Submissions</p>
          <h3 className="text-2xl font-bold mt-1 text-gray-900 truncate">{stats?.totalSubmissions || 0}</h3>
        </div>
      </div>

      <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm flex items-center justify-between min-w-0">
        <div className="min-w-0 w-full">
          <p className="text-sm text-gray-500 font-medium truncate">Pending Review</p>
          <h3 className="text-2xl font-bold mt-1 text-yellow-600 truncate">{stats?.pendingReview || 0}</h3>
        </div>
      </div>

      <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm flex items-center justify-between min-w-0">
        <div className="min-w-0 w-full">
          <p className="text-sm text-gray-500 font-medium truncate">Total Points</p>
          <h3 className="text-2xl font-bold mt-1 text-gray-900 truncate">{stats?.totalPoints || 0} pts</h3>
        </div>
      </div>

      <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm flex items-center justify-between min-w-0">
        <div className="min-w-0 w-full">
          <p className="text-sm text-gray-500 font-medium truncate">Deadline</p>
          <h3 className="text-base sm:text-lg font-bold mt-2 text-gray-900 break-words">
            {stats?.deadLine
              ? new Date(stats.deadLine).toLocaleDateString('en-GB', {
                  day: '2-digit',
                  month: 'short',
                  year: 'numeric',
                })
              : 'No Deadline'}
          </h3>
        </div>
      </div>
    </div>
  );
};

