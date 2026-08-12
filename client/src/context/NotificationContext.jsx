import React, { createContext, useContext, useState } from 'react';
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X, Bell } from 'lucide-react';

const NotificationContext = createContext();

export function NotificationProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      title: 'Batch Payroll Run Successful',
      message: 'Monthly payroll for 48 employees has been calculated and submitted for disbursement.',
      time: '10 mins ago',
      type: 'success',
      read: false,
    },
    {
      id: 2,
      title: 'New Support Ticket Raised',
      message: 'Sarah Jenkins raised TCK-1082: Dual 4K Monitor Arm Request.',
      time: '1 hour ago',
      type: 'info',
      read: false,
    },
    {
      id: 3,
      title: 'Candidate Moved to Offer Stage',
      message: 'Liam Chen advanced to Offer Stage for Senior Full Stack Engineer role.',
      time: '3 hours ago',
      type: 'success',
      read: false,
    },
    {
      id: 4,
      title: 'Pending Leave Approvals',
      message: '3 leave requests are awaiting manager approval.',
      time: '5 hours ago',
      type: 'warning',
      read: true,
    },
  ]);

  const addToast = ({ title, message, type = 'success', duration = 4000 }) => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, title, message, type }]);

    if (duration > 0) {
      setTimeout(() => {
        removeToast(id);
      }, duration);
    }
  };

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const markAsRead = (id) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <NotificationContext.Provider
      value={{
        toasts,
        notifications,
        unreadCount,
        addToast,
        removeToast,
        markAllAsRead,
        markAsRead,
      }}
    >
      {children}

      {/* Global Toast Container */}
      <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2.5 max-w-md w-full pointer-events-none px-4">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-start gap-3 p-4 rounded-2xl shadow-xl border backdrop-blur-xl animate-slide-up transition-all ${
              toast.type === 'success'
                ? 'bg-emerald-500/10 dark:bg-emerald-950/40 border-emerald-500/30 text-emerald-900 dark:text-emerald-200'
                : toast.type === 'error'
                ? 'bg-rose-500/10 dark:bg-rose-950/40 border-rose-500/30 text-rose-900 dark:text-rose-200'
                : toast.type === 'warning'
                ? 'bg-amber-500/10 dark:bg-amber-950/40 border-amber-500/30 text-amber-900 dark:text-amber-200'
                : 'bg-indigo-500/10 dark:bg-indigo-950/40 border-indigo-500/30 text-indigo-900 dark:text-indigo-200'
            } bg-white/90 dark:bg-slate-900/90`}
          >
            <div className="mt-0.5 shrink-0">
              {toast.type === 'success' && <CheckCircle2 className="w-5 h-5 text-emerald-500" />}
              {toast.type === 'error' && <AlertCircle className="w-5 h-5 text-rose-500" />}
              {toast.type === 'warning' && <AlertTriangle className="w-5 h-5 text-amber-500" />}
              {toast.type === 'info' && <Info className="w-5 h-5 text-indigo-500" />}
            </div>
            <div className="flex-1 text-sm">
              {toast.title && <p className="font-semibold">{toast.title}</p>}
              <p className="opacity-90 text-xs mt-0.5">{toast.message}</p>
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="shrink-0 p-1 rounded-lg hover:bg-black/5 dark:hover:bg-white/10 opacity-70 hover:opacity-100 transition-opacity"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </NotificationContext.Provider>
  );
}

export function useNotification() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
}
