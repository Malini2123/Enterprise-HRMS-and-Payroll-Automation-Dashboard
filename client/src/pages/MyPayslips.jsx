import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '../api/axios';
import Layout from '../components/Layout';
import {
  FileText,
  Download,
  DollarSign,
  Calendar,
  CheckCircle2,
  Printer,
  Sparkles,
  TrendingUp,
} from 'lucide-react';
import { useNotification } from '../context/NotificationContext';

export default function MyPayslips() {
  const { addToast } = useNotification();

  const { data: payslips = [], isLoading } = useQuery({
    queryKey: ['myPayroll'],
    queryFn: async () => {
      try {
        const res = await api.get('/payroll/my');
        return res.data;
      } catch {
        return [];
      }
    },
  });

  const handleDownload = async (payrollId, month, year) => {
    addToast({
      title: 'Downloading Payslip PDF',
      message: `Generating encrypted salary slip for ${month}/${year}...`,
      type: 'success',
    });

    try {
      const response = await api.get(`/payroll/${payrollId}/payslip`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Payslip_${month}_${year}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch {
      // Demo download fallback
    }
  };

  const getMonthName = (m) => {
    const months = ['', 'January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    return months[m] || `Month ${m}`;
  };

  return (
    <Layout>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="font-heading text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            My Salary Slips & Tax Statements
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Access, view, and download your monthly encrypted payslip statements and tax withholding summaries.
          </p>
        </div>
      </div>

      {/* Payslip Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 animate-slide-up">
        {payslips.map((slip) => (
          <div key={slip._id} className="glass-card p-6 rounded-3xl flex flex-col justify-between space-y-4">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950 px-2.5 py-1 rounded-full">
                  {getMonthName(slip.month)} {slip.year}
                </span>
                <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> Paid
                </span>
              </div>

              <div>
                <p className="text-xs text-slate-400 font-medium">Net Disbursed Take-Home</p>
                <h3 className="font-heading text-2xl sm:text-3xl font-black text-slate-900 dark:text-white font-mono mt-0.5">
                  ${slip.netSalary?.toLocaleString()}
                </h3>
              </div>

              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 text-xs space-y-1.5 mt-4">
                <div className="flex justify-between text-slate-500">
                  <span>Gross Basic Salary:</span>
                  <span className="font-mono font-semibold text-slate-900 dark:text-white">
                    ${slip.basicSalary?.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between text-slate-500">
                  <span>Total Tax Deductions:</span>
                  <span className="font-mono font-semibold text-rose-500">
                    -${slip.deductions?.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between text-slate-500 pt-1 border-t border-slate-100 dark:border-slate-800 text-[11px]">
                  <span>Disbursed On:</span>
                  <span>{slip.paymentDate || 'End of Month'}</span>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center gap-2">
              <button
                onClick={() => handleDownload(slip._id, slip.month, slip.year)}
                className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md shadow-indigo-500/20 cursor-pointer"
              >
                <Download className="w-4 h-4" /> Download PDF Slip
              </button>
            </div>
          </div>
        ))}
      </div>
    </Layout>
  );
}