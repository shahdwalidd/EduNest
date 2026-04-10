
import type { FC } from 'react';
import { useState } from 'react';
import { Search, Bell, Menu, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '../../../../store/authStore';
import edunestLogo from '../../../../assets/edunestlogo.png';


interface NavbarProps {
  userName?:   string;   
  userAvatar?: string;   
}

const Navbar: FC<NavbarProps> = ({ userName: nameProp, userAvatar: avatarProp }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const storeUserName   = useAuthStore(s => s.userName);
  const storeUserAvatar = useAuthStore(s => s.userAvatar);

  const userName   = nameProp   || storeUserName   || 'Student';
  const userAvatar = avatarProp || storeUserAvatar || '';

  const navItems = [
    { label: 'Home',         path: '/student/dashboard'   },
    { label: 'Mentorships',  path: '/student/mentorships' },
    { label: 'Learning',     path: '/student/learning'    },
    { label: 'Messages',     path: '/student/messages'    },
    { label: 'Profile',      path: '/student/profile'     },
    { label: 'Setting',      path: '/student/settings'    },
  ];

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-[100]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* Logo */}
          <Link to="/student/dashboard" className="flex items-center gap-0">
            <img src={edunestLogo} alt="EduNest Logo" className="w-14 h-12" />
          </Link>

          {/* Desktop Nav Links */}
          <div className="hidden md:flex items-center space-x-8">
            {navItems.map(item => (
              <Link
                key={item.path}
                to={item.path}
                className="text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors duration-200"
              >
                {item.label}
              </Link>
            ))}
          </div>

          {/* Right Controls */}
          <div className="flex items-center gap-4">
            {/* Search */}
            <div className="hidden md:block relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search resources..."
                className="pl-10 pr-4 py-2 w-64 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Bell */}
            <button className="relative p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <Bell className="w-5 h-5 text-gray-700" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
            </button>

            {/* Avatar + Name */}
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full overflow-hidden bg-gray-200 flex-shrink-0">
                {userAvatar ? (
                  <img src={userAvatar} alt={userName} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center">
                    <span className="text-white text-xs font-bold">
                      {userName.charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}
              </div>
              <span className="hidden md:block text-sm font-medium text-gray-900">{userName}</span>
            </div>

            {/* Mobile menu toggle */}
            <button
              onClick={() => setIsMobileMenuOpen(v => !v)}
              className="md:hidden p-2 hover:bg-gray-100 rounded-lg"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Drawer */}
        {isMobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-200">
            {navItems.map(item => (
              <Link
                key={item.path}
                to={item.path}
                className="block px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {item.label}
              </Link>
            ))}
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;