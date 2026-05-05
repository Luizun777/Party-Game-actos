import { useEffect } from 'react';

interface ToastProps {
  children: React.ReactNode;
  onDone: () => void;
  duration?: number;
}

export function Toast({ children, onDone, duration = 1800 }: ToastProps) {
  useEffect(() => {
    const id = setTimeout(onDone, duration);
    return () => clearTimeout(id);
  }, [onDone, duration]);

  return <div className="toast">{children}</div>;
}
