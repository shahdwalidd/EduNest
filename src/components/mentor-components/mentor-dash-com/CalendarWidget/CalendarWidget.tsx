import type { FC } from 'react';
import { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react';
import type { CalendarWidgetProps, CalendarSession } from './Calenderwideget.types';

// ─── Constants & Helpers Outside Component (Prevent Re-allocation) ───────────
const DAYS_OF_WEEK = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const SESSION_TYPE_COLORS: Record<string, string> = {
  live: 'bg-green-400',
  qa: 'bg-orange-400',
  course: 'bg-blue-400',
};

const formatDateKey = (date: Date): string => {
  return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
};

const isSameDay = (d1: Date, d2: Date): boolean => {
  return (
    d1.getDate() === d2.getDate() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getFullYear() === d2.getFullYear()
  );
};

// ─── Main Component ──────────────────────────────────────────────────────────
const CalendarWidget: FC<CalendarWidgetProps> = ({
  selectedDate: initialDate = new Date(2026, 2, 13),
  onDateSelect,
  sessions = [],
  onSessionClick
}) => {
  const [selectedDate, setSelectedDate] = useState(initialDate);
  
  // Initialize week start date (Sunday of current week)
  const [weekStartDate, setWeekStartDate] = useState(() => {
    const d = new Date(initialDate);
    d.setDate(d.getDate() - d.getDay());
    return d;
  });

  // ─── Performance Optimization: Group Sessions by Date Map O(N) ──────────────
  const sessionsByDateMap = useMemo(() => {
    const map: Record<string, CalendarSession[]> = {};
    
    sessions.forEach((session) => {
      if (!session.date) return;
      const parsedDate = new Date(session.date);
      if (isNaN(parsedDate.getTime())) return; // Guard clause for invalid dates
      
      const key = formatDateKey(parsedDate);
      if (!map[key]) map[key] = [];
      map[key].push(session);
    });
    
    return map;
  }, [sessions]);

  // ─── Derived State & Memoized Computations ──────────────────────────────────
  const weekDays = useMemo(() => {
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(weekStartDate);
      d.setDate(weekStartDate.getDate() + i);
      return d;
    });
  }, [weekStartDate]);

  const displayDate = useMemo(() => {
    const d = new Date(weekStartDate);
    d.setDate(weekStartDate.getDate() + 3);
    return d;
  }, [weekStartDate]);

  const monthName = displayDate.toLocaleDateString('en-US', { month: 'long' });
  const year = displayDate.getFullYear();

  const selectedDateSessions = useMemo(() => {
    return sessionsByDateMap[formatDateKey(selectedDate)] || [];
  }, [sessionsByDateMap, selectedDate]);

  // ─── Handlers ──────────────────────────────────────────────────────────────
  const handleWeekChange = (offset: number) => {
    const newDate = new Date(weekStartDate);
    newDate.setDate(newDate.getDate() + offset);
    setWeekStartDate(newDate);
  };

  const handleDateClick = (date: Date) => {
    setSelectedDate(date);
    onDateSelect?.(date);
  };

  return (
    <div className="bg-white rounded-2xl p-4 sm:p-6 border border-gray-100 shadow-sm w-full m-auto">
      
      {/* Header */}
      <div className="flex items-center justify-between mb-4 sm:mb-6">
        <h3 className="text-sm sm:text-base font-bold text-[var(--sidebar-bg)] dark:text-gray-200">
          {monthName} <span className="text-gray-400 font-medium">{year}</span>
        </h3>
        <div className="flex items-center gap-1">
          <button 
            onClick={() => handleWeekChange(-7)} 
            className="p-1.5 hover:bg-gray-50 rounded-lg text-gray-400 transition-colors"
          >
            <ChevronLeft size={18} />
          </button>
          <button 
            onClick={() => handleWeekChange(7)} 
            className="p-1.5 hover:bg-gray-50 rounded-lg text-gray-400 transition-colors"
          >
            <ChevronRight size={18} />
          </button>
        </div>
      </div>

      {/* Days Labels */}
      <div className="grid grid-cols-7 gap-1 mb-3">
        {DAYS_OF_WEEK.map((day, index) => (
          <div key={index} className="text-center text-[9px] sm:text-[10px] font-bold text-gray-300 uppercase italic">
            {day}
          </div>
        ))}
      </div>

      {/* Days Grid */}
      <div className="grid grid-cols-7 gap-1 sm:gap-2 justify-items-center items-center">
        {weekDays.map((date, index) => {
          const isSelected = isSameDay(date, selectedDate);
          const isDifferentMonth = date.getMonth() !== displayDate.getMonth();
          const dateSessions = sessionsByDateMap[formatDateKey(date)] || [];
          const hasSession = dateSessions.length > 0;

          return (
            <div key={index} className="flex flex-col items-center w-full">
              <button
                onClick={() => handleDateClick(date)}
                className={`
                  relative w-full aspect-square max-w-[40px] flex items-center justify-center 
                  text-xs sm:text-sm font-bold rounded-xl transition-all duration-200
                  ${isSelected
                    ? 'bg-[#0c2d48] text-white shadow-md scale-105 sm:scale-110'
                    : isDifferentMonth
                      ? 'text-gray-200'
                      : 'text-gray-600 hover:bg-blue-50'
                  }
                  ${hasSession && !isSelected ? 'ring-2 ring-blue-300' : ''}
                `}
                title={hasSession ? `${dateSessions.length} session(s)` : ''}
              >
                {date.getDate()}
              </button>

              {/* Session Indicators */}
              <div className="h-2 mt-1 flex flex-col items-center gap-0.5">
                {isSelected && <div className="w-1 h-1 bg-[#d4af37] rounded-full" />}
                
                {hasSession && !isSelected && (
                  <div className="flex gap-0.5 justify-center">
                    {dateSessions.slice(0, 2).map((session, i) => {
                      const colorClass = SESSION_TYPE_COLORS[session.type as keyof typeof SESSION_TYPE_COLORS] || 'bg-gray-400';
                      return (
                        <div
                          key={i}
                          className={`w-1 h-1 rounded-full ${colorClass} cursor-pointer hover:scale-125 transition-transform`}
                          title={session.title}
                        />
                      );
                    })}
                    {dateSessions.length > 2 && (
                      <div className="text-[8px] text-gray-400 ml-0.5">+{dateSessions.length - 2}</div>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Sessions for selected date */}
      {selectedDateSessions.length > 0 && (
        <div className="mt-4 pt-4 border-t border-gray-100">
          <h4 className="text-xs font-semibold text-gray-700 mb-2 flex items-center gap-1">
            <Calendar size={12} /> 
            {selectedDateSessions.length} session{selectedDateSessions.length !== 1 ? 's' : ''}
          </h4>
          <div className="space-y-1">
            {selectedDateSessions.map((session) => (
              <button
                key={session.id}
                onClick={() => onSessionClick?.(session)}
                className="w-full text-left text-xs p-2 rounded-lg hover:bg-blue-50 transition-colors bg-gray-50 border border-gray-200"
              >
                <div className="font-medium text-gray-800 truncate">{session.title}</div>
                {session.startTime && (
                  <div className="text-gray-500 text-[10px]">
                    {session.startTime} {session.endTime ? `- ${session.endTime}` : ''}
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default CalendarWidget;