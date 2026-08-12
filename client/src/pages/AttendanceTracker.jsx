import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../api/axios';
import Layout from '../components/Layout';
import {
  Clock,
  Play,
  Square,
  Coffee,
  CheckCircle2,
  Calendar,
  AlertTriangle,
  FileCheck,
  TrendingUp,
  MapPin,
  Laptop,
  Building,
  PlusCircle,
  X,
} from 'lucide-react';
import { useNotification } from '../context/NotificationContext';
import confetti from 'canvas-confetti';

export default function AttendanceTracker() {
  const queryClient = useQueryClient();
  const { addToast } = useNotification();

  const [workMode, setWorkMode] = useState('office');
  const [isPunchedIn, setIsPunchedIn] = useState(true);
  const [isOnBreak, setIsOnBreak] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(20100); // 5h 35m
  const [isRegularizeModalOpen, setIsRegularizeModalOpen] = useState(false);
  const [regForm, setRegForm] = useState({
    date: new Date().toISOString().split('T')[0],
    punchIn: '09:00',
    punchOut: '17:30',
    reason: '',
  });

  // Fetch Attendance History
  const { data: history = [], isLoading } = useQuery({
    queryKey: ['attendanceHistory'],
    queryFn: async () => {
      try {
        const res = await api.get('/attendance/history');
        return res.data;
      } catch {
        return [];
      }
    },
  });

  // Timer runner
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
      addToast({
        title: 'Punched Out',
        message: `Registered total shift time of ${(elapsedSeconds / 3600).toFixed(1)} hrs. Have a great evening!`,
        type: 'info',
      });
    } else {
      setIsPunchedIn(true);
      setElapsedSeconds(0);
      addToast({
        title: 'Punched In Successfully',
        message: `Clock started under ${workMode.toUpperCase()} mode. Have a productive shift!`,
        type: 'success',
      });
      confetti({ particleCount: 40, spread: 60, origin: { y: 0.7 } });
    }
  };

  const handleRegularizeSubmit = (e) => {
    e.preventDefault();
    if (!regForm.reason) {
      addToast({ title: 'Validation Error', message: 'Please specify the reason for attendance regularization.', type: 'error' });
      return;
    }
    addToast({
      title: 'Regularization Request Submitted',
      message: `Your request for ${regForm.date} has been forwarded to HR for approval.`,
      type: 'success',
    });
    setIsRegularizeModalOpen(false);
    setRegForm({ date: new Date().toISOString().split('T')[0], punchIn: '09:00', punchOut: '17:30', reason: '' });
  };

  const shiftProgressPercent = Math.min(100, Math.round((elapsedSeconds / (8 * 3600)) * 100));

  return (
    <Layout>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="font-heading text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Attendance & Time Tracker
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Real-time shift clocking, break logs, monthly attendance matrix, and regularizations.
          </p>
        </div>
        <button
          onClick={() => setIsRegularizeModalOpen(true)}
          className="px-4 py-2.5 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-300 font-bold text-xs border border-indigo-200/60 dark:border-indigo-800/60 hover:bg-indigo-100 transition-all flex items-center gap-2 cursor-pointer w-fit"
        >
          <PlusCircle className="w-4 h-4" /> Request Regularization
        </button>
      </div>

      {/* Top Section: Live Clock & Work Mode */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Active Clock Panel */}
        <div className="lg:col-span-2 glass-card p-6 sm:p-8 rounded-3xl relative overflow-hidden flex flex-col justify-between">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <div className="flex items-center gap-2">
                <span
                  className={`w-2.5 h-2.5 rounded-full ${
                    isPunchedIn && !isOnBreak ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'
                  }`}
                />
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  {isPunchedIn ? (isOnBreak ? 'On Coffee Break' : 'Active Shift') : 'Shift Ended'}
                </span>
              </div>
              <h2 className="font-heading text-xl font-bold text-slate-900 dark:text-white mt-1">
                Today's Working Session
              </h2>
            </div>

            {/* Work Mode Toggle Chips */}
            <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
              {[
                { id: 'office', label: 'Office', icon: Building },
                { id: 'remote', label: 'Remote', icon: Laptop },
                { id: 'hybrid', label: 'Hybrid', icon: MapPin },
              ].map((m) => {
                const Icon = m.icon;
                const active = workMode === m.id;
                return (
                  <button
                    key={m.id}
                    onClick={() => {
                      setWorkMode(m.id);
                      addToast({ title: 'Work Mode Updated', message: `Switched to ${m.label} mode.`, type: 'info' });
                    }}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                      active
                        ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm'
                        : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    {m.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Large Digital Display */}
          <div className="my-4 flex flex-col sm:flex-row sm:items-center justify-between gap-6 bg-slate-50/80 dark:bg-slate-900/60 p-6 rounded-3xl border border-slate-100 dark:border-slate-800">
            <div>
              <p className="text-xs font-semibold text-slate-400 mb-1">Elapsed Shift Time</p>
              <p className="text-4xl sm:text-5xl font-black font-mono-nums tracking-tight text-slate-900 dark:text-white gradient-text">
                {formatTimer(elapsedSeconds)}
              </p>
              <p className="text-xs text-slate-400 mt-2">Punched In: 09:00 AM • Target Duration: 08h 00m</p>
            </div>

            {/* Circular Progress & Buttons */}
            <div className="flex items-center gap-3">
              <button
                onClick={handlePunchToggle}
                className={`px-6 py-3.5 rounded-2xl font-bold text-xs sm:text-sm flex items-center gap-2 shadow-xl transition-all cursor-pointer ${
                  isPunchedIn
                    ? 'bg-rose-600 hover:bg-rose-700 text-white shadow-rose-500/25'
                    : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-500/25'
                }`}
              >
                {isPunchedIn ? <Square className="w-4 h-4 fill-white" /> : <Play className="w-4 h-4 fill-white" />}
                {isPunchedIn ? 'Punch Out' : 'Punch In'}
              </button>

              <button
                onClick={() => {
                  setIsOnBreak(!isOnBreak);
                  addToast({
                    title: isOnBreak ? 'Break Concluded' : 'Break Logged',
                    message: isOnBreak ? 'Shift timer resumed.' : 'Break timer started.',
                    type: 'info',
                  });
                }}
                className={`p-3.5 rounded-2xl border font-bold text-xs flex items-center gap-2 transition-all cursor-pointer ${
                  isOnBreak
                    ? 'bg-amber-500 text-white border-amber-600'
                    : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                }`}
              >
                <Coffee className="w-4 h-4" />
                <span>{isOnBreak ? 'End Break' : 'Take Break'}</span>
              </button>
            </div>
          </div>

          {/* Shift Goal Progress Bar */}
          <div>
            <div className="flex items-center justify-between text-xs font-semibold mb-2">
              <span className="text-slate-600 dark:text-slate-400">Daily Target Completion</span>
              <span className="text-indigo-600 dark:text-indigo-400 font-mono">{shiftProgressPercent}% (5.5h / 8.0h)</span>
            </div>
            <div className="w-full h-3 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 transition-all duration-500"
                style={{ width: `${shiftProgressPercent}%` }}
              />
            </div>
          </div>
        </div>

        {/* Monthly Summary KPI Card */}
        <div className="glass-card p-6 rounded-3xl flex flex-col justify-between">
          <div>
            <h3 className="font-heading font-bold text-base text-slate-900 dark:text-white mb-4">
              Monthly Attendance Summary
            </h3>
            <div className="space-y-3">
              <div className="p-3 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/40 border border-emerald-100 dark:border-emerald-900/30 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">Present Days</span>
                </div>
                <span className="text-xs font-bold font-mono text-emerald-600 dark:text-emerald-400">20 Days</span>
              </div>

              <div className="p-3 rounded-2xl bg-amber-50/60 dark:bg-amber-950/40 border border-amber-100 dark:border-amber-900/30 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                  <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">Late Arrivals</span>
                </div>
                <span className="text-xs font-bold font-mono text-amber-600 dark:text-amber-400">1 Day</span>
              </div>

              <div className="p-3 rounded-2xl bg-indigo-50/60 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/30 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <Calendar className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                  <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">Approved Leaves</span>
                </div>
                <span className="text-xs font-bold font-mono text-indigo-600 dark:text-indigo-400">1 Day</span>
              </div>

              <div className="p-3 rounded-2xl bg-purple-50/60 dark:bg-purple-950/40 border border-purple-100 dark:border-purple-900/30 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <TrendingUp className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                  <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">Total Hours</span>
                </div>
                <span className="text-xs font-bold font-mono text-purple-600 dark:text-purple-400">168.5 hrs</span>
              </div>
            </div>
          </div>

          <div className="pt-4 mt-4 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-400 text-center">
            Calculated for payroll cycle: Aug 1 - Aug 31, 2026
          </div>
        </div>
      </div>

      {/* 30-Day Interactive Attendance History Matrix */}
      <div className="glass-card p-6 rounded-3xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h3 className="font-heading font-bold text-base text-slate-900 dark:text-white">
              30-Day Attendance Matrix & Time Logs
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Color-coded status indicators with punch timestamps and logged working hours.
            </p>
          </div>

          {/* Status Legends */}
          <div className="flex flex-wrap items-center gap-2.5 text-[11px] font-semibold">
            <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> Present (8h+)
            </span>
            <span className="flex items-center gap-1.5 text-amber-600 dark:text-amber-400">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500" /> Late / Half Day
            </span>
            <span className="flex items-center gap-1.5 text-indigo-600 dark:text-indigo-400">
              <span className="w-2.5 h-2.5 rounded-full bg-indigo-500" /> On Leave
            </span>
            <span className="flex items-center gap-1.5 text-slate-400">
              <span className="w-2.5 h-2.5 rounded-full bg-slate-300 dark:bg-slate-700" /> Weekend
            </span>
          </div>
        </div>

        {/* Table View */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 uppercase tracking-wider font-bold">
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Punch In</th>
                <th className="py-3 px-4">Punch Out</th>
                <th className="py-3 px-4">Work Hours</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {history.slice(0, 10).map((row, idx) => (
                <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                  <td className="py-3 px-4 font-medium text-slate-900 dark:text-slate-100">{row.date}</td>
                  <td className="py-3 px-4 font-mono text-slate-600 dark:text-slate-300">{row.punchIn}</td>
                  <td className="py-3 px-4 font-mono text-slate-600 dark:text-slate-300">{row.punchOut}</td>
                  <td className="py-3 px-4 font-mono font-semibold text-slate-800 dark:text-slate-200">
                    {row.hours > 0 ? `${row.hours} hrs` : '-'}
                  </td>
                  <td className="py-3 px-4">
                    <span
                      className={`px-2.5 py-1 rounded-full text-[11px] font-bold capitalize ${
                        row.status === 'present'
                          ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400'
                          : row.status === 'late' || row.status === 'half_day'
                          ? 'bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400'
                          : row.status === 'on_leave'
                          ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-400'
                      }`}
                    >
                      {row.status.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    {row.status === 'late' || row.status === 'half_day' ? (
                      <button
                        onClick={() => {
                          setRegForm((prev) => ({ ...prev, date: row.date }));
                          setIsRegularizeModalOpen(true);
                        }}
                        className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
                      >
                        Regularize
                      </button>
                    ) : (
                      <span className="text-slate-400">-</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Regularization Modal */}
      {isRegularizeModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-slide-up">
          <div className="w-full max-w-lg rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
              <h3 className="font-heading font-bold text-lg text-slate-900 dark:text-white">
                Request Attendance Regularization
              </h3>
              <button onClick={() => setIsRegularizeModalOpen(false)} className="p-1 text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleRegularizeSubmit} className="mt-5 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Missed / Correction Date
                </label>
                <input
                  type="date"
                  value={regForm.date}
                  onChange={(e) => setRegForm({ ...regForm, date: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-medium outline-none focus:border-indigo-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Actual Punch In
                  </label>
                  <input
                    type="time"
                    value={regForm.punchIn}
                    onChange={(e) => setRegForm({ ...regForm, punchIn: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-medium outline-none focus:border-indigo-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Actual Punch Out
                  </label>
                  <input
                    type="time"
                    value={regForm.punchOut}
                    onChange={(e) => setRegForm({ ...regForm, punchOut: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-medium outline-none focus:border-indigo-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Reason for Regularization
                </label>
                <textarea
                  rows={3}
                  value={regForm.reason}
                  onChange={(e) => setRegForm({ ...regForm, reason: e.target.value })}
                  placeholder="e.g. Biometric reader was offline, worked from client site, VPN sync issue..."
                  className="w-full px-4 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-medium outline-none focus:border-indigo-500 resize-none"
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsRegularizeModalOpen(false)}
                  className="px-4 py-2 rounded-2xl text-xs font-semibold text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-lg shadow-indigo-500/20"
                >
                  Submit for Approval
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </Layout>
  );
}
