
import type { FC } from 'react';
import type { Student } from '../../../types/viewStudent.types';

interface ProfileHeaderProps {
  student: Student;
  onMail?: () => void;
  onChat?: () => void;
}

const ProfileHeader: FC<ProfileHeaderProps> = ({ student, onMail, onChat }) => {
  const avatarSrc = student.avatar
    ? student.avatar.startsWith('http')
      ? student.avatar
      : `http://localhost:8080${student.avatar}`
    : null;

  const coverSrc = student.coverImage
    ? student.coverImage.startsWith('http')
      ? student.coverImage
      : `http://localhost:8080${student.coverImage}`
    : null;

  return (
    <div className="overflow-hidden">
      {/* Cover */}
      <div className="h-36 relative" style={{ background: 'linear-gradient(to bottom right, #0f5e8b, #0d4a6f)' }}>
        {coverSrc && (
          <img src={coverSrc} alt="Cover" className="w-full h-full object-cover" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
      </div>

      {/* Avatar + Actions */}
      <div className="px-6 pb-5">
        <div className="flex items-end justify-between -mt-12 mb-4">
          {/* Avatar */}
          <div className="relative">
            <div className="w-24 h-24 rounded-full border-4 border-white shadow-lg overflow-hidden" style={{ background: 'linear-gradient(to bottom right, #0f5e8b, #0d4a6f)' }}>
              {avatarSrc ? (
                <img
                  src={avatarSrc}
                  alt={student.name}
                  className="w-full h-full object-cover"
                  onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <span className="text-white font-bold text-3xl">
                    {student.name.charAt(0).toUpperCase()}
                  </span>
                </div>
              )}
            </div>
            {/* Online dot */}
            <span className="absolute bottom-1 right-1 w-3.5 h-3.5 bg-emerald-400 border-2 border-white rounded-full" />
          </div>

          {/* Action buttons */}
          <div className="flex gap-2">
            <button
              onClick={onMail}
              className="px-3 py-2 bg-white border border-gray-200 rounded-xl text-xs font-semibold text-gray-600 hover:bg-gray-50 hover:border-gray-300 transition-all flex items-center gap-1.5 shadow-sm"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              Mail
            </button>
            <button
              onClick={onChat}
              className="px-3 py-2 text-white rounded-xl text-xs font-semibold hover:opacity-90 transition-all flex items-center gap-1.5 shadow-sm"
              style={{ backgroundColor: '#0f5e8b' }}
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              Chat
            </button>
          </div>
        </div>

        <h2 className="text-xl font-bold text-gray-900 leading-tight">{student.name}</h2>
        <p className="text-sm text-gray-400 mt-0.5">{student.email}</p>
      </div>
    </div>
  );
};

export default ProfileHeader;