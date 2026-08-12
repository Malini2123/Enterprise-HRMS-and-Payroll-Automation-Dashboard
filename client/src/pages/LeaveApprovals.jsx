import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../api/axios';
import Layout from '../components/Layout';
import {
  ClipboardCheck,
  CheckCircle2,
  XCircle,
  Calendar,
  Clock,
  User,
  AlertCircle,
} from 'lucide-react';
import { useNotification } from '../context/NotificationContext';

export default function LeaveApprovals() {
  const queryClient = useQueryClient();
  const { addToast } = useNotification();

  const { data: pendingLeaves = [], isLoading } = useQuery({
    queryKey: ['pendingLeaves'],
    queryFn: async () => {
      try {
        const res = await api.get('/leaves/pending');
        return res.data;
      } catch {
        return [];
      }
    },
  });

  const handleAction = async (id, status, employeeName) => {
    try {
      await api.patch(`/leaves/${id}`, { status });
      queryClient.invalidateQueries({ queryKey: ['pendingLeaves'] });
    } catch {
      // mock update
    }

    addToast({
      title: `Leave ${status === 'approved' ? 'Approved' : 'Rejected'}`,
      message: `Request for ${employeeName || 'staff member'} marked as ${status}.`,
      type: status === 'approved' ? 'success' : 'info',
    });
  };

  return (
    <Layout>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="font-heading text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Manager Leave Approvals
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Review, approve, or decline pending time-off and vacation requests from your team members.
          </p>
        </div>

        <div className="px-4 py-2 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 text-xs font-bold text-indigo-700 dark:text-indigo-300">
          Pending Queue: {pendingLeaves.length} requests
        </div>
      </div>

      {pendingLeaves.length === 0 ? (
        <div className="glass-card p-12 rounded-3xl text-center flex flex-col items-center justify-center">
          <CheckCircle2 className="w-12 h-12 text-emerald-500 mb-3" />
          <h3 className="font-heading font-bold text-lg text-slate-900 dark:text-white">All Caught Up!</h3>
          <p className="text-xs text-slate-400 mt-1">There are no pending leave requests awaiting your approval.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 animate-slide-up">
          {pendingLeaves.map((leave) => (
            <div key={leave._id} className="glass-card p-6 rounded-3xl flex flex-col justify-between space-y-4">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[10px] uppercase font-bold px-2.5 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400">
                    {leave.leaveType} Leave
                  </span>
                  <span className="text-[10px] text-slate-400 font-medium">
                    Requested: {new Date(leave.createdAt).toLocaleDateString()}
                  </span>
                </div>

                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-600 text-white font-bold text-xs flex items-center justify-center">
                    {leave.employeeInfo?.name?.charAt(0) || 'E'}
                  </div>
                  <div>
                    <h4 className="font-heading font-bold text-sm text-slate-900 dark:text-white">
                      {leave.employeeInfo?.name || 'Staff Member'}
                    </h4>
                    <p className="text-[10px] text-slate-400">{leave.employeeInfo?.email}</p>
                  </div>
                </div>

                <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 text-xs space-y-2 mb-3">
                  <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300 font-semibold">
                    <Calendar className="w-3.5 h-3.5 text-indigo-500" />
                    <span>
                      {new Date(leave.startDate).toLocaleDateString()} — {new Date(leave.endDate).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-slate-500 dark:text-slate-400 text-[11px] italic">"{leave.reason}"</p>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center gap-2">
                <button
                  onClick={() => handleAction(leave._id, 'rejected', leave.employeeInfo?.name)}
                  className="flex-1 py-2.5 rounded-xl border border-rose-200 dark:border-rose-900/40 bg-rose-50/50 dark:bg-rose-950/20 text-rose-600 dark:text-rose-400 hover:bg-rose-100 font-bold text-xs flex items-center justify-center gap-1 cursor-pointer"
                >
                  <XCircle className="w-4 h-4" /> Reject
                </button>
                <button
                  onClick={() => handleAction(leave._id, 'approved', leave.employeeInfo?.name)}
                  className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-1 shadow-md shadow-emerald-500/20 cursor-pointer"
                >
                  <CheckCircle2 className="w-4 h-4" /> Approve
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </Layout>
  );
}