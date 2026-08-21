import { createContext, useContext, useState, useCallback } from 'react';
import { ToastContainer, Toast } from 'react-bootstrap';

const ToastContext = createContext(null);

export function useToast() {
  return useContext(ToastContext);
}

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const showToast = useCallback((message, variant = 'success') => {
    const id = Date.now();

    setToasts((prev) => [
      ...prev,
      { id, message, variant },
    ]);

    setTimeout(() => {
      setToasts((prev) =>
        prev.filter((t) => t.id !== id)
      );
    }, 4000);
  }, []);

  return (
    <ToastContext.Provider value={showToast}>
      {children}

      <ToastContainer
        position="bottom-end"
        className="p-3"
        style={{
          position: 'fixed',
          zIndex: 1050,
        }}
      >
        {toasts.map((t) => (
          <Toast key={t.id} bg={t.variant}>
            <Toast.Body
              className={
                t.variant === 'danger' ||
                t.variant === 'success'
                  ? 'text-white'
                  : ''
              }
            >
              {t.message}
            </Toast.Body>
          </Toast>
        ))}
      </ToastContainer>
    </ToastContext.Provider>
  );
}