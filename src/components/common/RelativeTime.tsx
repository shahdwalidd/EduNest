import { useEffect, useState, type FC } from 'react';

interface RelativeTimeProps {
  isoDate: string;
  className?: string;
}

const formatTimeAgo = (isoDate: string): string => {
  if (!isoDate) return '';
  const utc = isoDate.endsWith('Z') || isoDate.includes('+') ? isoDate : isoDate + 'Z';
  const diff = Date.now() - new Date(utc).getTime();
  const mins = Math.floor(diff / 60_000);
  const hours = Math.floor(diff / 3_600_000);
  const days = Math.floor(diff / 86_400_000);

  if (diff < 0) return 'Just now';
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;
  return new Date(utc).toLocaleDateString([], { month: 'short', day: 'numeric' });
};


const RelativeTime: FC<RelativeTimeProps> = ({ isoDate, className = '' }) => {
  const [displayTime, setDisplayTime] = useState(() => formatTimeAgo(isoDate));

  useEffect(() => {
    if (!isoDate) return;

    // Calculate initial display time
    setDisplayTime(formatTimeAgo(isoDate));

    // Determine smart update interval based on age
    const getUpdateInterval = (): number => {
      const utc = isoDate.endsWith('Z') || isoDate.includes('+') ? isoDate : isoDate + 'Z';
      const diff = Date.now() - new Date(utc).getTime();
      const mins = Math.floor(diff / 60_000);
      const hours = Math.floor(diff / 3_600_000);

      // Update frequently for recent times, less for older
      if (mins < 1) return 10_000;       // < 1 min: update every 10s
      if (mins < 60) return 30_000;      // < 1 hour: update every 30s
      if (hours < 24) return 5 * 60_000; // < 1 day: update every 5 min
      return 60 * 60_000;                // else: update every 1 hour
    };

    let intervalId: ReturnType<typeof setInterval> | null = null;

    const scheduleUpdate = () => {
      const interval = getUpdateInterval();
      intervalId = setInterval(() => {
        setDisplayTime(formatTimeAgo(isoDate));
        // Reschedule after update in case interval changed
        if (intervalId) clearInterval(intervalId);
        scheduleUpdate();
      }, interval);
    };

    scheduleUpdate();

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [isoDate]);

  return <span className={className}>{displayTime}</span>;
};

export default RelativeTime;
