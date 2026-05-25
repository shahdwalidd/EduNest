import { createContext, useContext, type FC, type ReactNode } from 'react';
import { useNotifications } from '../hooks/Usenotifications';

type NotificationsContextType = ReturnType<typeof useNotifications>;

const NotificationsContext = createContext<NotificationsContextType | null>(null);

export const NotificationsProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const value = useNotifications();
  return (
    <NotificationsContext.Provider value={value}>
      {children}
    </NotificationsContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useNotificationsContext = () => {
  const ctx = useContext(NotificationsContext);
  if (!ctx) throw new Error('useNotificationsContext must be inside NotificationsProvider');
  return ctx;
};
