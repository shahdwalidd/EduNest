import React from 'react';
import { ArrowLeft, Edit } from 'lucide-react';

type Props = {
  projectTitle: string;
  onBack: () => void;
  onEdit: () => void;
};

export const ProjectDetailHeader: React.FC<Props> = ({ projectTitle, onBack, onEdit }) => {
  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
      <div className="min-w-0 flex-1">
        <div
          className="flex items-start gap-2 cursor-pointer text-gray-600 hover:text-gray-900"
          onClick={onBack}
        >
          <ArrowLeft size={20} className="mt-2.5 flex-shrink-0" />
          <h1 className="break-all text-xl sm:text-2xl font-bold text-gray-900 break-words whitespace-normal leading-tight">
            {projectTitle}
          </h1>
        </div>
        <div className="text-sm text-gray-500 mt-1 pl-7">
          <p className="break-words">Review student submissions and statistics</p>
        </div>
      </div>

      <div className="flex items-center gap-3 w-full sm:w-auto flex-shrink-0">
        <button
          type="button"
          onClick={onEdit}
          className="flex items-center justify-center gap-2 w-full sm:w-auto px-4 py-2 text-sm font-medium text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors"
        >
          <Edit size={16} />
          Edit
        </button>
      </div>
    </div>
  );
};

