import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
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
  UserPlus,
  ArrowRight,
  Sparkles,
  Command,
} from 'lucide-react';

export default function CommandPalette({ isOpen, onClose }) {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef(null);
  const navigate = useNavigate();

  let userRole = 'employee';
  try {
    const raw = localStorage.getItem('user');
    const u = raw ? JSON.parse(raw) : null;
    userRole = u?.role || 'employee';
  } catch {
    userRole = 'employee';
  }
  const isManager = userRole === 'hr_manager' || userRole === 'admin';
  const isFinance = userRole === 'finance_lead';

  const allCommands = [
    // Navigation
    { id: 'nav-dash', title: isManager ? 'Executive Dashboard' : 'My Dashboard', subtitle: 'View KPIs & analytics', category: 'Navigation', icon: LayoutDashboard, path: '/dashboard', roles: ['all'] },
    { id: 'nav-att', title: 'Attendance & Clock-In', subtitle: 'Punch in/out & attendance calendar', category: 'Navigation', icon: Clock, path: '/attendance', roles: ['all'] },
    { id: 'nav-req-leave', title: 'Request Leave', subtitle: 'Apply for PTO, sick or casual time off', category: 'Navigation', icon: CalendarCheck, path: '/request-leave', roles: ['employee'] },
    { id: 'nav-payslips', title: 'My Payslips & Tax Slips', subtitle: 'View breakdown & download official PDF salary slips', category: 'Navigation', icon: DollarSign, path: '/my-payslips', roles: ['all'] },
    { id: 'nav-org', title: isManager ? 'Org Chart & Team Directory' : 'Company Directory', subtitle: 'Visual hierarchy and team directory', category: 'Navigation', icon: Users, path: '/org-chart', roles: ['all'] },
    { id: 'nav-okr', title: 'Performance OKRs & Kudos Wall', subtitle: 'Quarterly goals and peer recognition', category: 'Navigation', icon: Award, path: '/performance', roles: ['all'] },
    
    // HR & Finance Exclusive
    { id: 'nav-pay', title: 'Payroll & Tax Automation', subtitle: 'Process batch runs, salaries & tax engine', category: 'HR Administration', icon: DollarSign, path: '/payroll', roles: ['hr_manager', 'admin', 'finance_lead'] },
    { id: 'nav-ats', title: 'Recruitment & ATS Pipeline', subtitle: 'Job openings and candidate Kanban', category: 'HR Administration', icon: Briefcase, path: '/recruitment', roles: ['hr_manager', 'admin'] },
    { id: 'nav-onb', title: 'Onboard New Employee', subtitle: 'Setup wizard for incoming hires', category: 'HR Administration', icon: UserPlus, path: '/onboard', roles: ['hr_manager', 'admin'] },
    { id: 'nav-leave-app', title: 'Leave Approvals', subtitle: 'Approve or reject employee leave requests', category: 'HR Administration', icon: CalendarCheck, path: '/leave-approvals', roles: ['hr_manager', 'admin'] },

    // Quick Actions
    { id: 'act-punch', title: 'Quick Clock-In / Clock-Out', subtitle: 'Register active work session', category: 'Quick Action', icon: Clock, path: '/attendance', roles: ['all'] },
    { id: 'act-kudos', title: 'Send Peer Kudos with Confetti', subtitle: 'Celebrate a team member', category: 'Quick Action', icon: Sparkles, path: '/performance', roles: ['all'] },
    { id: 'act-tax', title: 'Simulate Income Tax (Old vs New)', subtitle: 'Compare tax regime brackets', category: 'Quick Action', icon: DollarSign, path: '/payroll', roles: ['hr_manager', 'admin', 'finance_lead'] },
  ];

  const visibleCommands = allCommands.filter((c) => c.roles.includes('all') || c.roles.includes(userRole) || (isManager && c.roles.includes('hr_manager')));

  const filtered = visibleCommands.filter(
    (c) =>
      c.title.toLowerCase().includes(query.toLowerCase()) ||
      c.subtitle.toLowerCase().includes(query.toLowerCase()) ||
      c.category.toLowerCase().includes(query.toLowerCase())
  );

  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!isOpen) return;

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev < filtered.length - 1 ? prev + 1 : 0));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : filtered.length - 1));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (filtered[selectedIndex]) {
          handleSelect(filtered[selectedIndex]);
        }
      } else if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, filtered, selectedIndex]);

  const handleSelect = (item) => {
    onClose();
    if (item.path) {
      navigate(item.path);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 bg-black/60 backdrop-blur-md animate-slide-up">
      <div
        className="w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200/80 dark:border-slate-800 overflow-hidden flex flex-col max-h-[75vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Header */}
        <div className="flex items-center gap-3 px-5 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
          <Search className="w-5 h-5 text-indigo-500 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            placeholder="Type a command, search modules, or take quick action..."
            className="flex-1 bg-transparent text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 text-sm md:text-base outline-none"
          />
          <kbd className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 text-xs font-mono bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-md">
            ESC
          </kbd>
        </div>

        {/* Results List */}
        <div className="flex-1 overflow-y-auto p-2 divide-y divide-slate-100 dark:divide-slate-800/40">
          {filtered.length === 0 ? (
            <div className="py-12 text-center text-slate-500 dark:text-slate-400 text-sm">
              No matching commands or actions found for "<span className="font-semibold">{query}</span>"
            </div>
          ) : (
            filtered.map((item, idx) => {
              const Icon = item.icon;
              const isSelected = idx === selectedIndex;
              return (
                <div
                  key={item.id}
                  onClick={() => handleSelect(item)}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={`flex items-center justify-between px-4 py-3 rounded-2xl cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-indigo-50 dark:bg-indigo-950/50 text-indigo-900 dark:text-indigo-200'
                      : 'hover:bg-slate-50 dark:hover:bg-slate-800/50 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`p-2.5 rounded-xl ${
                        isSelected
                          ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/20'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-sm text-slate-900 dark:text-slate-100">{item.title}</span>
                        <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400">
                          {item.category}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{item.subtitle}</p>
                    </div>
                  </div>
                  <ArrowRight
                    className={`w-4 h-4 transition-transform ${
                      isSelected ? 'translate-x-1 text-indigo-500' : 'opacity-0'
                    }`}
                  />
                </div>
              );
            })
          )}
        </div>

        {/* Footer shortcuts */}
        <div className="px-5 py-2.5 bg-slate-50 dark:bg-slate-950/80 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
          <div className="flex items-center gap-3">
            <span>
              <kbd className="px-1.5 py-0.5 bg-slate-200 dark:bg-slate-800 rounded font-mono text-[11px]">↑</kbd>{' '}
              <kbd className="px-1.5 py-0.5 bg-slate-200 dark:bg-slate-800 rounded font-mono text-[11px]">↓</kbd> to
              navigate
            </span>
            <span>
              <kbd className="px-1.5 py-0.5 bg-slate-200 dark:bg-slate-800 rounded font-mono text-[11px]">↵</kbd> to
              select
            </span>
          </div>
          <span className="flex items-center gap-1 font-medium text-indigo-500 dark:text-indigo-400">
            <Command className="w-3.5 h-3.5" /> Enterprise Quick Launch
          </span>
        </div>
      </div>
    </div>
  );
}
