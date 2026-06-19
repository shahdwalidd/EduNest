import React, { useEffect, useState } from 'react';

const LoadingApp: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Ensure we keep loader until the initial app has mounted.
    // Using two rafs prevents flicker on fast devices.
    const t1 = requestAnimationFrame(() => {
      const t2 = requestAnimationFrame(() => setIsLoading(false));
      return () => cancelAnimationFrame(t2);
    });

    return () => cancelAnimationFrame(t1);
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen w-screen flex items-center justify-center bg-white">
        <div className="flex flex-col items-center justify-center gap-4">
          <img
            src={new URL('../assets/loading/loading.svg', import.meta.url).toString()}
            alt="Loading"
            className="w-20 h-20"
          />
          <div className="text-gray-600 font-medium">Loading</div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

export default LoadingApp;

