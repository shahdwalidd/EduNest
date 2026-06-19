import { useEffect, useState } from 'react';

const GlobalLoadingOverlay = () => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // set a timer to show the overlay after a short delay
    const showTimer = window.setTimeout(() => {
      setVisible(true);
    }, 100);

    const hideTimer = window.setTimeout(() => {
      setVisible(false);
    }, 1000);

    return () => {
      window.clearTimeout(showTimer);
      window.clearTimeout(hideTimer);
    };
  }, []);

  if (!visible) return null;

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-white"
      aria-live="polite"
      aria-busy="true"
    >
      <div className="flex flex-col items-center justify-center gap-4">
        <img
          src={new URL('../assets/loading/loading.svg', import.meta.url).toString()}
          alt="Loading"
          className="w-48 h-48"
        />
        <div className="text-gray-600 font-medium" aria-label="Loading">
          <div className="inline-flex items-center gap-3">
            <span
              className="inline-block h-2.5 w-2.5 rounded-full bg-primary animate-ping"
              aria-hidden="true"
            />
            <h1 className="text-xl font-bold tracking-wider">EduNest</h1>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GlobalLoadingOverlay;