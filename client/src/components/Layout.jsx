import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Clock,
  DollarSign,
  Award,
  Users,
  Briefcase,
  HelpCircle,
  HardDrive,
  FolderOpen,
  BookOpen,
  CalendarCheck,
  ClipboardCheck,
  UserPlus,
  FileText,
  LogOut,
  Moon,
  Sun,
  Bell,
  Search,
  ChevronDown,
  Sparkles,
  Menu,
  X,
  Check,
  Shield,
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useNotification } from '../context/NotificationContext';
import CommandPalette from './CommandPalette';

export default function Layout({ children }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { theme, toggleTheme, isDark } = useTheme();
  const { notifications, unreadCount, markAllAsRead, markAsRead, addToast } = useNotification();

  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [isRoleMenuOpen, setIsRoleMenuOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Retrieve current active user
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const stored = localStorage.getItem('user');
      return stored ? JSON.parse(stored) : { name: 'Priya Sharma', role: 'hr_manager', email: 'priya.hr@company.com' };
    } catch {
      return { name: 'Priya Sharma', role: 'hr_manager', email: 'priya.hr@company.com' };
    }
  });

  const isManager = currentUser?.role === 'hr_manager' || currentUser?.role === 'admin';
  const isFinance = currentUser?.role === 'finance_lead';

  // Scroll to top on route change
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, [location.pathname]);

  // Global Ctrl+K Shortcut listener
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setIsCommandPaletteOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    addToast({ title: 'Logged Out', message: 'You have been signed out of HRMS Core.', type: 'info' });
    navigate('/login');
  };

  const switchRole = (newUser) => {
    localStorage.setItem('user', JSON.stringify(newUser));
    setCurrentUser(newUser);
    setIsRoleMenuOpen(false);
    addToast({
      title: `Switched Role to ${newUser.role === 'hr_manager' ? 'HR Manager' : newUser.role === 'finance_lead' ? 'Finance Specialist' : 'Employee'}`,
      message: `Active user: ${newUser.name} (${newUser.email})`,
      type: 'success',
    });

    const hrOnlyRoutes = ['/recruitment', '/payroll', '/onboard', '/leave-approvals'];
    if (newUser.role === 'employee' && hrOnlyRoutes.includes(location.pathname)) {
      navigate('/dashboard');
    }
  };

  const navGroups = [
    {
      group: 'Overview',
      items: [
        { label: isManager ? 'Executive Dashboard' : 'My Dashboard', path: '/dashboard', icon: LayoutDashboard },
      ],
    },
    {
      group: 'Work & Time',
      items: [
        { label: 'Attendance & Clock', path: '/attendance', icon: Clock },
        ...(isManager
          ? [{ label: 'Leave Approvals', path: '/leave-approvals', icon: ClipboardCheck }]
          : [{ label: 'Request Leave', path: '/request-leave', icon: CalendarCheck }]),
      ],
    },
    {
      group: 'Finance & Compensation',
      items: [
        ...((isManager || isFinance) ? [{ label: 'Automated Payroll', path: '/payroll', icon: DollarSign }] : []),
        { label: 'My Payslips', path: '/my-payslips', icon: FileText },
      ],
    },
    {
      group: 'Talent & Team',
      items: [
        { label: isManager ? 'Org Chart & Team' : 'Company Directory', path: '/org-chart', icon: Users },
        { label: 'Performance & Kudos', path: '/performance', icon: Award },
        ...(isManager ? [
          { label: 'Recruitment ATS', path: '/recruitment', icon: Briefcase },
          { label: 'Onboard Employee', path: '/onboard', icon: UserPlus },
        ] : []),
      ],
    },
  ];

  return (
    <div className="min-h-screen flex bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-200">
      {/* Command Palette Modal */}
      <CommandPalette isOpen={isCommandPaletteOpen} onClose={() => setIsCommandPaletteOpen(false)} />

      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex w-72 flex-col fixed inset-y-0 z-30 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border-r border-slate-200/80 dark:border-slate-800">
        {/* Brand Header */}
        <div className="px-6 py-5 border-b border-slate-200/80 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate('/dashboard')}>
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-pink-500 flex items-center justify-center shadow-lg shadow-indigo-500/25">
              <span className="font-heading font-black text-xl text-white tracking-tighter">H</span>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-heading font-extrabold text-base tracking-tight gradient-text">
                  HRMS CORE
                </span>
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300">
                  PRO
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-medium">Enterprise Suite</p>
            </div>
          </div>
        </div>

        {/* Navigation Links */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-6">
          {navGroups.map((grp) => (
            <div key={grp.group} className="space-y-1">
              <p className="px-3 text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                {grp.group}
              </p>
              {grp.items.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                return (
                  <button
                    key={item.path}
                    onClick={() => navigate(item.path)}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-2xl text-xs font-semibold transition-all ${
                      isActive
                        ? 'bg-gradient-to-r from-indigo-600 to-indigo-700 text-white shadow-md shadow-indigo-600/20'
                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400 dark:text-slate-500'}`} />
                    <span className="flex-1 text-left truncate">{item.label}</span>
                    {isActive && <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />}
                  </button>
                );
              })}
            </div>
          ))}
        </div>

        {/* User Card & Role Switcher */}
        <div className="p-4 border-t border-slate-200/80 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3 overflow-hidden">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-500 to-pink-500 text-white font-bold text-xs flex items-center justify-center shadow-sm shrink-0">
                {currentUser?.name?.charAt(0) || 'U'}
              </div>
              <div className="truncate">
                <p className="text-xs font-bold truncate text-slate-900 dark:text-slate-100">{currentUser?.name}</p>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 capitalize truncate flex items-center gap-1">
                  <Shield className="w-3 h-3 text-indigo-500" />
                  {currentUser?.role?.replace('_', ' ')}
                </p>
              </div>
            </div>

            <button
              onClick={handleLogout}
              title="Sign Out"
              className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-all"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col lg:pl-72 min-w-0">
        {/* Top Navigation Bar */}
        <header className="sticky top-0 z-20 h-16 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-slate-200/80 dark:border-slate-800 px-4 lg:px-8 flex items-center justify-between gap-4">
          {/* Mobile menu trigger */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="lg:hidden p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          {/* Global Search Button / Trigger */}
          <button
            onClick={() => setIsCommandPaletteOpen(true)}
            className="flex-1 max-w-md hidden sm:flex items-center justify-between px-4 py-2 rounded-2xl bg-slate-100/80 dark:bg-slate-800/80 border border-slate-200/60 dark:border-slate-700/60 text-slate-400 hover:border-indigo-500/50 hover:bg-white dark:hover:bg-slate-800 transition-all text-xs group cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <Search className="w-4 h-4 text-slate-400 group-hover:text-indigo-500 transition-colors" />
              <span>Search modules, people, commands...</span>
            </div>
            <kbd className="font-mono text-[10px] px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
              Ctrl + K
            </kbd>
          </button>

          {/* Header Action Items */}
          <div className="flex items-center gap-2.5 ml-auto">
            {/* Quick Role Switcher Dropdown */}
            <div className="relative">
              <button
                onClick={() => setIsRoleMenuOpen(!isRoleMenuOpen)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200/50 dark:border-indigo-800/50 text-xs font-semibold hover:bg-indigo-100 transition-all"
              >
                <Sparkles className="w-3.5 h-3.5 text-indigo-500 animate-pulse" />
                <span className="hidden sm:inline">Role: </span>
                <span className="capitalize">{currentUser?.role?.replace('_', ' ')}</span>
                <ChevronDown className="w-3 h-3 opacity-60" />
              </button>

              {isRoleMenuOpen && (
                <div className="absolute right-0 mt-2 w-64 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl p-2 z-50 animate-slide-up">
                  <p className="px-3 py-1.5 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    Switch Active Persona
                  </p>
                  <button
                    onClick={() =>
                      switchRole({
                        id: 'u-1',
                        name: 'Priya Sharma',
                        email: 'priya.hr@company.com',
                        role: 'hr_manager',
                        title: 'VP of People & Culture',
                      })
                    }
                    className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs hover:bg-slate-100 dark:hover:bg-slate-800 text-left transition-all"
                  >
                    <div>
                      <p className="font-bold text-slate-900 dark:text-white">Priya Sharma</p>
                      <p className="text-[11px] text-slate-500">HR Manager (Full Admin Ops)</p>
                    </div>
                    {currentUser?.role === 'hr_manager' && <Check className="w-4 h-4 text-indigo-500" />}
                  </button>

                  <button
                    onClick={() =>
                      switchRole({
                        id: 'u-2',
                        name: 'Sarah Jenkins',
                        email: 'sarah.j@company.com',
                        role: 'employee',
                        title: 'Senior Full Stack Engineer',
                      })
                    }
                    className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs hover:bg-slate-100 dark:hover:bg-slate-800 text-left transition-all"
                  >
                    <div>
                      <p className="font-bold text-slate-900 dark:text-white">Sarah Jenkins</p>
                      <p className="text-[11px] text-slate-500">Tech Lead / Employee View</p>
                    </div>
                    {currentUser?.role === 'employee' && <Check className="w-4 h-4 text-indigo-500" />}
                  </button>

                  <button
                    onClick={() =>
                      switchRole({
                        id: 'u-5',
                        name: 'David Miller',
                        email: 'david.m@company.com',
                        role: 'hr_manager',
                        title: 'Senior Financial Controller',
                      })
                    }
                    className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs hover:bg-slate-100 dark:hover:bg-slate-800 text-left transition-all"
                  >
                    <div>
                      <p className="font-bold text-slate-900 dark:text-white">David Miller</p>
                      <p className="text-[11px] text-slate-500">Finance & Payroll Lead</p>
                    </div>
                  </button>
                </div>
              )}
            </div>

            {/* Dark / Light Mode Toggle */}
            <button
              onClick={toggleTheme}
              title={`Switch to ${isDark ? 'Light' : 'Dark'} Mode`}
              className="p-2 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-all cursor-pointer"
            >
              {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
            </button>

            {/* Notifications Bell */}
            <div className="relative">
              <button
                onClick={() => setIsNotificationOpen(!isNotificationOpen)}
                className="p-2 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-all relative cursor-pointer"
              >
                <Bell className="w-4 h-4" />
                {unreadCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-white dark:ring-slate-900 animate-pulse" />
                )}
              </button>

              {isNotificationOpen && (
                <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl p-4 z-50 animate-slide-up">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white">Notifications</h4>
                      {unreadCount > 0 && (
                        <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400">
                          {unreadCount} new
                        </span>
                      )}
                    </div>
                    {unreadCount > 0 && (
                      <button
                        onClick={markAllAsRead}
                        className="text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
                      >
                        Mark all as read
                      </button>
                    )}
                  </div>

                  <div className="mt-3 space-y-2 max-h-72 overflow-y-auto">
                    {notifications.map((n) => (
                      <div
                        key={n.id}
                        onClick={() => markAsRead(n.id)}
                        className={`p-3 rounded-2xl cursor-pointer transition-all ${
                          n.read
                            ? 'bg-transparent hover:bg-slate-50 dark:hover:bg-slate-800/40 opacity-75'
                            : 'bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/40'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <p className="text-xs font-bold text-slate-900 dark:text-slate-100">{n.title}</p>
                          <span className="text-[10px] text-slate-400">{n.time}</span>
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{n.message}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Mobile Navigation Drawer */}
        {isMobileMenuOpen && (
          <div className="lg:hidden fixed inset-0 z-40 bg-black/60 backdrop-blur-sm">
            <div className="w-72 h-full bg-white dark:bg-slate-900 p-6 flex flex-col justify-between overflow-y-auto">
              <div>
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white font-bold flex items-center justify-center">
                      H
                    </div>
                    <span className="font-heading font-extrabold text-base gradient-text">HRMS CORE</span>
                  </div>
                  <button onClick={() => setIsMobileMenuOpen(false)} className="p-1 text-slate-400">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="space-y-4">
                  {navGroups.map((grp) => (
                    <div key={grp.group} className="space-y-1">
                      <p className="text-[10px] font-bold uppercase text-slate-400">{grp.group}</p>
                      {grp.items.map((item) => (
                        <button
                          key={item.path}
                          onClick={() => {
                            navigate(item.path);
                            setIsMobileMenuOpen(false);
                          }}
                          className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-indigo-50 dark:hover:bg-slate-800"
                        >
                          <item.icon className="w-4 h-4 text-indigo-500" />
                          {item.label}
                        </button>
                      ))}
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t border-slate-200 dark:border-slate-800">
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center justify-center gap-2 py-2 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-600 text-xs font-bold"
                >
                  <LogOut className="w-4 h-4" /> Sign Out
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Page Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto animate-slide-up">{children}</main>
      </div>
    </div>
  );
}