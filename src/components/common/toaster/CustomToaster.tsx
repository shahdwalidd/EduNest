import { useEffect } from 'react';
import { Toaster, useToasterStore, toast } from 'react-hot-toast';

export function CustomToaster() {
  const { toasts } = useToasterStore();
  const TOAST_LIMIT = 5;

  useEffect(() => {
    if (toasts.length > TOAST_LIMIT) {
      toast.dismiss(toasts[0].id);
    }
  }, [toasts]);

  return (
    <Toaster
      position="top-right"
      reverseOrder={false}
      gutter={12}
      containerStyle={{
        top: 20,
        right: 20,
        zIndex: 99999,
      }}
      toastOptions={{
        duration: 4500,
        style: {
          maxWidth: 420,
          padding: '14px 18px',
          borderRadius: '12px',
          boxShadow: '0 10px 40px rgba(0,0,0,0.12)',
          fontSize: '15px',
        },
        success: {
          duration: 4000,
          iconTheme: {
            primary: '#16a34a',
            secondary: '#fff',
          },
          style: {
            background: '#f0fdf4',
            color: '#166534',
            border: '1px solid #bbf7d0',
          },
        },
        error: {
          duration: 5000,
          iconTheme: {
            primary: '#dc2626',
            secondary: '#fff',
          },
          style: {
            background: '#fef2f2',
            color: '#991b1b',
            border: '1px solid #fecaca',
          },
        },
      }}
    />
  );
}

