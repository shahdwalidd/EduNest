import React from "react";

export const FormHeader: React.FC = () => (
  // Layout adjusts from a neat vertical stack on small screens to a crisp single line on larger ones
  <div className="flex flex-col sm:flex-row sm:items-baseline justify-start gap-1 sm:gap-2 mb-1">
    <p
      className="font-bold text-gray-900 text-sm sm:text-base tracking-wide"
    >
      Join as:
    </p>
    <span className="text-gray-400 sm:text-gray-500 text-xs sm:text-sm font-medium">
      Choose your role to get started
    </span>
  </div>
);