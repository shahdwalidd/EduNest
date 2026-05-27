
import type { FC } from 'react';
import { useState, useEffect, useRef } from 'react';
import { Bell, ChevronDown, Menu, User, Settings, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuthStore } from '../../../../store/authStore';
import type { MentorNavbarProps } from './MentorNavbar.types';

const MentorNavbar: FC<MentorNavbarProps & { onMenuClick?: () => void }> = ({
  pageTitle = 'Dashboard',
  notificationCount = 0,
  onNotificationClick,
  onProfileClick,
  onMenuClick,
}) => {
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const profileMenuRef = useRef<HTMLDivElement>(null);

  const navigate = useNavigate();
  const logout = useAuthStore((s) => s.logout);
  const userEmail = useAuthStore((s) => s.userEmail);
  const userName = useAuthStore((s) => s.userName);
  const userAvatar = useAuthStore((s) => s.userAvatar);

  // Local cached avatar to prevent flicker when `userAvatar` briefly becomes empty
  const [avatarSrc, setAvatarSrc] = useState<string | null>(userAvatar || null);

  const firstName = userName?.trim().split(/\s+/)[0] || 'Mentor';


  // Preload and commit avatar when available
  useEffect(() => {
    if (!userAvatar) return;
    const img = new Image();
    img.src = userAvatar;
    img.onload = () => setAvatarSrc(userAvatar);
    // if image fails to load, keep previous avatarSrc
    // no need to cleanup the Image object
  }, [userAvatar]);

  const handleLogout = () => {
    setIsProfileMenuOpen(false);
    logout();
    toast.success('You have been logged out. See you soon!', {
      duration: 2000,
      position: 'top-center',
    });
    navigate('/', { replace: true });
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target as Node)) {
        setIsProfileMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleMenuAction = (path: string, callback?: () => void) => {
    setIsProfileMenuOpen(false);
    if (callback) callback();
    navigate(path);
  };

  return (
    <nav className="bg-white dark:bg-[var(--dark-bg)] border-b border-gray-200/50 dark:border-gray-700/50 h-[65px] flex items-center px-4 md:px-8 sticky top-0 z-30">

      {/* 2. Main Navbar Content */}
      <div className="flex items-center justify-between w-full gap-2">

        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <button
            onClick={onMenuClick}
            className="lg:hidden p-1.5 bg-[var(--sidebar-bg)] dark:bg-gray-800 text-white rounded-md flex-shrink-0"
          >
            <Menu size={18} />
          </button>
          <h2 className="text-md truncate flex items-center gap-1 text-gray-900 dark:text-gray-100">
            {pageTitle.split('/').map((part, index) => (
              <span key={index} className="flex items-center gap-1">
                <span className={index === 0 ? 'font-bold' : ' text-gray-500 dark:text-gray-400'}>
                  {part.trim()}
                </span>
                {index < pageTitle.split('/').length - 1 && (
                  <span className="font-light text-gray-400 dark:text-gray-500">/</span>
                )}
              </span>
            ))}
          </h2>
        </div>

        <div className="flex items-center gap-1.5 sm:gap-4 md:gap-6 flex-shrink-0">

          {/* notifications */}
          <button
            onClick={() => {
              onNotificationClick?.();
              navigate('/mentor/notifications');
            }}
            className="relative h-[32px] w-[32px] sm:h-[34px] sm:w-[34px] flex items-center justify-center rounded-lg border border-gray-200/50 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 flex-shrink-0"
          >
            <Bell className="w-4 h-4 text-gray-700" strokeWidth={2} />
            {notificationCount > 0 && (
              <span className="absolute top-1 right-1 w-1.5 h-1.5 bg-red-500 rounded-full" />
            )}
          </button>

          {/* profile */}
          <div className="relative" ref={profileMenuRef}>
            <button
              onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
              className="flex items-center gap-1.5 sm:gap-3 px-1.5 sm:px-3 py-1.5 h-[42px] rounded-lg border border-gray-200/50 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              <div className="w-[28px] h-[28px] sm:w-[30px] sm:h-[30px] rounded-full bg-blue-500 flex-shrink-0 overflow-hidden">
                {avatarSrc ? (
                  <img src={avatarSrc} alt={userName} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-white text-[11px] sm:text-[12px] flex items-center justify-center h-full font-bold">
                    {firstName?.charAt(0) || "U"}
                  </span>
                )}
              </div>

              <div className="text-left hidden lg:flex flex-col justify-center">
                <p className="text-[11px] font-semibold text-gray-900 dark:text-gray-100 leading-tight truncate max-w-[80px]">
                  {firstName}
                </p>
                <p className="text-[9px] text-gray-500 dark:text-gray-400 font-medium leading-tight truncate max-w-[120px]">
                  {userEmail}
                </p>
              </div>
              <ChevronDown className={`w-3 h-3 sm:w-3.5 sm:h-3.5 text-gray-400 transition-transform flex-shrink-0 ${isProfileMenuOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* Profile Menu Dropdown */}
            {isProfileMenuOpen && (
              <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-xl shadow-xl border border-gray-100 py-1.5 z-50 animate-in fade-in zoom-in duration-200">

                {/* View Profile */}
                <button
                  onClick={() => handleMenuAction('/mentor/profile', onProfileClick)}
                  className="w-full px-4 py-2.5 text-left text-xs hover:bg-gray-50 text-gray-700 flex items-center gap-2 transition-colors"
                >
                  <User size={14} className="text-gray-400" />
                  View Profile
                </button>

                {/* Settings */}
                <button
                  onClick={() => handleMenuAction('/mentor/settings')}
                  className="w-full px-4 py-2.5 text-left text-xs hover:bg-gray-50 text-gray-700 flex items-center gap-2 transition-colors"
                >
                  <Settings size={14} className="text-gray-400" />
                  Settings
                </button>

                <div className="border-t border-gray-100 my-1"></div>

                {/* Logout */}
                <button
                  onClick={handleLogout}
                  className="w-full px-4 py-2.5 text-left text-xs text-red-600 hover:bg-red-50 flex items-center gap-2 transition-colors font-medium"
                >
                  <LogOut  className="-scale-x-100" size={14} />
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default MentorNavbar;


