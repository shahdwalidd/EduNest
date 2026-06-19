// eslint-disable-next-line @typescript-eslint/no-explicit-any
(globalThis as any).global = globalThis;
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import GlobalLoadingOverlay from './loadingApp/GlobalLoadingOverlay';

import { BrowserRouter } from 'react-router-dom';
import './index.css';
import { ThemeProvider } from './context/ThemeContext';
import { WebSocketProvider } from './context/Websocketprovider';
import { NotificationsProvider } from './context/NotificationsContext';
import { CustomToaster } from './components/common/toaster/CustomToaster';


createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <ThemeProvider>
        <WebSocketProvider>
          <NotificationsProvider>
            <GlobalLoadingOverlay />
            <App />

            {/* notifications toaster for all pages and important notifications */}
            <CustomToaster />
          </NotificationsProvider>
        </WebSocketProvider>
      </ThemeProvider>
    </BrowserRouter>
  </StrictMode>,
);