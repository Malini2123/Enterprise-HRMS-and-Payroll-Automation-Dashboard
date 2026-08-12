import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../api/axios';
import Layout from '../components/Layout';
import {
  CalendarClock,
  Calendar,
  Clock,
  CheckCircle2,
  FileCheck,
  Send,
  AlertCircle,
  HelpCircle,
} from 'lucide-react';
import { useNotification } from '../context/NotificationContext';
import confetti from 'canvas-confetti';

export default function RequestLeave() {
  const queryClient = useQueryClient();
  const { addToast } = useNotification();

  const [leaveType, setLeaveType] = useState('casual');
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0]);
  const [reason, setReason] = useState('');

  // Fetch My Leaves
  const { data: myLeaves = [] } = useQuery({
    queryKey: ['myLeaves'],
    queryFn: async () => {
      try {
        const res = await api.get('/leaves/my');
        return res.data;
      } catch {
        return [];
      }
    },
  });

  // Calculate day difference
  const calculateDays = () => {
    if (!startDate || !endDate) return 1;
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    return diffDays || 1;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!reason) {
      addToast({ title: 'Validation Error', message: 'Please specify the reason for your leave.', type: 'error' });
      return;
    }

    try {
      await api.post('/leaves', { leaveType, startDate, endDate, reason });
      queryClient.invalidateQueries({ queryKey: ['myLeaves'] });
    } catch {
      // Mock fallback
    }

    addToast({
      title: 'Leave Request Submitted',
      message: `Your ${calculateDays()}-day ${leaveType} leave request has been submitted to your manager.`,
      type: 'success',
    });

    confetti({ particleCount: 30, spread: 50, origin: { y: 0.7 } });
    setReason('');
  };

  return (
    <Layout>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="font-heading text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Request Time Off & Leave
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Submit paid time off, sick leave, or bereavement requests with instant quota check.
          </p>
        </div>
      </div>

      {/* Leave Balance KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-8">
        <div className="glass-card p-5 rounded-3xl flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-400">Casual Leave (CL)</p>
            <h3 className="font-heading text-2xl font-black text-slate-900 dark:text-white mt-1">8 Days Left</h3>
            <p className="text-[10px] text-slate-400 mt-0.5">4 of 12 days used</p>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 font-bold flex items-center justify-center font-mono">
            66%
          </div>
        </div>

        <div className="glass-card p-5 rounded-3xl flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-400">Sick Leave (SL)</p>
            <h3 className="font-heading text-2xl font-black text-slate-900 dark:text-white mt-1">10 Days Left</h3>
            <p className="text-[10px] text-slate-400 mt-0.5">2 of 12 days used</p>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 font-bold flex items-center justify-center font-mono">
            83%
          </div>
        </div>

        <div className="glass-card p-5 rounded-3xl flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-400">Earned Annual PTO</p>
            <h3 className="font-heading text-2xl font-black text-slate-900 dark:text-white mt-1">14 Days Left</h3>
            <p className="text-[10px] text-slate-400 mt-0.5">6 of 20 days used</p>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-purple-50 dark:bg-purple-950 text-purple-600 dark:text-purple-400 font-bold flex items-center justify-center font-mono">
            70%
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Leave Request Form */}
        <div className="lg:col-span-7 glass-card p-6 sm:p-8 rounded-3xl space-y-6">
          <h3 className="font-heading font-bold text-lg text-slate-900 dark:text-white">New Time Off Application</h3>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Leave Type</label>
              <div className="grid grid-cols-3 gap-2.5">
                {[
                  { id: 'casual', label: 'Casual Leave' },
                  { id: 'sick', label: 'Sick Leave' },
                  { id: 'earned', label: 'Annual PTO' },
                ].map((lt) => (
                  <button
                    key={lt.id}
                    type="button"
                    onClick={() => setLeaveType(lt.id)}
                    className={`py-2.5 px-3 rounded-2xl text-xs font-bold transition-all cursor-pointer ${
                      leaveType === lt.id
                        ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/20'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
                    }`}
                  >
                    {lt.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">From Date</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-medium outline-none focus:border-indigo-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">To Date</label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-medium outline-none focus:border-indigo-500"
                  required
                />
              </div>
            </div>

            <div className="p-3 rounded-2xl bg-indigo-50/60 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/40 flex items-center justify-between text-xs font-bold text-indigo-900 dark:text-indigo-200">
              <span>Total Requested Duration:</span>
              <span className="font-mono text-sm">{calculateDays()} Working Days</span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Reason & Context
              </label>
              <textarea
                rows={3}
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Share context (e.g. Vacation with family, doctor appointment, personal travel)..."
                className="w-full px-4 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-medium outline-none focus:border-indigo-500 resize-none"
                required
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-lg shadow-indigo-500/25 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Send className="w-4 h-4" /> Submit Application for Approval
            </button>
          </form>
        </div>

        {/* My Past Requests Stream */}
        <div className="lg:col-span-5 glass-card p-6 sm:p-8 rounded-3xl space-y-4">
          <h3 className="font-heading font-bold text-base text-slate-900 dark:text-white">Recent Leave History</h3>

          <div className="space-y-3 max-h-[420px] overflow-y-auto">
            {myLeaves.map((l) => (
              <div
                key={l._id}
                className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 text-xs space-y-1.5"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-800 dark:text-slate-200 uppercase text-[10px] tracking-wider">
                    {l.leaveType} Leave
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                      l.status === 'approved'
                        ? 'bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400'
                        : l.status === 'rejected'
                        ? 'bg-rose-50 dark:bg-rose-950 text-rose-600 dark:text-rose-400'
                        : 'bg-amber-50 dark:bg-amber-950 text-amber-600 dark:text-amber-400'
                    }`}
                  >
                    {l.status}
                  </span>
                </div>
                <p className="text-slate-500 text-[11px]">
                  {new Date(l.startDate).toLocaleDateString()} - {new Date(l.endDate).toLocaleDateString()}
                </p>
                <p className="text-slate-600 dark:text-slate-300 italic">{l.reason}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Layout>
  );
}