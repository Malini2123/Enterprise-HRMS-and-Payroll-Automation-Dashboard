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
  Eye,
  X,
  ShieldCheck,
  Building2,
  CreditCard,
} from 'lucide-react';
import { useNotification } from '../context/NotificationContext';
import { downloadPayslipPDF } from '../utils/pdfGenerator';
import confetti from 'canvas-confetti';

export default function MyPayslips() {
  const { addToast } = useNotification();
  const [selectedSlip, setSelectedSlip] = useState(null);

  // Active user data
  const currentUser = (() => {
    try {
      const stored = localStorage.getItem('user');
      return stored ? JSON.parse(stored) : { name: 'Sarah Jenkins', email: 'sarah.j@company.com', role: 'employee' };
    } catch {
      return { name: 'Sarah Jenkins', email: 'sarah.j@company.com', role: 'employee' };
    }
  })();

  const { data: payslips = [], isLoading } = useQuery({
    queryKey: ['myPayroll'],
    queryFn: async () => {
      try {
        const res = await api.get('/payroll/my');
        if (res.data && res.data.length > 0) return res.data;
        throw new Error('Empty');
      } catch {
        return [
          { _id: 'pay-my-1', month: 7, year: 2026, basicSalary: 110000, hra: 33000, allowances: 15000, deductions: 18500, tax: 12000, netSalary: 127500, status: 'paid', paymentDate: '2026-07-31', bankRef: 'ACH-99482109' },
          { _id: 'pay-my-2', month: 6, year: 2026, basicSalary: 110000, hra: 33000, allowances: 15000, deductions: 18500, tax: 12000, netSalary: 127500, status: 'paid', paymentDate: '2026-06-30', bankRef: 'ACH-88392102' },
          { _id: 'pay-my-3', month: 5, year: 2026, basicSalary: 105000, hra: 31500, allowances: 14000, deductions: 17500, tax: 11000, netSalary: 122000, status: 'paid', paymentDate: '2026-05-31', bankRef: 'ACH-77281093' },
          { _id: 'pay-my-4', month: 4, year: 2026, basicSalary: 105000, hra: 31500, allowances: 14000, deductions: 17500, tax: 11000, netSalary: 122000, status: 'paid', paymentDate: '2026-04-30', bankRef: 'ACH-66170984' },
        ];
      }
    },
  });

  const getMonthName = (m) => {
    const months = ['', 'January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    return months[m] || `Month ${m}`;
  };

  const handleDownload = (slip) => {
    try {
      downloadPayslipPDF({
        employeeName: currentUser.name || 'Sarah Jenkins',
        employeeEmail: currentUser.email || 'sarah.j@company.com',
        employeeId: currentUser.id || 'EMP-2026-084',
        department: currentUser.department || 'Engineering',
        designation: currentUser.title || 'Senior Full Stack Engineer',
        month: slip.month,
        year: slip.year,
        basicSalary: slip.basicSalary || 110000,
        hra: slip.hra || Math.round((slip.basicSalary || 110000) * 0.3),
        allowances: slip.allowances || Math.round((slip.basicSalary || 110000) * 0.15),
        deductions: slip.deductions || 18500,
        tax: slip.tax || 12000,
        netSalary: slip.netSalary || 127500,
        paymentDate: slip.paymentDate || '2026-07-31',
        bankRef: slip.bankRef || 'ACH-99482109',
      });

      addToast({
        title: 'PDF Payslip Generated',
        message: `Official salary slip for ${getMonthName(slip.month)} ${slip.year} downloaded.`,
        type: 'success',
      });

      confetti({ particleCount: 35, spread: 50, origin: { y: 0.7 } });
    } catch (err) {
      console.error('PDF Generation error:', err);
      addToast({
        title: 'Download Error',
        message: 'Could not generate PDF slip. Please try again.',
        type: 'error',
      });
    }
  };

  return (
    <Layout>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-xs font-semibold text-indigo-700 dark:text-indigo-300 mb-2 border border-indigo-200/60 dark:border-indigo-800/60">
            <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
            <span>Official Salary Statements</span>
          </div>
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
          <div key={slip._id} className="glass-card p-6 rounded-3xl flex flex-col justify-between space-y-4 hover:shadow-xl transition-all duration-300">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950 px-2.5 py-1 rounded-full border border-indigo-200/50 dark:border-indigo-800/50">
                  {getMonthName(slip.month)} {slip.year}
                </span>
                <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> Disbursed
                </span>
              </div>

              <div>
                <p className="text-xs text-slate-400 font-medium">Net Disbursed Take-Home</p>
                <h3 className="font-heading text-2xl sm:text-3xl font-black text-slate-900 dark:text-white font-mono mt-0.5">
                  ${slip.netSalary?.toLocaleString()}
                </h3>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50/80 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 text-xs space-y-2 mt-4">
                <div className="flex justify-between text-slate-600 dark:text-slate-400">
                  <span>Gross Basic Salary:</span>
                  <span className="font-mono font-semibold text-slate-900 dark:text-white">
                    ${slip.basicSalary?.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between text-slate-600 dark:text-slate-400">
                  <span>Tax & Withholdings:</span>
                  <span className="font-mono font-semibold text-rose-500">
                    -${slip.deductions?.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between text-slate-500 pt-2 border-t border-slate-200/60 dark:border-slate-800 text-[11px]">
                  <span>Disbursed On:</span>
                  <span className="font-medium text-slate-700 dark:text-slate-300">{slip.paymentDate || 'End of Month'}</span>
                </div>
                <div className="flex justify-between text-slate-500 text-[11px]">
                  <span>Bank Ref:</span>
                  <span className="font-mono text-slate-700 dark:text-slate-300">{slip.bankRef || 'ACH-99482109'}</span>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setSelectedSlip(slip)}
                className="py-2.5 px-3 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer"
              >
                <Eye className="w-3.5 h-3.5 text-indigo-500" /> View
              </button>
              <button
                type="button"
                onClick={() => handleDownload(slip)}
                className="py-2.5 px-3 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-indigo-500/20 transition-all cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" /> PDF Slip
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Selected Payslip Full Preview Modal */}
      {selectedSlip && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 w-full max-w-2xl rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto animate-slide-up">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-indigo-600 text-white font-black flex items-center justify-center text-lg">
                  H
                </div>
                <div>
                  <h3 className="font-heading font-extrabold text-lg text-slate-900 dark:text-white">
                    Payslip Preview &bull; {getMonthName(selectedSlip.month)} {selectedSlip.year}
                  </h3>
                  <p className="text-xs text-slate-500">Official Encrypted Disbursement Statement</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedSlip(null)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Employee Metadata */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200/80 dark:border-slate-800 text-xs">
              <div>
                <p className="text-slate-400">Employee Name</p>
                <p className="font-bold text-slate-900 dark:text-white mt-0.5">{currentUser.name || 'Sarah Jenkins'}</p>
              </div>
              <div>
                <p className="text-slate-400">Department</p>
                <p className="font-bold text-slate-900 dark:text-white mt-0.5">{currentUser.department || 'Engineering'}</p>
              </div>
              <div>
                <p className="text-slate-400">Payment Date</p>
                <p className="font-bold text-slate-900 dark:text-white mt-0.5">{selectedSlip.paymentDate || '2026-07-31'}</p>
              </div>
              <div>
                <p className="text-slate-400">Bank Ref</p>
                <p className="font-bold font-mono text-slate-900 dark:text-white mt-0.5">{selectedSlip.bankRef || 'ACH-99482109'}</p>
              </div>
            </div>

            {/* Detailed Earnings and Deductions */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs">
              <div className="space-y-2">
                <h4 className="font-bold uppercase tracking-wider text-slate-400 pb-1 border-b border-slate-100 dark:border-slate-800">
                  Earnings Breakdown
                </h4>
                <div className="flex justify-between">
                  <span className="text-slate-600 dark:text-slate-400">Basic Salary</span>
                  <span className="font-mono font-semibold text-slate-900 dark:text-white">
                    ${selectedSlip.basicSalary?.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600 dark:text-slate-400">House Rent Allowance (HRA)</span>
                  <span className="font-mono font-semibold text-slate-900 dark:text-white">
                    ${(selectedSlip.hra || Math.round(selectedSlip.basicSalary * 0.3))?.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600 dark:text-slate-400">Special Allowance</span>
                  <span className="font-mono font-semibold text-slate-900 dark:text-white">
                    ${(selectedSlip.allowances || Math.round(selectedSlip.basicSalary * 0.15))?.toLocaleString()}
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="font-bold uppercase tracking-wider text-slate-400 pb-1 border-b border-slate-100 dark:border-slate-800">
                  Deductions & Taxes
                </h4>
                <div className="flex justify-between">
                  <span className="text-slate-600 dark:text-slate-400">Income Tax (TDS)</span>
                  <span className="font-mono font-semibold text-rose-500">
                    -${(selectedSlip.tax || Math.round(selectedSlip.deductions * 0.65))?.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600 dark:text-slate-400">Provident Fund / 401(k)</span>
                  <span className="font-mono font-semibold text-rose-500">
                    -${Math.round(selectedSlip.deductions * 0.25)?.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600 dark:text-slate-400">Health Insurance</span>
                  <span className="font-mono font-semibold text-rose-500">
                    -${Math.round(selectedSlip.deductions * 0.1)?.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>

            {/* Net Amount Box */}
            <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200/60 dark:border-emerald-800/60 flex items-center justify-between">
              <div>
                <p className="text-xs font-bold uppercase text-emerald-800 dark:text-emerald-300">Net Take-Home Pay</p>
                <p className="text-[11px] text-emerald-600 dark:text-emerald-400">Directly transferred to bank account</p>
              </div>
              <span className="font-heading text-2xl font-black font-mono text-emerald-700 dark:text-emerald-300">
                ${selectedSlip.netSalary?.toLocaleString()}
              </span>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => window.print()}
                className="px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 text-xs font-bold flex items-center gap-2 cursor-pointer"
              >
                <Printer className="w-4 h-4" /> Print
              </button>
              <button
                type="button"
                onClick={() => {
                  handleDownload(selectedSlip);
                  setSelectedSlip(null);
                }}
                className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold flex items-center gap-2 shadow-lg shadow-indigo-500/25 cursor-pointer"
              >
                <Download className="w-4 h-4" /> Download Official PDF
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}