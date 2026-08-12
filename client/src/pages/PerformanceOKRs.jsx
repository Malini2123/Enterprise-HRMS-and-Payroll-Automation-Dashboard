import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../api/axios';
import Layout from '../components/Layout';
import {
  Award,
  Heart,
  Sparkles,
  TrendingUp,
  PlusCircle,
  CheckCircle2,
  AlertCircle,
  Clock,
  ThumbsUp,
  Star,
  Users,
  X,
  Send,
  Zap,
} from 'lucide-react';
import { useNotification } from '../context/NotificationContext';
import confetti from 'canvas-confetti';

export default function PerformanceOKRs() {
  const queryClient = useQueryClient();
  const { addToast } = useNotification();
  const [activeTab, setActiveTab] = useState('okrs'); // 'okrs', 'kudos', 'reviews'

  // Kudos Form Modal
  const [isKudosModalOpen, setIsKudosModalOpen] = useState(false);
  const [kudosForm, setKudosForm] = useState({
    toUser: 'Sarah Jenkins',
    badge: 'Problem Solver',
    message: '',
  });

  // New OKR Modal
  const [isOkrModalOpen, setIsOkrModalOpen] = useState(false);
  const [okrForm, setOkrForm] = useState({
    objective: '',
    category: 'Engineering',
    quarter: 'Q3 2026',
    keyResultTitle: '',
    targetValue: 100,
  });

  // Fetch OKRs
  const { data: okrs = [] } = useQuery({
    queryKey: ['okrsList'],
    queryFn: async () => {
      try {
        const res = await api.get('/performance/okrs');
        return res.data;
      } catch {
        return [];
      }
    },
  });

  // Fetch Kudos
  const { data: kudos = [] } = useQuery({
    queryKey: ['kudosList'],
    queryFn: async () => {
      try {
        const res = await api.get('/performance/kudos');
        return res.data;
      } catch {
        return [];
      }
    },
  });

  // Clap trigger with confetti
  const handleClap = async (kudosId) => {
    try {
      await api.post(`/performance/kudos/${kudosId}/clap`);
      queryClient.invalidateQueries({ queryKey: ['kudosList'] });
    } catch {
      // Mock clap update
    }
    confetti({
      particleCount: 25,
      spread: 50,
      origin: { y: 0.75 },
    });
    addToast({ title: 'Celebrated!', message: 'Sent cheer & claps for this awesome achievement.', type: 'success' });
  };

  const handleSendKudos = (e) => {
    e.preventDefault();
    if (!kudosForm.message) {
      addToast({ title: 'Validation Error', message: 'Please include a personalized recognition message.', type: 'error' });
      return;
    }

    addToast({
      title: 'Peer Kudos Posted!',
      message: `Recognized ${kudosForm.toUser} with the "${kudosForm.badge}" badge.`,
      type: 'success',
    });

    confetti({
      particleCount: 80,
      spread: 90,
      origin: { y: 0.5 },
    });

    setIsKudosModalOpen(false);
    setKudosForm({ toUser: 'Sarah Jenkins', badge: 'Problem Solver', message: '' });
  };

  const handleAddOkr = (e) => {
    e.preventDefault();
    if (!okrForm.objective) {
      addToast({ title: 'Validation Error', message: 'Objective title is required.', type: 'error' });
      return;
    }

    addToast({
      title: 'OKR Created',
      message: `Goal added for ${okrForm.quarter} under ${okrForm.category}.`,
      type: 'success',
    });

    setIsOkrModalOpen(false);
    setOkrForm({ objective: '', category: 'Engineering', quarter: 'Q3 2026', keyResultTitle: '', targetValue: 100 });
  };

  return (
    <Layout>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="font-heading text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Performance, OKRs & Kudos Wall
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Track company-wide strategic objectives, key results, 360 reviews, and peer recognition.
          </p>
        </div>

        {/* Action Buttons & Tabs */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-slate-200/80 dark:bg-slate-800/80 border border-slate-300/60 dark:border-slate-700/60">
            {[
              { id: 'okrs', label: 'Strategic OKRs' },
              { id: 'kudos', label: 'Peer Kudos Wall' },
              { id: 'reviews', label: '360° Review Matrix' },
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

          {activeTab === 'kudos' ? (
            <button
              onClick={() => setIsKudosModalOpen(true)}
              className="px-4 py-2 rounded-2xl bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-700 hover:to-rose-700 text-white font-bold text-xs shadow-md shadow-pink-500/20 flex items-center gap-2 cursor-pointer"
            >
              <Sparkles className="w-4 h-4" /> Send Kudos
            </button>
          ) : (
            <button
              onClick={() => setIsOkrModalOpen(true)}
              className="px-4 py-2 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-500/20 flex items-center gap-2 cursor-pointer"
            >
              <PlusCircle className="w-4 h-4" /> Add Objective
            </button>
          )}
        </div>
      </div>

      {/* TAB 1: STRATEGIC OKRs */}
      {activeTab === 'okrs' && (
        <div className="space-y-6 animate-slide-up">
          {/* Header Summary KPI */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            <div className="glass-card p-5 rounded-3xl flex items-center gap-4">
              <div className="p-3.5 rounded-2xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400">
                <Award className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-400">Average OKR Progress</p>
                <h3 className="font-heading text-2xl font-black text-slate-900 dark:text-white mt-0.5">76%</h3>
                <p className="text-[10px] text-emerald-500 font-bold mt-0.5">+14% vs Q2 2026</p>
              </div>
            </div>

            <div className="glass-card p-5 rounded-3xl flex items-center gap-4">
              <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-400">On-Track Objectives</p>
                <h3 className="font-heading text-2xl font-black text-slate-900 dark:text-white mt-0.5">8 / 10</h3>
                <p className="text-[10px] text-slate-400 mt-0.5">80% Health Score</p>
              </div>
            </div>

            <div className="glass-card p-5 rounded-3xl flex items-center gap-4">
              <div className="p-3.5 rounded-2xl bg-purple-50 dark:bg-purple-950 text-purple-600 dark:text-purple-400">
                <Clock className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-400">Days Remaining in Q3</p>
                <h3 className="font-heading text-2xl font-black text-slate-900 dark:text-white mt-0.5">48 Days</h3>
                <p className="text-[10px] text-slate-400 mt-0.5">Review Date: Sept 30</p>
              </div>
            </div>
          </div>

          {/* OKR Cards List */}
          <div className="space-y-4">
            {okrs.map((okr) => (
              <div key={okr.id} className="glass-card p-6 rounded-3xl space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400">
                        {okr.category}
                      </span>
                      <span className="text-xs text-slate-400 font-semibold">{okr.quarter}</span>
                      <span className="text-xs text-slate-500">• {okr.employeeName}</span>
                    </div>
                    <h3 className="font-heading font-bold text-base sm:text-lg text-slate-900 dark:text-white">
                      {okr.objective}
                    </h3>
                  </div>

                  <div className="flex items-center gap-3">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${
                        okr.status === 'on_track'
                          ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400'
                          : okr.status === 'behind'
                          ? 'bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400'
                          : 'bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400'
                      }`}
                    >
                      {okr.status.replace('_', ' ')}
                    </span>
                    <span className="font-mono font-black text-lg text-indigo-600 dark:text-indigo-400">
                      {okr.progress}%
                    </span>
                  </div>
                </div>

                {/* Main Progress Bar */}
                <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 transition-all duration-500"
                    style={{ width: `${okr.progress}%` }}
                  />
                </div>

                {/* Nested Key Results */}
                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-2.5">
                  <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Key Results Metrics</h4>
                  {okr.keyResults?.map((kr, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-2xl bg-slate-50/80 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs"
                    >
                      <span className="font-medium text-slate-800 dark:text-slate-200">{kr.title}</span>
                      <div className="flex items-center gap-3 shrink-0 font-mono">
                        <span className="text-slate-500">
                          Current: <strong className="text-indigo-600 dark:text-indigo-400">{kr.currentValue}</strong> / {kr.targetValue} {kr.unit}
                        </span>
                        <div className="w-24 h-2 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                          <div
                            className="h-full rounded-full bg-indigo-600"
                            style={{ width: `${Math.min(100, (kr.currentValue / kr.targetValue) * 100)}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 2: PEER KUDOS WALL */}
      {activeTab === 'kudos' && (
        <div className="space-y-6 animate-slide-up">
          <div className="p-6 rounded-3xl bg-gradient-to-r from-pink-600 via-rose-600 to-purple-600 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xl">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Sparkles className="w-5 h-5 text-amber-300 animate-pulse" />
                <h3 className="font-heading font-extrabold text-xl">Company Recognition & Kudos Wall</h3>
              </div>
              <p className="text-xs sm:text-sm text-pink-100 max-w-xl">
                Celebrate your peers, give shoutouts for remarkable contributions, and foster a thriving culture!
              </p>
            </div>
            <button
              onClick={() => setIsKudosModalOpen(true)}
              className="px-5 py-2.5 rounded-2xl bg-white text-pink-900 font-bold text-xs hover:bg-pink-50 shadow-lg transition-all flex items-center gap-2 cursor-pointer shrink-0"
            >
              <Heart className="w-4 h-4 text-rose-500 fill-rose-500" /> Send Kudos Now
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {kudos.map((item) => (
              <div key={item.id} className="glass-card p-6 rounded-3xl flex flex-col justify-between group">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-pink-50 dark:bg-pink-950/60 text-pink-600 dark:text-pink-400 border border-pink-100 dark:border-pink-900/40">
                      🏆 {item.badge}
                    </span>
                    <span className="text-[10px] text-slate-400">{new Date(item.createdAt).toLocaleDateString()}</span>
                  </div>

                  <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 italic mb-4 leading-relaxed">
                    "{item.message}"
                  </p>
                </div>

                <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <div className="truncate">
                    <p className="text-xs font-bold text-slate-900 dark:text-white truncate">To: {item.toUser}</p>
                    <p className="text-[10px] text-slate-400 truncate">From: {item.fromUser}</p>
                  </div>

                  <button
                    onClick={() => handleClap(item.id)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-pink-50 dark:bg-pink-950/60 text-pink-600 dark:text-pink-400 hover:bg-pink-100 font-bold text-xs transition-all cursor-pointer group-hover:scale-105"
                  >
                    <ThumbsUp className="w-3.5 h-3.5" />
                    <span>{item.claps || 1}</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: 360° REVIEW MATRIX */}
      {activeTab === 'reviews' && (
        <div className="glass-card p-6 sm:p-8 rounded-3xl animate-slide-up space-y-6">
          <div>
            <h3 className="font-heading font-bold text-lg text-slate-900 dark:text-white">
              Quarterly 360° Competency Evaluation Matrix
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Evaluated across 5 core enterprise dimensions for Sarah Jenkins (Q2 2026 Evaluation).
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {[
              { title: 'Technical Problem Solving & Architecture', score: 4.9, desc: 'Consistently delivers scalable, zero-downtime architecture solutions.' },
              { title: 'Collaboration & Team Mentorship', score: 4.8, desc: 'Proactive in pair programming and onboarding junior engineers.' },
              { title: 'Execution Velocity & Delivery', score: 4.7, desc: 'Achieved 95% on-time sprint completions for core features.' },
              { title: 'Strategic Product Alignment', score: 4.6, desc: 'Actively participates in UX and requirement grooming sessions.' },
            ].map((comp, idx) => (
              <div key={idx} className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-heading font-bold text-sm text-slate-900 dark:text-white">{comp.title}</h4>
                  <div className="flex items-center gap-1 text-amber-500 font-bold text-sm">
                    <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                    <span>{comp.score} / 5.0</span>
                  </div>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400">{comp.desc}</p>
                <div className="w-full h-2 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden mt-3">
                  <div className="h-full rounded-full bg-amber-500" style={{ width: `${(comp.score / 5) * 100}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Send Kudos Modal */}
      {isKudosModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-slide-up">
          <div className="w-full max-w-lg rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-pink-500" />
                <h3 className="font-heading font-bold text-lg text-slate-900 dark:text-white">Send Peer Kudos</h3>
              </div>
              <button onClick={() => setIsKudosModalOpen(false)} className="p-1 text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSendKudos} className="mt-5 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Recognize Colleague
                </label>
                <select
                  value={kudosForm.toUser}
                  onChange={(e) => setKudosForm({ ...kudosForm, toUser: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-medium outline-none focus:border-indigo-500"
                >
                  <option value="Sarah Jenkins">Sarah Jenkins (Engineering)</option>
                  <option value="Marcus Vance">Marcus Vance (Engineering Lead)</option>
                  <option value="Aisha Patel">Aisha Patel (Product Design)</option>
                  <option value="David Miller">David Miller (Finance)</option>
                  <option value="Priya Sharma">Priya Sharma (HR Director)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Recognition Badge
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {['Problem Solver', 'Innovator', 'Rockstar', 'Team Player', 'Customer Champion', 'Leadership'].map(
                    (b) => (
                      <button
                        type="button"
                        key={b}
                        onClick={() => setKudosForm({ ...kudosForm, badge: b })}
                        className={`px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                          kudosForm.badge === b
                            ? 'bg-pink-600 text-white shadow-md shadow-pink-500/25'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                        }`}
                      >
                        🏆 {b}
                      </button>
                    )
                  )}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Appreciation Message
                </label>
                <textarea
                  rows={3}
                  value={kudosForm.message}
                  onChange={(e) => setKudosForm({ ...kudosForm, message: e.target.value })}
                  placeholder="Share how they made an impact or helped unblock a critical task..."
                  className="w-full px-4 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-medium outline-none focus:border-pink-500 resize-none"
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsKudosModalOpen(false)}
                  className="px-4 py-2 rounded-2xl text-xs font-semibold text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-2xl bg-pink-600 hover:bg-pink-700 text-white text-xs font-bold shadow-lg shadow-pink-500/25 flex items-center gap-1.5"
                >
                  <Send className="w-4 h-4" /> Post Kudos
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add OKR Modal */}
      {isOkrModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-slide-up">
          <div className="w-full max-w-lg rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
              <h3 className="font-heading font-bold text-lg text-slate-900 dark:text-white">Add Strategic OKR</h3>
              <button onClick={() => setIsOkrModalOpen(false)} className="p-1 text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddOkr} className="mt-5 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Objective Title
                </label>
                <input
                  type="text"
                  value={okrForm.objective}
                  onChange={(e) => setOkrForm({ ...okrForm, objective: e.target.value })}
                  placeholder="e.g. Elevate Core Cloud Reliability to 99.99%"
                  className="w-full px-4 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-medium outline-none focus:border-indigo-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Category
                  </label>
                  <select
                    value={okrForm.category}
                    onChange={(e) => setOkrForm({ ...okrForm, category: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-medium outline-none focus:border-indigo-500"
                  >
                    <option value="Engineering">Engineering</option>
                    <option value="Product">Product</option>
                    <option value="Culture">Culture</option>
                    <option value="Leadership">Leadership</option>
                    <option value="Sales">Sales</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Target Quarter
                  </label>
                  <input
                    type="text"
                    value={okrForm.quarter}
                    onChange={(e) => setOkrForm({ ...okrForm, quarter: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-medium outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsOkrModalOpen(false)}
                  className="px-4 py-2 rounded-2xl text-xs font-semibold text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-lg shadow-indigo-500/20"
                >
                  Save Objective
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </Layout>
  );
}
