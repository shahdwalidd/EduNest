import React from 'react';
import { type TaskSubmission, type ProjectStatistics } from '../../../../services/projectService';

type Props = {
  isOpen: boolean;
  stats: ProjectStatistics | null;
  activeSubmission: TaskSubmission | null;
  score: number | string;
  feedback: string;
  isSubmitting: boolean;
  onClose: () => void;
  onChangeScore: (value: number | string) => void;
  onChangeFeedback: (value: string) => void;
  onSubmit: () => Promise<void> | void;
};

export const GradeSubmissionModal: React.FC<Props> = ({
  isOpen,
  stats,
  activeSubmission,
  score,
  feedback,
  isSubmitting,
  onClose,
  onChangeScore,
  onChangeFeedback,
  onSubmit,
}) => {
  if (!isOpen || !activeSubmission) return null;

  const totalPoints = stats?.totalPoints || 100;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4 overflow-y-auto">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden flex flex-col my-auto">
        <div className="p-5 sm:p-6 border-b border-gray-100 bg-[var(--primary-500)] bg-indigo-600 text-white">
          <h3 className="text-lg sm:text-xl font-bold">Grade Submission</h3>
          <p className="text-sm opacity-90 mt-1 break-words">
            Student: <span className="font-semibold">{activeSubmission.studentFullName}</span>
          </p>
        </div>

        <div className="p-5 sm:p-6 overflow-y-auto space-y-4 max-h-[60vh]">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Score (Out of {totalPoints})</label>
            <input
              type="number"
              value={score}
              onChange={(e) => onChangeScore(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
              placeholder="Enter score"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Feedback</label>
            <textarea
              value={feedback}
              onChange={(e) => onChangeFeedback(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all min-h-[120px] resize-y"
              placeholder="Provide constructive feedback..."
            />
          </div>
        </div>

        <div className="p-5 sm:p-6 border-t border-gray-100 flex flex-col sm:flex-row justify-end gap-3 bg-gray-50">
          <button
            onClick={onClose}
            className="w-full sm:w-auto order-2 sm:order-1 px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium"
            disabled={isSubmitting}
          >
            Cancel
          </button>

          <button
            onClick={() => onSubmit()}
            className="w-full sm:w-auto order-1 sm:order-2 px-4 py-2 text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors font-medium flex items-center justify-center gap-2 disabled:opacity-50"
            disabled={isSubmitting || score === ''}
          >
            {isSubmitting ? 'Saving...' : 'Submit Grade'}
          </button>
        </div>
      </div>
    </div>
  );
};

