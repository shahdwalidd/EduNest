import React from "react";
import type { JoinAs } from "../../types/auth";
import toast from "react-hot-toast";

interface Props {
  joinAs: JoinAs;
  setJoinAs: (v: JoinAs) => void;
}

export const JoinAsToggle: React.FC<Props> = ({ joinAs, setJoinAs }) => {
  // Base styling ensuring high vertical consistency with the compact form viewport layout
  const baseStyles =
    "flex-1 h-10 sm:h-11 px-4 sm:px-6 rounded-lg text-sm font-semibold transition-all duration-200 flex items-center justify-center border text-center cursor-pointer select-none active:scale-[0.98]";

  // Active state utilizing the brand identity color (#0f5e8b)
  const activeStyles = "bg-[#0f5e8b] text-white border-[#0f5e8b] shadow-sm font-bold";
  
  // Inactive state with minimalist borders and clean hover states
  const inactiveStyles =
    "bg-white text-gray-600 border-gray-200 hover:border-gray-300 hover:text-gray-800 hover:bg-gray-50/60";

  // Handles role switching and fires a dynamic success toast notification cleanly
  const handleToggle = (role: JoinAs) => {
    // Prevent triggering a new toast if the user clicks the currently active role
    if (joinAs === role) return;
    
    setJoinAs(role);
    
    // Capitalize the first letter for professional display (e.g., "Student" or "Mentor")
    const formattedRole = role.charAt(0).toUpperCase() + role.slice(1);
    toast.success(`Switched to ${formattedRole}`);
  };

  return (
    <div
      className="
        flex flex-row
        gap-2.5 sm:gap-3
        items-center
        w-full
      "
    >
      <button
        type="button"
        aria-pressed={joinAs === "student"}
        onClick={() => handleToggle("student")}
        className={`${baseStyles} ${
          joinAs === "student" ? activeStyles : inactiveStyles
        }`}
      >
        Student
      </button>

      <button
        type="button"
        aria-pressed={joinAs === "mentor"}
        onClick={() => handleToggle("mentor")}
        className={`${baseStyles} ${
          joinAs === "mentor" ? activeStyles : inactiveStyles
        }`}
      >
        Mentor
      </button>
    </div>
  );
};