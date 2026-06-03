import React from "react";
import { Eye, EyeOff } from "lucide-react";

interface Props {
  label: string;
  value: string;
  onChange: (v: string) => void;
  showPassword: boolean;
  toggleShow: () => void;
  error?: string;
  id: string;
}

export const PasswordInput: React.FC<Props> = ({
  label,
  value,
  onChange,
  showPassword,
  toggleShow,
  error,
  id,
}) => (
  <div className="flex flex-col w-full">
    {/* Label styled for form consistency */}
    <label htmlFor={id} className="text-sm font-semibold text-gray-700 mb-1.5">
      {label}
    </label>

    <div className="relative">
      <input
        id={id}
        type={showPassword ? "text" : "password"}
        placeholder={label}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`w-full h-12 sm:h-14 border rounded-lg sm:rounded-[12px] px-4 pr-11 sm:pr-12
                   text-sm sm:text-base focus:outline-none focus:ring-2 transition-all duration-200
                   ${
                     error
                       ? "border-red-300 focus:ring-red-500 text-red-900 bg-red-50/10"
                       : "border-gray-300 hover:border-gray-400 focus:ring-[#0f5e8b] text-gray-800"
                   }`}
        required
        minLength={6}
      />

      {/* Password visibility toggle button using Lucide icons */}
      <button
        type="button"
        onClick={toggleShow}
        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none transition-colors"
        aria-label={showPassword ? "Hide password" : "Show password"}
      >
        {showPassword ? (
          <Eye className="w-5 h-5" />
        ) : (
          <EyeOff className="w-5 h-5" />
        )}
      </button>
    </div>

    {/* Validation error message */}
    {error && (
      <p className="text-red-500 text-xs mt-1 font-medium">{error}</p>
    )}
  </div>
);