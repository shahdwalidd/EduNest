import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import MentorSidebar from "../common/common-dash/MentorSidebar";
import { MentorNavbar } from "../common/common-dash";
import { useAuthStore } from "../../store/authStore";
import { getFirstNameFromToken } from "../../utils/jwt";

interface DashLayoutProps {
  children: React.ReactNode;
  pageTitle: string;
}

export default function DashLayout({ children, pageTitle }: DashLayoutProps) {
  const navigate = useNavigate();
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const token = useAuthStore((s) => s.token);
  const userName = useAuthStore((s) => s.userName);
  const setAuth = useAuthStore((s) => s.setAuth);
  const userEmail = useAuthStore((s) => s.userEmail);

  useEffect(() => {
    if (token && (!userName?.trim() || userName === 'Mentor')) {
      const name = getFirstNameFromToken(token);
      if (name) setAuth({ token, userName: name });
    }
  }, [token, userName, setAuth]);

  const displayName = userName?.trim().split(/\s+/)[0] || userName || 'Mentor';

  useEffect(() => {
    if (!token) {
      navigate('/', { replace: true });
    }
  }, [token, navigate]);

  if (!token) return null;

  return (
    <div className="flex min-h-screen bg-[#F7F7F8] overflow-hidden relative">

      {/* 1. Sidebar Container */}
      <div
        className={`
          fixed inset-y-0 left-0 z-[150] w-64 transform 
          transition-transform duration-300 ease-in-out
          lg:translate-x-0 lg:static lg:inset-auto lg:z-0
          ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        <MentorSidebar
          userName={displayName}
          userEmail={userEmail || `${(userName || '').toLowerCase().replace(/\s/g, '')}@email.com`}
          userAvatar={`https://api.dicebear.com/7.x/avataaars/svg?seed=${displayName}`}
          onClose={() => setSidebarOpen(false)}
        />
      </div>

      {/* 2. Overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-[80] lg:hidden transition-opacity duration-300"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* 3. Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">

        <div className="z-20">
          <MentorNavbar
            pageTitle={pageTitle}
            userName={displayName}
            userRole="Mentor"
            userAvatar={`https://api.dicebear.com/7.x/avataaars/svg?seed=${displayName}`}
            notificationCount={5}
            onMenuClick={() => setSidebarOpen(true)}
          />
        </div>

        <main className="flex-1 overflow-y-auto p-4 md:p-8 z-2">
          {children}
        </main>
      </div>
    </div>
  );
}
