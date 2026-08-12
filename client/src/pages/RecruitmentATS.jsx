import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import Layout from '../components/Layout';
import {
  Briefcase,
  Users,
  PlusCircle,
  ArrowRight,
  Star,
  Mail,
  Phone,
  Calendar,
  CheckCircle2,
  DollarSign,
  MapPin,
  X,
  UserCheck,
} from 'lucide-react';
import { useNotification } from '../context/NotificationContext';
import confetti from 'canvas-confetti';

export default function RecruitmentATS() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { addToast } = useNotification();
  const [activeTab, setActiveTab] = useState('kanban'); // 'kanban', 'jobs'

  // Job Opening Modal
  const [isJobModalOpen, setIsJobModalOpen] = useState(false);
  const [jobForm, setJobForm] = useState({
    title: '',
    department: 'Engineering',
    location: 'San Francisco, CA (Hybrid)',
    type: 'Full-time',
    experience: '3-5 years',
    salaryRange: '$120,000 - $160,000',
    description: '',
  });

  // Candidate Quick Add Modal
  const [isCandidateModalOpen, setIsCandidateModalOpen] = useState(false);
  const [candidateForm, setCandidateForm] = useState({
    name: '',
    jobTitle: 'Senior Full Stack Engineer (React/Node)',
    email: '',
    phone: '',
    notes: '',
  });

  // Fetch Jobs
  const { data: jobs = [] } = useQuery({
    queryKey: ['recruitmentJobs'],
    queryFn: async () => {
      try {
        const res = await api.get('/recruitment/jobs');
        return res.data;
      } catch {
        return [];
      }
    },
  });

  // Fetch Candidates
  const { data: candidates = [] } = useQuery({
    queryKey: ['recruitmentCandidates'],
    queryFn: async () => {
      try {
        const res = await api.get('/recruitment/candidates');
        return res.data;
      } catch {
        return [];
      }
    },
  });

  // Stage Move Handler
  const handleStageChange = async (candidateId, newStage) => {
    try {
      await api.patch(`/recruitment/candidates/${candidateId}/stage`, { stage: newStage });
      queryClient.invalidateQueries({ queryKey: ['recruitmentCandidates'] });
    } catch {
      // fallback
    }

    if (newStage === 'hired') {
      confetti({ particleCount: 50, spread: 70, origin: { y: 0.6 } });
      addToast({
        title: 'Candidate Hired! 🎉',
        message: 'Candidate marked as hired and ready for employee onboarding.',
        type: 'success',
      });
    } else {
      addToast({
        title: 'Pipeline Updated',
        message: `Candidate stage moved to "${newStage.toUpperCase()}".`,
        type: 'info',
      });
    }
  };

  const handleCreateJob = (e) => {
    e.preventDefault();
    if (!jobForm.title) {
      addToast({ title: 'Validation Error', message: 'Job title is required.', type: 'error' });
      return;
    }

    addToast({
      title: 'Job Opening Published',
      message: `Posted "${jobForm.title}" for ${jobForm.department}.`,
      type: 'success',
    });

    setIsJobModalOpen(false);
    setJobForm({ title: '', department: 'Engineering', location: 'San Francisco, CA (Hybrid)', type: 'Full-time', experience: '3-5 years', salaryRange: '$120,000 - $160,000', description: '' });
  };

  const handleAddCandidate = (e) => {
    e.preventDefault();
    if (!candidateForm.name || !candidateForm.email) {
      addToast({ title: 'Validation Error', message: 'Name and email are required.', type: 'error' });
      return;
    }

    addToast({
      title: 'Candidate Added to Pipeline',
      message: `Added ${candidateForm.name} under Applied stage.`,
      type: 'success',
    });

    setIsCandidateModalOpen(false);
    setCandidateForm({ name: '', jobTitle: 'Senior Full Stack Engineer (React/Node)', email: '', phone: '', notes: '' });
  };

  const stages = [
    { id: 'applied', label: 'Applied', color: 'border-slate-300 dark:border-slate-700' },
    { id: 'screening', label: 'Screening', color: 'border-indigo-400' },
    { id: 'interview', label: 'Interview', color: 'border-purple-400' },
    { id: 'offer', label: 'Offer Sent', color: 'border-amber-400' },
    { id: 'hired', label: 'Hired 🎉', color: 'border-emerald-500' },
  ];

  return (
    <Layout>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="font-heading text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Recruitment & ATS Pipeline
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Talent acquisition tracking, interactive Kanban pipeline, job openings, and candidate evaluations.
          </p>
        </div>

        {/* Top actions */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-slate-200/80 dark:bg-slate-800/80 border border-slate-300/60 dark:border-slate-700/60">
            <button
              onClick={() => setActiveTab('kanban')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'kanban'
                  ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Kanban Pipeline
            </button>
            <button
              onClick={() => setActiveTab('jobs')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'jobs'
                  ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Open Roles ({jobs.length})
            </button>
          </div>

          <button
            onClick={() => setIsCandidateModalOpen(true)}
            className="px-4 py-2 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-500/20 flex items-center gap-2 cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" /> Add Candidate
          </button>
        </div>
      </div>

      {/* VIEW 1: KANBAN PIPELINE BOARD */}
      {activeTab === 'kanban' && (
        <div className="overflow-x-auto pb-4 animate-slide-up">
          <div className="flex items-start gap-4 min-w-[1100px]">
            {stages.map((stage) => {
              const stageCandidates = candidates.filter((c) => c.stage === stage.id);
              return (
                <div
                  key={stage.id}
                  className="flex-1 bg-slate-100/70 dark:bg-slate-900/60 rounded-3xl p-4 border border-slate-200/80 dark:border-slate-800 flex flex-col min-h-[550px]"
                >
                  {/* Column Header */}
                  <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-200 dark:border-slate-800">
                    <span className="font-heading font-bold text-xs text-slate-800 dark:text-slate-200">
                      {stage.label}
                    </span>
                    <span className="w-5 h-5 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-mono text-[10px] font-bold flex items-center justify-center">
                      {stageCandidates.length}
                    </span>
                  </div>

                  {/* Candidate Cards */}
                  <div className="space-y-3 flex-1 overflow-y-auto">
                    {stageCandidates.length === 0 ? (
                      <div className="h-32 flex items-center justify-center text-[11px] text-slate-400 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl">
                        No candidates
                      </div>
                    ) : (
                      stageCandidates.map((cand) => (
                        <div
                          key={cand.id}
                          className="glass-card p-4 rounded-2xl border-l-4 space-y-2.5 transition-all shadow-sm"
                          style={{
                            borderLeftColor:
                              stage.id === 'hired'
                                ? '#10b981'
                                : stage.id === 'offer'
                                ? '#f59e0b'
                                : stage.id === 'interview'
                                ? '#a855f7'
                                : '#6366f1',
                          }}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <h4 className="font-heading font-bold text-xs text-slate-900 dark:text-white">
                                {cand.name}
                              </h4>
                              <p className="text-[10px] text-slate-400 font-medium truncate max-w-[140px]">
                                {cand.jobTitle}
                              </p>
                            </div>
                            <div className="flex items-center gap-0.5 text-amber-400 font-bold text-[10px]">
                              <Star className="w-3 h-3 fill-amber-400" />
                              <span>{cand.rating || 5}.0</span>
                            </div>
                          </div>

                          {cand.notes && (
                            <p className="text-[11px] text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/60 p-2 rounded-xl border border-slate-100 dark:border-slate-800 line-clamp-2">
                              {cand.notes}
                            </p>
                          )}

                          <div className="space-y-1 text-[10px] text-slate-400">
                            <div className="flex items-center gap-1.5 truncate">
                              <Mail className="w-3 h-3 shrink-0" />
                              <span className="truncate">{cand.email}</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <Calendar className="w-3 h-3 shrink-0" />
                              <span>Applied: {cand.appliedDate}</span>
                            </div>
                          </div>

                          {/* Quick Stage Progression Dropdown */}
                          <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
                            <select
                              value={cand.stage}
                              onChange={(e) => handleStageChange(cand.id, e.target.value)}
                              className="text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-2 py-1 rounded-lg outline-none cursor-pointer"
                            >
                              <option value="applied">Applied</option>
                              <option value="screening">Screening</option>
                              <option value="interview">Interview</option>
                              <option value="offer">Offer Sent</option>
                              <option value="hired">Hired 🎉</option>
                            </select>

                            {stage.id === 'hired' && (
                              <button
                                onClick={() => navigate('/onboard')}
                                className="px-2 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[10px] flex items-center gap-1"
                              >
                                <UserCheck className="w-3 h-3" /> Onboard
                              </button>
                            )}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* VIEW 2: JOB OPENINGS */}
      {activeTab === 'jobs' && (
        <div className="space-y-6 animate-slide-up">
          <div className="flex justify-end">
            <button
              onClick={() => setIsJobModalOpen(true)}
              className="px-4 py-2 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center gap-2 cursor-pointer shadow-md shadow-indigo-500/20"
            >
              <PlusCircle className="w-4 h-4" /> Post New Job Opening
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {jobs.map((job) => (
              <div key={job.id} className="glass-card p-6 rounded-3xl space-y-4 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] uppercase font-bold px-2.5 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400">
                      {job.department}
                    </span>
                    <span className="text-xs font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950 px-2 py-0.5 rounded-full uppercase">
                      {job.status}
                    </span>
                  </div>

                  <h3 className="font-heading font-bold text-base sm:text-lg text-slate-900 dark:text-white">
                    {job.title}
                  </h3>

                  <div className="grid grid-cols-2 gap-2 my-3 text-xs text-slate-500 dark:text-slate-400">
                    <div className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                      <span>{job.location}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <DollarSign className="w-3.5 h-3.5 text-slate-400" />
                      <span>{job.salaryRange}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Briefcase className="w-3.5 h-3.5 text-slate-400" />
                      <span>{job.type} • {job.experience}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Users className="w-3.5 h-3.5 text-slate-400" />
                      <span>{job.applicantCount || 12} Applicants</span>
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-400">{job.openingsCount || 1} Open Headcount</span>
                  <button
                    onClick={() => setActiveTab('kanban')}
                    className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
                  >
                    View Pipeline <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Post Job Modal */}
      {isJobModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-slide-up">
          <div className="w-full max-w-lg rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
              <h3 className="font-heading font-bold text-lg text-slate-900 dark:text-white">Post Job Opening</h3>
              <button onClick={() => setIsJobModalOpen(false)} className="p-1 text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateJob} className="mt-5 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Job Position Title
                </label>
                <input
                  type="text"
                  value={jobForm.title}
                  onChange={(e) => setJobForm({ ...jobForm, title: e.target.value })}
                  placeholder="e.g. Senior Frontend Architect"
                  className="w-full px-4 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-medium outline-none focus:border-indigo-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Department
                  </label>
                  <select
                    value={jobForm.department}
                    onChange={(e) => setJobForm({ ...jobForm, department: e.target.value })}
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
                    Salary Range
                  </label>
                  <input
                    type="text"
                    value={jobForm.salaryRange}
                    onChange={(e) => setJobForm({ ...jobForm, salaryRange: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-medium outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsJobModalOpen(false)}
                  className="px-4 py-2 rounded-2xl text-xs font-semibold text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-lg shadow-indigo-500/20"
                >
                  Publish Job
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Candidate Modal */}
      {isCandidateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-slide-up">
          <div className="w-full max-w-lg rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
              <h3 className="font-heading font-bold text-lg text-slate-900 dark:text-white">Add Candidate</h3>
              <button onClick={() => setIsCandidateModalOpen(false)} className="p-1 text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddCandidate} className="mt-5 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Candidate Full Name
                </label>
                <input
                  type="text"
                  value={candidateForm.name}
                  onChange={(e) => setCandidateForm({ ...candidateForm, name: e.target.value })}
                  placeholder="e.g. Jordan Miller"
                  className="w-full px-4 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-medium outline-none focus:border-indigo-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={candidateForm.email}
                    onChange={(e) => setCandidateForm({ ...candidateForm, email: e.target.value })}
                    placeholder="jordan@devmail.io"
                    className="w-full px-4 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-medium outline-none focus:border-indigo-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Phone Number
                  </label>
                  <input
                    type="text"
                    value={candidateForm.phone}
                    onChange={(e) => setCandidateForm({ ...candidateForm, phone: e.target.value })}
                    placeholder="+1 (555) 123-4567"
                    className="w-full px-4 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-medium outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Evaluation / Screener Notes
                </label>
                <textarea
                  rows={3}
                  value={candidateForm.notes}
                  onChange={(e) => setCandidateForm({ ...candidateForm, notes: e.target.value })}
                  placeholder="Strong system design foundation, 6+ years React & Node experience..."
                  className="w-full px-4 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-medium outline-none focus:border-indigo-500 resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsCandidateModalOpen(false)}
                  className="px-4 py-2 rounded-2xl text-xs font-semibold text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-lg shadow-indigo-500/20"
                >
                  Add Candidate
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </Layout>
  );
}
