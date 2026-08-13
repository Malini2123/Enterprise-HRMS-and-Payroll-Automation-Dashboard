import React from 'react';
import { Navigate, useLocation, Link } from 'react-router-dom';
import { ShieldAlert, ArrowLeft, Lock } from 'lucide-react';

function ProtectedRoute({ children, allowedRoles }) {
  const location = useLocation();
  const token = localStorage.getItem('token');
  
  let user = null;
  try {
    const raw = localStorage.getItem('user');
    user = raw ? JSON.parse(raw) : null;
  } catch (e) {
    user = null;
  }

  if (!token || !user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && allowedRoles.length > 0) {
    const userRole = user.role || 'employee';
    const isAllowed = allowedRoles.includes(userRole);

    if (!isAllowed) {
      return (
        <div className="min-h-screen flex items-center justify-center p-6 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white">
          <div className="max-w-md w-full p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl text-center space-y-6 animate-slide-up">
            <div className="w-16 h-16 rounded-3xl bg-rose-100 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 flex items-center justify-center mx-auto text-rose-600 dark:text-rose-400">
              <ShieldAlert className="w-8 h-8" />
            </div>

            <div className="space-y-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400 px-3 py-1 rounded-full bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50">
                Access Restricted
              </span>
              <h2 className="font-heading font-black text-2xl text-slate-900 dark:text-white">
                HR Authorization Required
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                You are currently signed in as <strong className="text-slate-800 dark:text-slate-200 capitalize">{user.name} ({userRole.replace('_', ' ')})</strong>. This section is restricted to <strong>{allowedRoles.map(r => r.replace('_', ' ')).join(', ')}</strong> roles.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 text-left space-y-1.5 text-xs text-slate-600 dark:text-slate-400">
              <div className="flex items-center gap-2 font-semibold text-slate-800 dark:text-slate-200">
                <Lock className="w-3.5 h-3.5 text-indigo-500" />
                Enterprise Role Policy
              </div>
              <p className="text-[11px]">
                Employees have access to personal time tracking, payslips, leave requests, and performance OKRs. Administrative ATS pipelines & payroll batch runs require elevated privileges.
              </p>
            </div>

            <div className="pt-2 flex flex-col sm:flex-row gap-3">
              <Link
                to="/dashboard"
                className="flex-1 py-3 px-4 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-lg shadow-indigo-500/25 flex items-center justify-center gap-2 transition-all"
              >
                <ArrowLeft className="w-4 h-4" />
                Return to Dashboard
              </Link>
            </div>
          </div>
        </div>
      );
    }
  }

  return children;
}

export default ProtectedRoute;