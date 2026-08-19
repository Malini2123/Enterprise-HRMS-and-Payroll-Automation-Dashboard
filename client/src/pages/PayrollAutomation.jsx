import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '../api/axios';
import Layout from '../components/Layout';
import {
  DollarSign,
  Play,
  CheckCircle2,
  FileText,
  Calculator,
  Download,
  Printer,
  TrendingUp,
  Percent,
  Sparkles,
  ArrowRight,
  Shield,
  X,
} from 'lucide-react';
import { useNotification } from '../context/NotificationContext';
import confetti from 'canvas-confetti';
import { downloadPayslipPDF } from '../utils/pdfGenerator';

export default function PayrollAutomation() {
  const { addToast } = useNotification();
  const [activeTab, setActiveTab] = useState('process'); // 'process', 'structure', 'tax'

  // Payroll Run States
  const [isRunning, setIsRunning] = useState(false);
  const [runProgress, setRunProgress] = useState(0);
  const [runStepMessage, setRunStepMessage] = useState('');
  const [isRunCompleted, setIsRunCompleted] = useState(false);

  // Selected Payslip Modal
  const [selectedPayslip, setSelectedPayslip] = useState(null);

  // Tax Estimator inputs
  const [annualGross, setAnnualGross] = useState(1200000);
  const [section80C, setSection80C] = useState(150000);
  const [section80D, setSection80D] = useState(25000);
  const [hraExempt, setHraExempt] = useState(180000);

  // Fetch Payroll History
  const { data: payrollRecords = [] } = useQuery({
    queryKey: ['allPayrollRecords'],
    queryFn: async () => {
      try {
        const res = await api.get('/payroll');
        return res.data;
      } catch {
        return [];
      }
    },
  });

  // 1-Click Automated Batch Run Handler
  const handleExecuteBatchRun = () => {
    setIsRunning(true);
    setRunProgress(10);
    setRunStepMessage('Aggregating monthly attendance and approved leave logs for 48 staff...');
    setIsRunCompleted(false);

    setTimeout(() => {
      setRunProgress(35);
      setRunStepMessage('Computing tax deductions, 401(k) / PF withholdings, and overtime...');
    }, 900);

    setTimeout(() => {
      setRunProgress(70);
      setRunStepMessage('Generating bank ACH direct deposit dispatches & encrypted payslips...');
    }, 1800);

    setTimeout(() => {
      setRunProgress(100);
      setRunStepMessage('Batch cycle completed! Disbursed $477,500.00 across all 48 employees.');
      setIsRunning(false);
      setIsRunCompleted(true);
      addToast({
        title: 'Payroll Cycle Successfully Processed',
        message: '48 employee payslips published and bank settlement batch dispatched.',
        type: 'success',
      });
      confetti({ particleCount: 60, spread: 70, origin: { y: 0.6 } });
    }, 2700);
  };

  // Tax calculation helper
  const calculateTaxes = () => {
    const gross = Number(annualGross) || 1200000;
    const s80c = Math.min(Number(section80C) || 0, 150000);
    const s80d = Math.min(Number(section80D) || 0, 50000);
    const hra = Number(hraExempt) || 0;

    // Old Regime
    const oldTaxable = Math.max(0, gross - 50000 - s80c - s80d - hra);
    let oldTax = 0;
    if (oldTaxable > 1000000) oldTax = (oldTaxable - 1000000) * 0.3 + 112500;
    else if (oldTaxable > 500000) oldTax = (oldTaxable - 500000) * 0.2 + 12500;
    else if (oldTaxable > 250000) oldTax = (oldTaxable - 250000) * 0.05;
    const oldTaxFinal = Math.round(oldTax * 1.04);

    // New Regime
    const newTaxable = Math.max(0, gross - 75000);
    let newTax = 0;
    if (newTaxable > 1500000) newTax = (newTaxable - 1500000) * 0.3 + 140000;
    else if (newTaxable > 1200000) newTax = (newTaxable - 1200000) * 0.2 + 80000;
    else if (newTaxable > 900000) newTax = (newTaxable - 900000) * 0.15 + 35000;
    else if (newTaxable > 600000) newTax = (newTaxable - 600000) * 0.1 + 5000;
    else if (newTaxable > 300000) newTax = (newTaxable - 300000) * 0.05;
    const newTaxFinal = Math.round(newTax * 1.04);

    return {
      oldTaxFinal,
      newTaxFinal,
      oldTaxable,
      newTaxable,
      recommended: newTaxFinal <= oldTaxFinal ? 'New Regime' : 'Old Regime',
      savings: Math.abs(oldTaxFinal - newTaxFinal),
    };
  };

  const taxResult = calculateTaxes();

  return (
    <Layout>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="font-heading text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Automated Payroll & Salary Engine
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Batch payroll run execution, tax regime simulator, earnings/deductions breakdown, and payslip generation.
          </p>
        </div>

        {/* Tab Navigation Pill */}
        <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-slate-200/80 dark:bg-slate-800/80 border border-slate-300/60 dark:border-slate-700/60 w-fit">
          {[
            { id: 'process', label: 'Batch Processing' },
            { id: 'structure', label: 'Salary Structure' },
            { id: 'tax', label: 'Tax Estimator' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === tab.id
                  ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* TAB 1: BATCH PROCESSING WIZARD */}
      {activeTab === 'process' && (
        <div className="space-y-8 animate-slide-up">
          {/* Automated Run Card */}
          <div className="glass-card p-6 sm:p-8 rounded-3xl relative overflow-hidden">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-slate-100 dark:border-slate-800">
              <div>
                <span className="px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 text-xs font-bold">
                  Active Cycle: August 2026
                </span>
                <h2 className="font-heading text-xl sm:text-2xl font-bold text-slate-900 dark:text-white mt-2">
                  1-Click Batch Payroll Automation
                </h2>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-xl">
                  Automatically calculate all salaries, subtract tax withholdings & benefits, and prepare direct deposit batches.
                </p>
              </div>

              <button
                disabled={isRunning}
                onClick={handleExecuteBatchRun}
                className={`px-6 py-3.5 rounded-2xl font-bold text-xs sm:text-sm flex items-center gap-2 shadow-xl transition-all cursor-pointer shrink-0 ${
                  isRunning
                    ? 'bg-slate-400 cursor-not-allowed text-white'
                    : 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-indigo-500/25'
                }`}
              >
                <Play className="w-4 h-4 fill-white" />
                {isRunning ? 'Processing Cycle...' : 'Run Automated Payroll'}
              </button>
            </div>

            {/* Run Progress Animation */}
            {(isRunning || isRunCompleted) && (
              <div className="mt-6 p-5 rounded-2xl bg-indigo-50/60 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/40 animate-slide-up">
                <div className="flex items-center justify-between text-xs font-bold text-slate-800 dark:text-slate-200 mb-2">
                  <span className="flex items-center gap-2">
                    {isRunCompleted ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    ) : (
                      <div className="w-3.5 h-3.5 rounded-full border-2 border-indigo-600 border-t-transparent animate-spin" />
                    )}
                    {runStepMessage}
                  </span>
                  <span className="font-mono text-indigo-600 dark:text-indigo-400">{runProgress}%</span>
                </div>
                <div className="w-full h-3 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-indigo-500 via-purple-500 to-emerald-500 transition-all duration-300"
                    style={{ width: `${runProgress}%` }}
                  />
                </div>
              </div>
            )}

            {/* Payroll Cycle KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6">
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                <p className="text-xs text-slate-400 font-medium">Total Gross Payroll</p>
                <p className="font-heading text-xl font-bold text-slate-900 dark:text-white mt-1">$542,000.00</p>
                <p className="text-[10px] text-slate-400 mt-1">48 Total Employees</p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                <p className="text-xs text-slate-400 font-medium">Total Taxes & Withholdings</p>
                <p className="font-heading text-xl font-bold text-rose-600 dark:text-rose-400 mt-1">-$64,500.00</p>
                <p className="text-[10px] text-slate-400 mt-1">Federal + State + Benefits</p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                <p className="text-xs text-slate-400 font-medium">Net Disbursed Amount</p>
                <p className="font-heading text-xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">
                  $477,500.00
                </p>
                <p className="text-[10px] text-emerald-500 font-semibold mt-1">Direct Deposit Ready</p>
              </div>
            </div>
          </div>

          {/* Payroll Records List */}
          <div className="glass-card p-6 rounded-3xl">
            <h3 className="font-heading font-bold text-base text-slate-900 dark:text-white mb-4">
              Disbursed Employee Records (July 2026)
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 uppercase tracking-wider font-bold">
                    <th className="py-3 px-4">Employee</th>
                    <th className="py-3 px-4">Basic</th>
                    <th className="py-3 px-4">HRA / Allowances</th>
                    <th className="py-3 px-4">Deductions</th>
                    <th className="py-3 px-4">Net Salary</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Payslip</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                  {payrollRecords.map((rec, i) => (
                    <tr key={i} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                      <td className="py-3 px-4">
                        <p className="font-bold text-slate-900 dark:text-slate-100">{rec.employee?.name || 'Staff Member'}</p>
                        <p className="text-[10px] text-slate-400">{rec.employee?.email}</p>
                      </td>
                      <td className="py-3 px-4 font-mono font-semibold text-slate-800 dark:text-slate-200">
                        ${rec.basicSalary?.toLocaleString()}
                      </td>
                      <td className="py-3 px-4 font-mono text-slate-600 dark:text-slate-300">
                        ${((rec.hra || 0) + (rec.allowances || 0) || Math.round(rec.basicSalary * 0.4)).toLocaleString()}
                      </td>
                      <td className="py-3 px-4 font-mono text-rose-500">
                        -${rec.deductions?.toLocaleString()}
                      </td>
                      <td className="py-3 px-4 font-mono font-bold text-emerald-600 dark:text-emerald-400 text-sm">
                        ${rec.netSalary?.toLocaleString()}
                      </td>
                      <td className="py-3 px-4">
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400">
                          {rec.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => setSelectedPayslip(rec)}
                          className="px-3 py-1.5 rounded-xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 font-bold text-xs flex items-center gap-1.5 ml-auto cursor-pointer"
                        >
                          <FileText className="w-3.5 h-3.5" /> View Slip
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: SALARY STRUCTURE BREAKDOWN */}
      {activeTab === 'structure' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-slide-up">
          {/* Earnings Breakdown */}
          <div className="glass-card p-6 rounded-3xl lg:col-span-2">
            <h3 className="font-heading font-bold text-lg text-slate-900 dark:text-white mb-2">
              Standard Compensation Composition Matrix
            </h3>
            <p className="text-xs text-slate-400 mb-6">
              Benchmark breakdown applied to full-time engineering and operations roles.
            </p>

            <div className="space-y-4 mb-6">
              {[
                { label: 'Basic Salary', percentage: 50, amount: '$70,000 / yr', color: 'bg-indigo-600' },
                { label: 'House Rent Allowance (HRA)', percentage: 25, amount: '$35,000 / yr', color: 'bg-purple-600' },
                { label: 'Special & Tech Allowance', percentage: 15, amount: '$21,000 / yr', color: 'bg-pink-500' },
                { label: 'Performance Bonus (Variable)', percentage: 10, amount: '$14,000 / yr', color: 'bg-amber-500' },
              ].map((item) => (
                <div key={item.label}>
                  <div className="flex items-center justify-between text-xs font-semibold mb-1">
                    <span className="text-slate-800 dark:text-slate-200">{item.label}</span>
                    <span className="font-mono text-slate-600 dark:text-slate-300">
                      {item.amount} ({item.percentage}%)
                    </span>
                  </div>
                  <div className="w-full h-2.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                    <div className={`h-full rounded-full ${item.color}`} style={{ width: `${item.percentage}%` }} />
                  </div>
                </div>
              ))}
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs font-bold">
              <span className="text-slate-600 dark:text-slate-300">Total Fixed CTC</span>
              <span className="font-mono text-base text-slate-900 dark:text-white">$140,000.00 / yr</span>
            </div>
          </div>

          {/* Deductions & Benefits */}
          <div className="glass-card p-6 rounded-3xl flex flex-col justify-between">
            <div>
              <h3 className="font-heading font-bold text-base text-slate-900 dark:text-white mb-4">
                Statutory Deductions & Perks
              </h3>
              <div className="space-y-3">
                <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-700 dark:text-slate-300">401(k) / PF Employer Match</span>
                  <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">5.0% Match</span>
                </div>
                <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-700 dark:text-slate-300">Comprehensive Health PPO</span>
                  <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400">100% Covered</span>
                </div>
                <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-700 dark:text-slate-300">Annual Learning Stipend</span>
                  <span className="font-mono font-bold text-purple-600 dark:text-purple-400">$1,500 / yr</span>
                </div>
                <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-700 dark:text-slate-300">Home Office Ergonomics</span>
                  <span className="font-mono font-bold text-pink-600 dark:text-pink-400">$1,000 One-time</span>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 text-center">
              <span className="text-[11px] text-slate-400">Compliant with IRS & Department of Labor policies</span>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: TAX REGIME ESTIMATOR & SIMULATOR */}
      {activeTab === 'tax' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-slide-up">
          {/* Inputs Section */}
          <div className="glass-card p-6 rounded-3xl">
            <div className="flex items-center gap-2 mb-4">
              <Calculator className="w-5 h-5 text-indigo-500" />
              <h3 className="font-heading font-bold text-base text-slate-900 dark:text-white">
                Tax Regime Simulator
              </h3>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Annual Gross CTC ($)
                </label>
                <input
                  type="number"
                  value={annualGross}
                  onChange={(e) => setAnnualGross(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-mono font-bold outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Section 80C / 401(k) (Max $150k)
                </label>
                <input
                  type="number"
                  value={section80C}
                  onChange={(e) => setSection80C(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-mono outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Section 80D / Health Insurance ($)
                </label>
                <input
                  type="number"
                  value={section80D}
                  onChange={(e) => setSection80D(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-mono outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  HRA Exemption Amount ($)
                </label>
                <input
                  type="number"
                  value={hraExempt}
                  onChange={(e) => setHraExempt(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-mono outline-none focus:border-indigo-500"
                />
              </div>
            </div>
          </div>

          {/* Results Side-by-Side Comparison */}
          <div className="lg:col-span-2 space-y-6">
            <div className="p-4 rounded-3xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white flex items-center justify-between shadow-lg">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-white/20">
                  <Sparkles className="w-5 h-5 text-amber-300" />
                </div>
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-indigo-100">Smart Recommendation</p>
                  <h4 className="font-heading font-black text-lg">
                    {taxResult.recommended} Saves You ${taxResult.savings.toLocaleString()} / Year!
                  </h4>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {/* Old Tax Regime Card */}
              <div
                className={`glass-card p-6 rounded-3xl border-2 transition-all ${
                  taxResult.recommended === 'Old Regime' ? 'border-indigo-500 shadow-xl' : 'border-transparent'
                }`}
              >
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-heading font-bold text-base text-slate-900 dark:text-white">Old Tax Regime</h4>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500">
                    With Deductions
                  </span>
                </div>

                <div className="space-y-3 mb-6 text-xs">
                  <div className="flex justify-between text-slate-500">
                    <span>Taxable Income:</span>
                    <span className="font-mono font-semibold text-slate-900 dark:text-white">
                      ${taxResult.oldTaxable.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between text-slate-500">
                    <span>Total Tax Liability:</span>
                    <span className="font-mono font-bold text-rose-500">
                      ${taxResult.oldTaxFinal.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between text-slate-500 pt-2 border-t border-slate-100 dark:border-slate-800">
                    <span>Monthly Take-Home:</span>
                    <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400 text-sm">
                      ${Math.round((annualGross - taxResult.oldTaxFinal) / 12).toLocaleString()} / mo
                    </span>
                  </div>
                </div>
              </div>

              {/* New Tax Regime Card */}
              <div
                className={`glass-card p-6 rounded-3xl border-2 transition-all ${
                  taxResult.recommended === 'New Regime' ? 'border-indigo-500 shadow-xl' : 'border-transparent'
                }`}
              >
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-heading font-bold text-base text-slate-900 dark:text-white">New Tax Regime</h4>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400">
                    Standard Slabs
                  </span>
                </div>

                <div className="space-y-3 mb-6 text-xs">
                  <div className="flex justify-between text-slate-500">
                    <span>Taxable Income:</span>
                    <span className="font-mono font-semibold text-slate-900 dark:text-white">
                      ${taxResult.newTaxable.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between text-slate-500">
                    <span>Total Tax Liability:</span>
                    <span className="font-mono font-bold text-rose-500">
                      ${taxResult.newTaxFinal.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between text-slate-500 pt-2 border-t border-slate-100 dark:border-slate-800">
                    <span>Monthly Take-Home:</span>
                    <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400 text-sm">
                      ${Math.round((annualGross - taxResult.newTaxFinal) / 12).toLocaleString()} / mo
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Payslip Modal View */}
      {selectedPayslip && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-slide-up">
          <div className="w-full max-w-2xl rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-2xl overflow-y-auto max-h-[90vh]">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white font-bold flex items-center justify-center text-xs">
                  H
                </div>
                <div>
                  <h3 className="font-heading font-bold text-base text-slate-900 dark:text-white">
                    HRMS CORE Enterprise Payslip
                  </h3>
                  <p className="text-[11px] text-slate-400">Pay Period: July 2026 • Status: Disbursed</p>
                </div>
              </div>
              <button onClick={() => setSelectedPayslip(null)} className="p-1 text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="my-6 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div>
                <p className="text-slate-400">Employee Name</p>
                <p className="font-bold text-slate-900 dark:text-white mt-0.5">{selectedPayslip.employee?.name || 'Sarah Jenkins'}</p>
              </div>
              <div>
                <p className="text-slate-400">Department</p>
                <p className="font-bold text-slate-900 dark:text-white mt-0.5">Engineering</p>
              </div>
              <div>
                <p className="text-slate-400">Payment Date</p>
                <p className="font-bold text-slate-900 dark:text-white mt-0.5">July 31, 2026</p>
              </div>
              <div>
                <p className="text-slate-400">Bank Ref</p>
                <p className="font-bold font-mono text-slate-900 dark:text-white mt-0.5">ACH-99482109</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 my-6 text-xs">
              <div className="space-y-2">
                <h4 className="font-bold uppercase tracking-wider text-slate-400 pb-1 border-b border-slate-100 dark:border-slate-800">
                  Earnings Breakdown
                </h4>
                <div className="flex justify-between">
                  <span className="text-slate-600 dark:text-slate-400">Basic Salary</span>
                  <span className="font-mono font-semibold text-slate-900 dark:text-white">
                    ${selectedPayslip.basicSalary?.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600 dark:text-slate-400">House Rent Allowance (HRA)</span>
                  <span className="font-mono font-semibold text-slate-900 dark:text-white">
                    ${(selectedPayslip.hra || Math.round(selectedPayslip.basicSalary * 0.3))?.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600 dark:text-slate-400">Special Allowance</span>
                  <span className="font-mono font-semibold text-slate-900 dark:text-white">
                    ${(selectedPayslip.allowances || Math.round(selectedPayslip.basicSalary * 0.15))?.toLocaleString()}
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="font-bold uppercase tracking-wider text-slate-400 pb-1 border-b border-slate-100 dark:border-slate-800">
                  Deductions & Withholdings
                </h4>
                <div className="flex justify-between">
                  <span className="text-slate-600 dark:text-slate-400">Federal & State Tax</span>
                  <span className="font-mono font-semibold text-rose-500">
                    -${(selectedPayslip.tax || Math.round(selectedPayslip.deductions * 0.6))?.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600 dark:text-slate-400">401(k) / Pension Contribution</span>
                  <span className="font-mono font-semibold text-rose-500">
                    -${Math.round(selectedPayslip.deductions * 0.3)?.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600 dark:text-slate-400">Health Insurance Premium</span>
                  <span className="font-mono font-semibold text-rose-500">
                    -${Math.round(selectedPayslip.deductions * 0.1)?.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200/60 dark:border-emerald-800/60 flex items-center justify-between">
              <div>
                <p className="text-xs font-bold uppercase text-emerald-800 dark:text-emerald-300">Net Take-Home Pay</p>
                <p className="text-[11px] text-emerald-600 dark:text-emerald-400">Directly transferred to checking account</p>
              </div>
              <span className="font-heading text-2xl font-black font-mono text-emerald-700 dark:text-emerald-300">
                ${selectedPayslip.netSalary?.toLocaleString()}
              </span>
            </div>

            <div className="flex items-center justify-end gap-3 pt-6 mt-6 border-t border-slate-100 dark:border-slate-800">
              <button
                onClick={() => {
                  window.print();
                }}
                className="px-4 py-2.5 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 text-xs font-bold flex items-center gap-2 cursor-pointer"
              >
                <Printer className="w-4 h-4" /> Print
              </button>
              <button
                onClick={() => {
                  try {
                    downloadPayslipPDF({
                      employeeName: 'Sarah Jenkins',
                      employeeEmail: 'sarah.j@company.com',
                      employeeId: 'EMP-2026-084',
                      department: 'Engineering',
                      designation: 'Senior Full Stack Engineer',
                      month: selectedPayslip.month || 7,
                      year: selectedPayslip.year || 2026,
                      basicSalary: selectedPayslip.basicSalary || 110000,
                      hra: selectedPayslip.hra || Math.round((selectedPayslip.basicSalary || 110000) * 0.3),
                      allowances: selectedPayslip.allowances || Math.round((selectedPayslip.basicSalary || 110000) * 0.15),
                      deductions: selectedPayslip.deductions || 18500,
                      tax: selectedPayslip.tax || 12000,
                      netSalary: selectedPayslip.netSalary || 127500,
                      paymentDate: '2026-07-31',
                      bankRef: 'ACH-99482109',
                    });
                    addToast({ title: 'PDF Payslip Downloaded', message: 'Generated official encrypted payroll statement.', type: 'success' });
                  } catch (err) {
                    console.error('PDF error:', err);
                    addToast({ title: 'Download Error', message: 'Could not generate PDF.', type: 'error' });
                  }
                }}
                className="px-5 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold flex items-center gap-2 shadow-lg shadow-indigo-500/25 cursor-pointer"
              >
                <Download className="w-4 h-4" /> Download PDF
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}
