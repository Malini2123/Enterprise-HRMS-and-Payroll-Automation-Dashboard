import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import Layout from '../components/Layout';
import AnnouncementsBoard from '../components/AnnouncementsBoard';
import {
  Users,
  Clock,
  DollarSign,
  Briefcase,
  TrendingUp,
  Calendar,
  Sparkles,
  ArrowUpRight,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Play,
  Square,
  Coffee,
  Heart,
  ChevronRight,
  Zap,
} from 'lucide-react';
import { useNotification } from '../context/NotificationContext';
import confetti from 'canvas-confetti';

export default function Dashboard() {
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const stored = localStorage.getItem('user');
      return stored ? JSON.parse(stored) : { name: 'Priya Sharma', role: 'hr_manager', email: 'priya.hr@company.com' };
    } catch {
      return { name: 'Priya Sharma', role: 'hr_manager', email: 'priya.hr@company.com' };
    }
  });

  const isManager = currentUser?.role === 'hr_manager' || currentUser?.role === 'admin';

  return isManager ? <ExecutiveHRDashboard user={currentUser} /> : <EmployeePortalDashboard user={currentUser} />;
}

// ---------------- EXECUTIVE HR MANAGER DASHBOARD ----------------
function ExecutiveHRDashboard({ user }) {
  const navigate = useNavigate();
  const { addToast } = useNotification();

  const { data: stats } = useQuery({
    queryKey: ['employeeStats'],
    queryFn: async () => {
      try {
        const res = await api.get('/employees/stats');
        return res.data;
      } catch {
        return {
          totalEmployees: 48,
          activeToday: 44,
          onLeave: 4,
          remoteCount: 18,
          openPositions: 5,
          pendingLeaveRequests: 3,
          payrollStatus: 'Processed for Current Month',
          payrollAmount: '$482,500.00',
          attendanceRate: '96.4%',
        };
      }
    },
  });

  const { data: employees } = useQuery({
    queryKey: ['employeesList'],
    queryFn: async () => {
      try {
        const res = await api.get('/employees');
        return res.data;
      } catch {
        return [];
      }
    },
  });

  const kpis = [
    {
      title: 'Total Headcount',
      value: stats?.totalEmployees || 48,
      subtext: '+4 joined this quarter',
      icon: Users,
      trend: '+8.2%',
      color: 'from-blue-600 to-cyan-500',
      action: () => navigate('/org-chart'),
    },
    {
      title: 'Present Today',
      value: stats?.activeToday || 44,
      subtext: `${stats?.attendanceRate || '96.4%'} Attendance Rate`,
      icon: Clock,
      trend: '+1.4%',
      color: 'from-emerald-600 to-teal-500',
      action: () => navigate('/attendance'),
    },
    {
      title: 'Monthly Payroll',
      value: stats?.payrollAmount || '$482,500',
      subtext: 'Processed & Disbursed',
      icon: DollarSign,
      trend: 'On Track',
      color: 'from-indigo-600 to-purple-500',
      action: () => navigate('/payroll'),
    },
    {
      title: 'Open ATS Positions',
      value: stats?.openPositions || 5,
      subtext: '14 candidates in pipeline',
      icon: Briefcase,
      trend: 'Active',
      color: 'from-pink-600 to-rose-500',
      action: () => navigate('/recruitment'),
    },
  ];

  return (
    <Layout>
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-indigo-900 via-indigo-800 to-purple-900 text-white p-6 sm:p-8 mb-8 shadow-2xl">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-80 h-80 rounded-full bg-white/5 blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-3 py-1 rounded-full bg-white/10 text-white text-xs font-semibold backdrop-blur-md flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-300" /> Executive HR Suite
              </span>
              <span className="text-xs text-indigo-200">
                {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric', year: 'numeric' })}
              </span>
            </div>
            <h1 className="font-heading text-2xl sm:text-3xl font-extrabold tracking-tight">
              Welcome back, {user?.name || 'HR Director'}!
            </h1>
            <p className="text-indigo-100/80 text-xs sm:text-sm mt-1 max-w-xl">
              All company operations are operating normally with 96.4% attendance and 3 pending leave requests.
            </p>
          </div>

          {/* Quick 1-Click Action Hub */}
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => navigate('/onboard')}
              className="px-4 py-2.5 rounded-2xl bg-white text-indigo-900 hover:bg-indigo-50 font-bold text-xs shadow-lg transition-all flex items-center gap-2 cursor-pointer"
            >
              <Zap className="w-4 h-4 text-indigo-600" /> Onboard Hire
            </button>
            <button
              onClick={() => navigate('/payroll')}
              className="px-4 py-2.5 rounded-2xl bg-indigo-600/80 hover:bg-indigo-600 text-white font-bold text-xs backdrop-blur-md border border-indigo-400/30 transition-all flex items-center gap-2 cursor-pointer"
            >
              <DollarSign className="w-4 h-4" /> Run Payroll
            </button>
            <button
              onClick={() => navigate('/leave-approvals')}
              className="px-4 py-2.5 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs backdrop-blur-md border border-white/20 transition-all flex items-center gap-2 cursor-pointer"
            >
              Pending Leaves ({stats?.pendingLeaveRequests || 3})
            </button>
          </div>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        {kpis.map((kpi, idx) => {
          const Icon = kpi.icon;
          return (
            <div
              key={idx}
              onClick={kpi.action}
              className="glass-card p-5 rounded-3xl cursor-pointer group flex flex-col justify-between"
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-2xl bg-gradient-to-tr ${kpi.color} text-white shadow-md`}>
                  <Icon className="w-5 h-5" />
                </div>
                <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-1 rounded-full flex items-center gap-1">
                  <TrendingUp className="w-3 h-3" /> {kpi.trend}
                </span>
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">{kpi.title}</p>
                <h3 className="font-heading text-2xl font-black text-slate-900 dark:text-white mt-1">
                  {kpi.value}
                </h3>
                <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-400">
                  <span>{kpi.subtext}</span>
                  <ArrowUpRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-indigo-500 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Analytics & Company Operations Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Department Headcount Breakdown */}
        <div className="glass-card p-6 rounded-3xl lg:col-span-2">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="font-heading font-bold text-base text-slate-900 dark:text-white">
                Workforce Distribution by Department
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">Real-time allocation across 48 active staff</p>
            </div>
            <button
              onClick={() => navigate('/org-chart')}
              className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
            >
              View Full Tree <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-4">
            {[
              { name: 'Engineering & Infrastructure', count: 22, percentage: 46, color: 'bg-indigo-600' },
              { name: 'Product & Design', count: 8, percentage: 17, color: 'bg-purple-600' },
              { name: 'Sales & Growth', count: 7, percentage: 15, color: 'bg-pink-500' },
              { name: 'Human Resources & People Ops', count: 6, percentage: 12, color: 'bg-emerald-500' },
              { name: 'Finance & Legal Operations', count: 5, percentage: 10, color: 'bg-amber-500' },
            ].map((dept) => (
              <div key={dept.name}>
                <div className="flex items-center justify-between text-xs font-semibold mb-1.5">
                  <span className="text-slate-700 dark:text-slate-300">{dept.name}</span>
                  <span className="text-slate-500 font-mono">
                    {dept.count} members ({dept.percentage}%)
                  </span>
                </div>
                <div className="w-full h-2.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                  <div
                    className={`h-full rounded-full ${dept.color} transition-all duration-700`}
                    style={{ width: `${dept.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Quick Staff Table Snapshot */}
          <div className="mt-6 pt-5 border-t border-slate-100 dark:border-slate-800">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
              Recent Team Directory Snapshot
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {(employees?.slice(0, 4) || []).map((emp, i) => (
                <div
                  key={i}
                  className="flex items-center gap-3 p-3 rounded-2xl bg-slate-50/80 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800"
                >
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-500 text-white font-bold text-xs flex items-center justify-center">
                    {emp.name?.charAt(0) || 'U'}
                  </div>
                  <div className="truncate">
                    <p className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">{emp.name}</p>
                    <p className="text-[10px] text-slate-400 truncate">{emp.email}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Live Broadcasts & Announcements */}
        <div className="space-y-6">
          <AnnouncementsBoard />

          {/* Upcoming Celebrations Widget */}
          <div className="glass-card p-5 rounded-3xl">
            <div className="flex items-center gap-2 mb-3">
              <Calendar className="w-4 h-4 text-pink-500" />
              <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                Upcoming Celebrations
              </h4>
            </div>
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-2.5 rounded-2xl bg-pink-50/60 dark:bg-pink-950/30 border border-pink-100 dark:border-pink-900/30">
                <span className="text-lg">🎂</span>
                <div>
                  <p className="text-xs font-bold text-slate-800 dark:text-slate-200">Sarah Jenkins</p>
                  <p className="text-[10px] text-slate-500">Birthday • August 15</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-2.5 rounded-2xl bg-indigo-50/60 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/30">
                <span className="text-lg">🎉</span>
                <div>
                  <p className="text-xs font-bold text-slate-800 dark:text-slate-200">Marcus Vance</p>
                  <p className="text-[10px] text-slate-500">3-Year Work Anniversary • August 18</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}

// ---------------- INTERACTIVE EMPLOYEE PORTAL DASHBOARD ----------------
function EmployeePortalDashboard({ user }) {
  const navigate = useNavigate();
  const { addToast } = useNotification();
  const [clockInTime, setClockInTime] = useState(new Date());
  const [isPunchedIn, setIsPunchedIn] = useState(true);
  const [isOnBreak, setIsOnBreak] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(19800); // 5.5 hours

  useEffect(() => {
    let timer;
    if (isPunchedIn && !isOnBreak) {
      timer = setInterval(() => {
        setElapsedSeconds((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isPunchedIn, isOnBreak]);

  const formatTimer = (totalSeconds) => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  };

  const handlePunchToggle = () => {
    if (isPunchedIn) {
      setIsPunchedIn(false);
      addToast({ title: 'Clocked Out', message: 'You have registered your shift punch out. Great job today!', type: 'info' });
    } else {
      setIsPunchedIn(true);
      setClockInTime(new Date());
      addToast({ title: 'Clocked In', message: 'Work clock started! Have a productive day.', type: 'success' });
      confetti({ particleCount: 30, spread: 50, origin: { y: 0.8 } });
    }
  };

  return (
    <Layout>
      {/* Welcome Banner with Live Time Clock */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Left Welcome Card */}
        <div className="lg:col-span-2 relative overflow-hidden rounded-3xl bg-gradient-to-tr from-slate-900 via-indigo-950 to-slate-900 text-white p-6 sm:p-8 shadow-2xl flex flex-col justify-between">
          <div className="absolute top-0 right-0 -mt-10 -mr-10 w-72 h-72 rounded-full bg-indigo-500/10 blur-3xl pointer-events-none" />
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-semibold border border-emerald-500/30 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" /> Active Work Session
              </span>
              <span className="text-xs text-slate-300">Engineering • San Francisco</span>
            </div>
            <h1 className="font-heading text-2xl sm:text-3xl font-extrabold tracking-tight">
              Hello, {user?.name || 'Sarah Jenkins'}!
            </h1>
            <p className="text-slate-300 text-xs sm:text-sm mt-1 max-w-lg">
              Your shift is actively tracked. You have completed 68% of your standard 8-hour workday.
            </p>
          </div>

          <div className="grid grid-cols-3 gap-3 sm:gap-4 mt-6 pt-6 border-t border-slate-800">
            <div className="p-3 rounded-2xl bg-white/5 border border-white/10">
              <p className="text-[11px] text-slate-400">Casual Leave</p>
              <p className="font-heading text-lg font-bold text-white mt-0.5">8 / 12 Days</p>
            </div>
            <div className="p-3 rounded-2xl bg-white/5 border border-white/10">
              <p className="text-[11px] text-slate-400">Sick Leave</p>
              <p className="font-heading text-lg font-bold text-white mt-0.5">10 / 12 Days</p>
            </div>
            <div className="p-3 rounded-2xl bg-white/5 border border-white/10">
              <p className="text-[11px] text-slate-400">Earned PTO</p>
              <p className="font-heading text-lg font-bold text-white mt-0.5">14 / 20 Days</p>
            </div>
          </div>
        </div>

        {/* Live Punch Clock Widget */}
        <div className="glass-card p-6 rounded-3xl flex flex-col justify-between items-center text-center">
          <div className="w-full flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Time Clock</span>
            <span className="text-xs font-mono text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950 px-2.5 py-1 rounded-full font-bold">
              Office Mode
            </span>
          </div>

          <div className="my-3">
            <p className="text-4xl font-black font-mono-nums tracking-tight text-slate-900 dark:text-white gradient-text">
              {formatTimer(elapsedSeconds)}
            </p>
            <p className="text-xs text-slate-400 mt-1">Shift Start: 09:00 AM • Target: 8h 00m</p>
          </div>

          {/* Action buttons */}
          <div className="w-full flex items-center gap-2">
            <button
              onClick={handlePunchToggle}
              className={`flex-1 py-3 rounded-2xl font-bold text-xs flex items-center justify-center gap-2 shadow-lg transition-all cursor-pointer ${
                isPunchedIn
                  ? 'bg-rose-600 hover:bg-rose-700 text-white shadow-rose-500/20'
                  : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-500/20'
              }`}
            >
              {isPunchedIn ? <Square className="w-4 h-4 fill-white" /> : <Play className="w-4 h-4 fill-white" />}
              {isPunchedIn ? 'Punch Out' : 'Punch In'}
            </button>

            <button
              onClick={() => {
                setIsOnBreak(!isOnBreak);
                addToast({
                  title: isOnBreak ? 'Break Ended' : 'Break Started',
                  message: isOnBreak ? 'Timer resumed.' : 'Timer paused for coffee break.',
                  type: 'info',
                });
              }}
              className={`p-3 rounded-2xl border font-semibold text-xs flex items-center justify-center transition-all cursor-pointer ${
                isOnBreak
                  ? 'bg-amber-500 text-white border-amber-600'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
              }`}
              title="Toggle Coffee / Lunch Break"
            >
              <Coffee className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Employee Quick Actions & Modules */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        <div
          onClick={() => navigate('/request-leave')}
          className="glass-card p-5 rounded-3xl cursor-pointer group"
        >
          <div className="p-3 rounded-2xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 w-fit mb-3">
            <Calendar className="w-5 h-5" />
          </div>
          <h4 className="font-heading font-bold text-sm text-slate-900 dark:text-white">Request Time Off</h4>
          <p className="text-xs text-slate-400 mt-1">Apply for casual, sick, or annual leave</p>
        </div>

        <div
          onClick={() => navigate('/my-payslips')}
          className="glass-card p-5 rounded-3xl cursor-pointer group"
        >
          <div className="p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 w-fit mb-3">
            <DollarSign className="w-5 h-5" />
          </div>
          <h4 className="font-heading font-bold text-sm text-slate-900 dark:text-white">My Payslips</h4>
          <p className="text-xs text-slate-400 mt-1">July 2026 slip available for download</p>
        </div>

        <div
          onClick={() => navigate('/performance')}
          className="glass-card p-5 rounded-3xl cursor-pointer group"
        >
          <div className="p-3 rounded-2xl bg-pink-50 dark:bg-pink-950 text-pink-600 dark:text-pink-400 w-fit mb-3">
            <Heart className="w-5 h-5" />
          </div>
          <h4 className="font-heading font-bold text-sm text-slate-900 dark:text-white">Peer Kudos Wall</h4>
          <p className="text-xs text-slate-400 mt-1">Send praise and celebrate wins</p>
        </div>

        <div
          onClick={() => navigate('/helpdesk')}
          className="glass-card p-5 rounded-3xl cursor-pointer group"
        >
          <div className="p-3 rounded-2xl bg-amber-50 dark:bg-amber-950 text-amber-600 dark:text-amber-400 w-fit mb-3">
            <Zap className="w-5 h-5" />
          </div>
          <h4 className="font-heading font-bold text-sm text-slate-900 dark:text-white">IT & HR Helpdesk</h4>
          <p className="text-xs text-slate-400 mt-1">Submit tickets and equipment requests</p>
        </div>
      </div>

      {/* Announcements Stream */}
      <AnnouncementsBoard />
    </Layout>
  );
}