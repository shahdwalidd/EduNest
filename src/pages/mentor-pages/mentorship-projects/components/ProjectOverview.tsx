import React from 'react';
import { buildFullFileUrl } from '../../../../utils/fileUrl';
import type { ProjectStatistics } from '../../../../services/projectService';
import FileViewer from '../../../../components/common/FileViewer';

type Props = {
  stats: ProjectStatistics | null;
};

export const ProjectOverview: React.FC<Props> = ({ stats }) => {
  if (!stats) return null;

  const hasOverview = Boolean(
    stats.goal || stats.brief || stats.attachmentUrl || stats.uploadedAttachmentPath
  );
  if (!hasOverview) return null;

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 space-y-4">
      <h2 className="text-lg font-bold text-gray-900">Project Overview</h2>

      {/* الصف الأول: Goal و Brief بجانب بعضهما */}
      {(stats.goal || stats.brief) && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {stats.goal && (
            <div className="bg-slate-50 rounded-xl p-4">
              <p className="text-sm text-gray-500">Goal</p>
              <p className="mt-2 text-gray-900">{stats.goal}</p>
            </div>
          )}

          {stats.brief && (
            <div className="bg-slate-50 rounded-xl p-4">
              <p className="text-sm text-gray-500">Brief</p>
              <p className="mt-2 text-gray-900">{stats.brief}</p>
            </div>
          )}
        </div>
      )}

      {/* الصف الثاني: أدوات عرض الملفات بجانب بعضها */}
      {(stats.attachmentUrl || stats.uploadedAttachmentPath) && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {stats.attachmentUrl && (
            <div className="space-y-2">
              <p className="text-sm font-semibold text-blue-700">Description</p>
              <div className="h-[320px]">
                <FileViewer url={buildFullFileUrl(stats.attachmentUrl)} height="h-[250px]" />
              </div>
            </div>
          )}

          {stats.uploadedAttachmentPath && (
            <div className="space-y-2">
              <p className="text-sm font-semibold text-emerald-700">Attachment</p>
              <div className="h-[320px]">
                <FileViewer
                  url={buildFullFileUrl(stats.uploadedAttachmentPath)}
                  height="h-[250px]"
                />
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};