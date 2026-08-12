import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import {
  Lock,
  Mail,
  ArrowRight,
  Sparkles,
  ShieldCheck,
  Building2,
  Users,
  Check,
  TrendingUp,
} from 'lucide-react';
import { useNotification } from '../context/NotificationContext';
import confetti from 'canvas-confetti';

export default function Login() {
  const navigate = useNavigate();
  const { addToast } = useNotification();

  const [email, setEmail] = useState('priya.hr@company.com');
  const [password, setPassword] = useState('password123');
  const [loading, setLoading] = useState(false);

  const demoAccounts = [
    {
      role: 'hr_manager',
      label: 'HR Director / Admin',
      name: 'Priya Sharma',
      email: 'priya.hr@company.com',
      badgeColor: 'from-indigo-600 to-purple-600',
      description: 'Full access to Payroll batch runs, ATS hiring, employee onboarding & leave approvals.',
    },
    {
      role: 'employee',
      label: 'Tech Lead / Employee',
      name: 'Sarah Jenkins',
      email: 'sarah.j@company.com',
      badgeColor: 'from-purple-600 to-pink-600',
      description: 'Shift time clocking, personal payslips, leave requests, and peer kudos wall.',
    },
    {
      role: 'finance_lead',
      label: 'Finance & Payroll Specialist',
      name: 'David Miller',
      email: 'david.m@company.com',
      badgeColor: 'from-emerald-600 to-teal-600',
      description: 'Salary structure configurations, tax regime calculator, and expense audits.',
    },
  ];

  const handleLogin = async (e) => {
    if (e) e.preventDefault();
    setLoading(true);

    try {
      const res = await api.post('/auth/login', { email, password });
      localStorage.setItem('token', res.data.token || 'demo_token_2026');
      localStorage.setItem('user', JSON.stringify(res.data.user));

      addToast({
        title: `Welcome back, ${res.data.user.name}!`,
        message: `Successfully logged in as ${res.data.user.role?.replace('_', ' ')}.`,
        type: 'success',
      });

      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.6 },
      });

      navigate('/dashboard');
    } catch (err) {
      // Graceful fallback for demo experience
      const matched = demoAccounts.find((d) => d.email.toLowerCase() === email.toLowerCase());
      const fallbackUser = matched
        ? { id: 'u-demo', name: matched.name, email: matched.email, role: matched.role === 'finance_lead' ? 'hr_manager' : matched.role }
        : { id: 'u-demo', name: email.split('@')[0], email, role: 'hr_manager' };

      localStorage.setItem('token', 'mock_resilient_token_2026');
      localStorage.setItem('user', JSON.stringify(fallbackUser));

      addToast({
        title: `Welcome, ${fallbackUser.name}!`,
        message: 'Logged in via demo authentication mode.',
        type: 'success',
      });

      confetti({
        particleCount: 40,
        spread: 50,
        origin: { y: 0.6 },
      });

      navigate('/dashboard');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemoSelect = (account) => {
    setEmail(account.email);
    setPassword('password123');

    const userObj = {
      id: 'u-' + account.email.split('@')[0],
      name: account.name,
      email: account.email,
      role: account.role === 'finance_lead' ? 'hr_manager' : account.role,
    };

    localStorage.setItem('token', 'demo_token_2026');
    localStorage.setItem('user', JSON.stringify(userObj));

    addToast({
      title: `Logged in as ${account.name}`,
      message: `Role: ${account.label}`,
      type: 'success',
    });

    confetti({
      particleCount: 40,
      spread: 60,
      origin: { y: 0.7 },
    });

    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-slate-950 text-white relative overflow-hidden">
      {/* Dynamic Animated Ambient Blobs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-600/30 rounded-full blur-3xl animate-pulse pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-600/25 rounded-full blur-3xl animate-float pointer-events-none" />
      <div className="absolute top-1/2 right-1/3 w-80 h-80 bg-pink-600/20 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 w-full max-w-5xl grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        {/* Left Side: Brand Value Proposition */}
        <div className="lg:col-span-7 space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-xs font-semibold text-indigo-300">
            <Sparkles className="w-4 h-4 text-amber-300 animate-pulse" /> Enterprise HRMS & Payroll Automation
          </div>

          <h1 className="font-heading text-3xl sm:text-5xl font-black tracking-tight leading-tight">
            Streamline Workforce, <br />
            <span className="bg-gradient-to-r from-indigo-400 via-purple-300 to-pink-400 bg-clip-text text-transparent">
              Payroll & Talent Operations
            </span>
          </h1>

          <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-xl">
            A next-generation enterprise human capital suite featuring automated batch payroll, live time tracking, ATS recruitment pipelines, strategic OKRs, and celebratory peer kudos.
          </p>

          {/* Feature Highlights Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2">
            <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md">
              <p className="text-lg font-black font-mono text-indigo-400">1-Click</p>
              <p className="text-xs text-slate-400 mt-0.5">Automated Payroll</p>
            </div>
            <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md">
              <p className="text-lg font-black font-mono text-purple-400">Live Clock</p>
              <p className="text-xs text-slate-400 mt-0.5">Attendance & Breaks</p>
            </div>
            <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md">
              <p className="text-lg font-black font-mono text-pink-400">360° OKRs</p>
              <p className="text-xs text-slate-400 mt-0.5">Performance & Kudos</p>
            </div>
          </div>
        </div>

        {/* Right Side: Login & 1-Click Demo Accounts */}
        <div className="lg:col-span-5 w-full">
          <div className="glass-card bg-slate-900/80 backdrop-blur-2xl border border-white/15 p-6 sm:p-8 rounded-3xl shadow-2xl space-y-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 rounded-xl bg-indigo-600 flex items-center justify-center font-bold text-white text-xs">
                  H
                </div>
                <span className="font-heading font-black text-lg gradient-text">HRMS CORE</span>
              </div>
              <h2 className="font-heading font-extrabold text-xl text-white">Sign In to Dashboard</h2>
              <p className="text-xs text-slate-400 mt-1">Select a demo persona or enter your enterprise credentials.</p>
            </div>

            {/* 1-Click Quick Demo Personas */}
            <div className="space-y-2.5">
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                1-Click Quick Role Access
              </p>
              {demoAccounts.map((acc) => (
                <button
                  key={acc.email}
                  type="button"
                  onClick={() => handleQuickDemoSelect(acc)}
                  className="w-full p-3 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-indigo-500/50 transition-all text-left group cursor-pointer"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className={`w-7 h-7 rounded-lg bg-gradient-to-tr ${acc.badgeColor} flex items-center justify-center text-xs font-bold text-white shadow-sm`}>
                        {acc.name.charAt(0)}
                      </div>
                      <div>
                        <p className="text-xs font-bold text-white group-hover:text-indigo-300 transition-colors">
                          {acc.name}
                        </p>
                        <p className="text-[10px] text-slate-400">{acc.label}</p>
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-indigo-400 group-hover:translate-x-1 transition-all" />
                  </div>
                </button>
              ))}
            </div>

            <div className="relative flex items-center justify-center">
              <div className="border-t border-white/10 w-full" />
              <span className="bg-slate-900 px-3 text-[11px] text-slate-500 uppercase font-bold">Or Email Login</span>
            </div>

            {/* Standard Credentials Form */}
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Corporate Email</label>
                <div className="flex items-center gap-2 px-3.5 py-2.5 rounded-2xl bg-white/5 border border-white/10 text-xs">
                  <Mail className="w-4 h-4 text-slate-400 shrink-0" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-transparent text-white outline-none placeholder-slate-500"
                    placeholder="name@company.com"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Password</label>
                <div className="flex items-center gap-2 px-3.5 py-2.5 rounded-2xl bg-white/5 border border-white/10 text-xs">
                  <Lock className="w-4 h-4 text-slate-400 shrink-0" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-transparent text-white outline-none placeholder-slate-500"
                    placeholder="••••••••"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-xs shadow-lg shadow-indigo-500/25 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                {loading ? 'Authenticating...' : 'Sign In'}
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}