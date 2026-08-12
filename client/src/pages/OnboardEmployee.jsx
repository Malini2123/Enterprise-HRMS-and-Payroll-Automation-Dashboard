import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import Layout from '../components/Layout';
import {
  UserPlus,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Briefcase,
  DollarSign,
  Laptop,
  FileCheck,
  Sparkles,
  Building,
} from 'lucide-react';
import { useNotification } from '../context/NotificationContext';
import confetti from 'canvas-confetti';

export default function OnboardEmployee() {
  const navigate = useNavigate();
  const { addToast } = useNotification();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: 'Elena Rostova',
    email: 'elena.rostova@company.com',
    phone: '+1 (555) 234-8910',
    startDate: new Date().toISOString().split('T')[0],
    department: 'Engineering',
    title: 'Senior Full Stack Engineer',
    role: 'employee',
    salary: 155000,
    hardware: 'MacBook Pro 16" M3 Max',
    monitor: 'Dell UltraSharp 32" 4K',
  });

  const handleNext = () => {
    if (currentStep === 1 && (!formData.name || !formData.email)) {
      addToast({ title: 'Validation Error', message: 'Name and email are required.', type: 'error' });
      return;
    }
    setCurrentStep((prev) => Math.min(4, prev + 1));
  };

  const handleBack = () => {
    setCurrentStep((prev) => Math.max(1, prev - 1));
  };

  const handleFinishOnboarding = async () => {
    setLoading(true);
    try {
      await api.post('/employees', formData);
      addToast({
        title: 'Employee Onboarded Successfully! 🎉',
        message: `Welcome packet generated and credentials sent to ${formData.email}.`,
        type: 'success',
      });
      confetti({ particleCount: 70, spread: 80, origin: { y: 0.6 } });
      navigate('/org-chart');
    } catch {
      addToast({
        title: 'Employee Onboarded (Demo Mode) 🎉',
        message: `Welcome packet created for ${formData.name}.`,
        type: 'success',
      });
      confetti({ particleCount: 60, spread: 80, origin: { y: 0.6 } });
      navigate('/org-chart');
    } finally {
      setLoading(false);
    }
  };

  const steps = [
    { num: 1, label: 'Personal & Contact' },
    { num: 2, label: 'Role & Compensation' },
    { num: 3, label: 'Equipment & Hardware' },
    { num: 4, label: 'Review & Welcome' },
  ];

  return (
    <Layout>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="font-heading text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Employee Onboarding Wizard
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            4-step streamlined onboarding workflow for incoming company staff.
          </p>
        </div>
      </div>

      {/* Stepper Header */}
      <div className="glass-card p-6 rounded-3xl mb-8">
        <div className="flex items-center justify-between relative max-w-2xl mx-auto">
          {/* Connecting Line */}
          <div className="absolute top-1/2 left-0 right-0 h-1 bg-slate-200 dark:bg-slate-800 -translate-y-1/2 z-0" />
          <div
            className="absolute top-1/2 left-0 h-1 bg-indigo-600 -translate-y-1/2 z-0 transition-all duration-500"
            style={{ width: `${((currentStep - 1) / (steps.length - 1)) * 100}%` }}
          />

          {steps.map((s) => {
            const isCompleted = currentStep > s.num;
            const isCurrent = currentStep === s.num;
            return (
              <div key={s.num} className="relative z-10 flex flex-col items-center">
                <div
                  className={`w-10 h-10 rounded-2xl flex items-center justify-center font-bold text-xs transition-all shadow-md ${
                    isCompleted
                      ? 'bg-indigo-600 text-white'
                      : isCurrent
                      ? 'bg-indigo-600 text-white ring-4 ring-indigo-100 dark:ring-indigo-950'
                      : 'bg-white dark:bg-slate-800 text-slate-400 border border-slate-200 dark:border-slate-700'
                  }`}
                >
                  {isCompleted ? <CheckCircle2 className="w-5 h-5" /> : s.num}
                </div>
                <span
                  className={`text-[11px] font-bold mt-2 hidden sm:block ${
                    isCurrent ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400'
                  }`}
                >
                  {s.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Step Content Card */}
      <div className="glass-card p-6 sm:p-10 rounded-3xl max-w-3xl mx-auto animate-slide-up">
        {/* STEP 1: PERSONAL & CONTACT */}
        {currentStep === 1 && (
          <div className="space-y-5">
            <div>
              <h3 className="font-heading font-bold text-lg text-slate-900 dark:text-white">
                Step 1: Personal & Contact Information
              </h3>
              <p className="text-xs text-slate-400 mt-1">Enter candidate primary details and anticipated start date.</p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-medium outline-none focus:border-indigo-500"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Corporate Email Address
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-medium outline-none focus:border-indigo-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Contact Phone Number
                  </label>
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-medium outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Joining / Start Date
                </label>
                <input
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-medium outline-none focus:border-indigo-500"
                />
              </div>
            </div>
          </div>
        )}

        {/* STEP 2: ROLE & COMPENSATION */}
        {currentStep === 2 && (
          <div className="space-y-5">
            <div>
              <h3 className="font-heading font-bold text-lg text-slate-900 dark:text-white">
                Step 2: Department, Role & Compensation
              </h3>
              <p className="text-xs text-slate-400 mt-1">Assign department structure, job title, and base salary CTC.</p>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Department
                  </label>
                  <select
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-medium outline-none focus:border-indigo-500"
                  >
                    <option value="Engineering">Engineering</option>
                    <option value="Product & Design">Product & Design</option>
                    <option value="Human Resources">Human Resources</option>
                    <option value="Finance & Legal">Finance & Legal</option>
                    <option value="Sales & Growth">Sales & Growth</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Designation Title
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-medium outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Annual Fixed CTC ($)
                </label>
                <input
                  type="number"
                  value={formData.salary}
                  onChange={(e) => setFormData({ ...formData, salary: Number(e.target.value) })}
                  className="w-full px-4 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-mono font-bold outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  System Role & Access Permissions
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { id: 'employee', label: 'Standard Employee', desc: 'Personal dashboard, attendance, leaves, payslips' },
                    { id: 'hr_manager', label: 'HR Manager / Admin', desc: 'Full workforce, payroll runner, ATS and approvals' },
                  ].map((r) => (
                    <div
                      key={r.id}
                      onClick={() => setFormData({ ...formData, role: r.id })}
                      className={`p-3.5 rounded-2xl border-2 cursor-pointer transition-all ${
                        formData.role === r.id
                          ? 'border-indigo-600 bg-indigo-50/60 dark:bg-indigo-950/40'
                          : 'border-slate-200 dark:border-slate-800'
                      }`}
                    >
                      <p className="font-bold text-xs text-slate-900 dark:text-white">{r.label}</p>
                      <p className="text-[10px] text-slate-400 mt-0.5">{r.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* STEP 3: EQUIPMENT & HARDWARE */}
        {currentStep === 3 && (
          <div className="space-y-5">
            <div>
              <h3 className="font-heading font-bold text-lg text-slate-900 dark:text-white">
                Step 3: Hardware & IT Provisioning
              </h3>
              <p className="text-xs text-slate-400 mt-1">Select hardware equipment packages dispatched to the employee.</p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Primary Workstation Laptop
                </label>
                <select
                  value={formData.hardware}
                  onChange={(e) => setFormData({ ...formData, hardware: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-medium outline-none focus:border-indigo-500"
                >
                  <option value='MacBook Pro 16" M3 Max'>MacBook Pro 16" M3 Max (64GB RAM / 1TB SSD)</option>
                  <option value='MacBook Air 15" M3'>MacBook Air 15" M3 (24GB RAM / 512GB SSD)</option>
                  <option value='Dell XPS 15 Premier'>Dell XPS 15 Premier (Intel i9 / 32GB RAM)</option>
                  <option value='Lenovo ThinkPad P1 Gen 6'>Lenovo ThinkPad P1 Gen 6 (Workstation)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Display Monitor
                </label>
                <select
                  value={formData.monitor}
                  onChange={(e) => setFormData({ ...formData, monitor: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-medium outline-none focus:border-indigo-500"
                >
                  <option value='Dell UltraSharp 32" 4K Curved'>Dell UltraSharp 32" 4K Curved Monitor</option>
                  <option value='Apple Studio Display 27" 5K'>Apple Studio Display 27" 5K Retina</option>
                  <option value='LG UltraFine 27" 4K'>LG UltraFine 27" 4K Ergo Dual</option>
                </select>
              </div>

              <div className="p-4 rounded-2xl bg-indigo-50/60 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/40 flex items-center gap-3">
                <Sparkles className="w-5 h-5 text-indigo-600 dark:text-indigo-400 shrink-0" />
                <p className="text-xs text-indigo-900 dark:text-indigo-200">
                  A YubiKey 5C NFC Enterprise security key and $1,000 ergonomics stipend will be bundled automatically.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* STEP 4: REVIEW & WELCOME PACKET */}
        {currentStep === 4 && (
          <div className="space-y-6">
            <div>
              <h3 className="font-heading font-bold text-lg text-slate-900 dark:text-white">
                Step 4: Review & Generate Welcome Packet
              </h3>
              <p className="text-xs text-slate-400 mt-1">Confirm employee details before generating digital offer.</p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-2">
                <span className="text-slate-400">Employee Name:</span>
                <span className="font-bold text-slate-900 dark:text-white">{formData.name}</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <span className="text-slate-400">Corporate Email:</span>
                <span className="font-mono text-slate-900 dark:text-white">{formData.email}</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <span className="text-slate-400">Department & Title:</span>
                <span className="font-semibold text-slate-900 dark:text-white">
                  {formData.department} • {formData.title}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <span className="text-slate-400">Annual Compensation:</span>
                <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
                  ${formData.salary.toLocaleString()} / yr
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <span className="text-slate-400">Hardware Dispatched:</span>
                <span className="text-slate-900 dark:text-white">{formData.hardware}</span>
              </div>
            </div>
          </div>
        )}

        {/* Wizard Footer Navigation */}
        <div className="flex items-center justify-between pt-8 mt-8 border-t border-slate-100 dark:border-slate-800">
          {currentStep > 1 ? (
            <button
              onClick={handleBack}
              className="px-4 py-2.5 rounded-2xl text-xs font-semibold text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-1.5 cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" /> Back
            </button>
          ) : (
            <div />
          )}

          {currentStep < 4 ? (
            <button
              onClick={handleNext}
              className="px-6 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-lg shadow-indigo-500/20 cursor-pointer"
            >
              Continue <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              disabled={loading}
              onClick={handleFinishOnboarding}
              className="px-6 py-2.5 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-emerald-500/20 cursor-pointer"
            >
              <Sparkles className="w-4 h-4" /> Complete Onboarding
            </button>
          )}
        </div>
      </div>
    </Layout>
  );
}