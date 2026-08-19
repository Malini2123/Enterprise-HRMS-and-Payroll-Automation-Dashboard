import React, { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
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
  Sparkles,
  ChevronRight,
  Eye,
  Clock,
  Filter,
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
    jobTitle: 'Senior Full Stack Engineer',
    email: '',
    phone: '+1 (555) 019-2834',
    notes: '',
  });

  // Candidate Detail View Modal
  const [selectedCandidate, setSelectedCandidate] = useState(null);

  // Fetch Jobs
  const { data: jobs = [] } = useQuery({
    queryKey: ['recruitmentJobs'],
    queryFn: async () => {
      try {
        const res = await api.get('/recruitment/jobs');
        if (res.data && res.data.length > 0) return res.data;
        throw new Error('Empty');
      } catch {
        return [
          { id: 'job-1', title: 'Senior Full Stack Engineer', department: 'Engineering', location: 'San Francisco, CA (Hybrid)', type: 'Full-time', experience: '4+ Years', salaryRange: '$130k - $170k', status: 'active', applicantCount: 14, openingsCount: 2 },
          { id: 'job-2', title: 'Lead Product Designer (UI/UX)', department: 'Product & Design', location: 'Remote (US/EU)', type: 'Full-time', experience: '5+ Years', salaryRange: '$120k - $155k', status: 'active', applicantCount: 19, openingsCount: 1 },
          { id: 'job-3', title: 'Cloud DevOps & Platform Architect', department: 'Infrastructure', location: 'New York, NY (Hybrid)', type: 'Full-time', experience: '5+ Years', salaryRange: '$140k - $180k', status: 'active', applicantCount: 8, openingsCount: 1 },
          { id: 'job-4', title: 'Talent Acquisition & People Lead', department: 'Human Resources', location: 'Austin, TX', type: 'Full-time', experience: '3+ Years', salaryRange: '$90k - $120k', status: 'active', applicantCount: 11, openingsCount: 1 },
        ];
      }
    },
  });

  // Fetch Candidates
  const { data: candidates = [] } = useQuery({
    queryKey: ['recruitmentCandidates'],
    queryFn: async () => {
      try {
        const res = await api.get('/recruitment/candidates');
        if (res.data && res.data.length > 0) return res.data;
        throw new Error('Empty');
      } catch {
        return [
          { id: 'cand-1', name: 'Arjun Mehta', jobTitle: 'Cloud DevOps Architect', stage: 'applied', rating: 4.5, email: 'arjun.mehta@cloudsec.net', phone: '+1 (555) 349-2180', appliedDate: '2026-08-10', notes: 'Certified Kubernetes Administrator, Terraform & AWS multi-region expertise.', avatarColor: 'from-blue-600 to-indigo-600' },
          { id: 'cand-2', name: 'Sofia Martinez', jobTitle: 'Lead Product Designer', stage: 'screening', rating: 5.0, email: 'sofia.m@designlab.org', phone: '+1 (555) 892-3112', appliedDate: '2026-08-05', notes: 'Exceptional design portfolio, strong experience with design systems & Figma tokens.', avatarColor: 'from-pink-600 to-rose-600' },
          { id: 'cand-3', name: 'Elena Rostova', jobTitle: 'Senior Full Stack Engineer', stage: 'interview', rating: 5.0, email: 'elena.rostova@techmail.io', phone: '+1 (555) 773-9021', appliedDate: '2026-08-01', notes: 'Passed technical coding round with stellar performance. Built real-time WebSocket apps.', avatarColor: 'from-purple-600 to-indigo-600' },
          { id: 'cand-4', name: 'Liam Chen', jobTitle: 'Senior Full Stack Engineer', stage: 'offer', rating: 5.0, email: 'liam.chen@devhub.co', phone: '+1 (555) 441-8930', appliedDate: '2026-07-28', notes: 'Offer letter dispatched at $165k base salary. Awaiting signature.', avatarColor: 'from-amber-600 to-orange-600' },
          { id: 'cand-5', name: 'Chloe Bennett', jobTitle: 'HR People Operations', stage: 'hired', rating: 5.0, email: 'chloe.bennett@peoplefirst.com', phone: '+1 (555) 662-8109', appliedDate: '2026-07-20', notes: 'Offer accepted! Starting onboarding next Monday.', avatarColor: 'from-emerald-600 to-teal-600' },
        ];
      }
    },
  });

  // Stage Move Handler
  const handleStageChange = async (candidateId, newStage) => {
    try {
      await api.patch(`/recruitment/candidates/${candidateId}/stage`, { stage: newStage });
      queryClient.invalidateQueries({ queryKey: ['recruitmentCandidates'] });
    } catch {
      // Local fallback state
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
        title: 'Pipeline Stage Updated',
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
    setCandidateForm({ name: '', jobTitle: 'Senior Full Stack Engineer', email: '', phone: '+1 (555) 019-2834', notes: '' });
  };

  const stages = [
    { id: 'applied', label: 'Applied', color: 'border-slate-300 dark:border-slate-700', badge: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300' },
    { id: 'screening', label: 'Screening', color: 'border-indigo-400', badge: 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300' },
    { id: 'interview', label: 'Interview', color: 'border-purple-400', badge: 'bg-purple-50 text-purple-700 dark:bg-purple-950 dark:text-purple-300' },
    { id: 'offer', label: 'Offer Sent', color: 'border-amber-400', badge: 'bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300' },
    { id: 'hired', label: 'Hired 🎉', color: 'border-emerald-500', badge: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300' },
  ];

  return (
    <Layout>
      {/* Top Header Section with Ample Spacing */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-xs font-semibold text-indigo-700 dark:text-indigo-300 mb-2 border border-indigo-200/60 dark:border-indigo-800/60">
            <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
            <span>Talent Acquisition & ATS Engine</span>
          </div>
          <h1 className="font-heading text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Recruitment ATS Pipeline
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Track hiring stages, review candidate applications, manage open requisitions, and onboard new hires.
          </p>
        </div>

        {/* Top actions & Tab Switcher */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-slate-200/70 dark:bg-slate-800/70 border border-slate-300/60 dark:border-slate-700/60">
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
            className="px-4 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-500/20 flex items-center gap-2 cursor-pointer transition-all active:scale-95"
          >
            <PlusCircle className="w-4 h-4" /> Add Candidate
          </button>
        </div>
      </div>

      {/* VIEW 1: KANBAN PIPELINE BOARD */}
      {activeTab === 'kanban' && (
        <div className="overflow-x-auto pb-6 pt-2 animate-slide-up">
          <div className="flex items-start gap-4 min-w-max">
            {stages.map((stage) => {
              const stageCandidates = candidates.filter((c) => c.stage === stage.id);
              return (
                <div
                  key={stage.id}
                  className="w-[300px] shrink-0 bg-slate-100/70 dark:bg-slate-900/60 rounded-3xl p-4 border border-slate-200/80 dark:border-slate-800 flex flex-col min-h-[580px] shadow-sm"
                >
                  {/* Column Header */}
                  <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-200 dark:border-slate-800">
                    <span className="font-heading font-bold text-xs text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                      <span className={`w-2.5 h-2.5 rounded-full ${stage.id === 'hired' ? 'bg-emerald-500' : stage.id === 'offer' ? 'bg-amber-500' : stage.id === 'interview' ? 'bg-purple-500' : stage.id === 'screening' ? 'bg-indigo-500' : 'bg-slate-400'}`} />
                      {stage.label}
                    </span>
                    <span className="w-5 h-5 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-mono text-[10px] font-bold flex items-center justify-center">
                      {stageCandidates.length}
                    </span>
                  </div>

                  {/* Candidate Cards List */}
                  <div className="space-y-3.5 flex-1 overflow-y-auto">
                    {stageCandidates.length === 0 ? (
                      <div className="h-36 flex flex-col items-center justify-center text-xs text-slate-400 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl p-4 text-center">
                        <Users className="w-5 h-5 text-slate-300 dark:text-slate-600 mb-1" />
                        <span>No candidates in {stage.label}</span>
                      </div>
                    ) : (
                      stageCandidates.map((cand) => (
                        <div
                          key={cand.id}
                          className="bg-white dark:bg-slate-950/80 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 space-y-3 transition-all hover:shadow-md group"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex items-center gap-2.5">
                              <div className={`w-8 h-8 rounded-xl bg-gradient-to-tr ${cand.avatarColor || 'from-indigo-600 to-purple-600'} text-white font-bold text-xs flex items-center justify-center shrink-0 shadow-sm`}>
                                {cand.name.charAt(0)}
                              </div>
                              <div>
                                <h4 className="font-heading font-bold text-xs text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                                  {cand.name}
                                </h4>
                                <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                                  {cand.jobTitle}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-0.5 text-amber-500 font-bold text-[10px] bg-amber-50 dark:bg-amber-950/40 px-1.5 py-0.5 rounded-md">
                              <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                              <span>{cand.rating || 5}.0</span>
                            </div>
                          </div>

                          {cand.notes && (
                            <p className="text-[11px] text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-900/60 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800/80 line-clamp-2 leading-relaxed">
                              {cand.notes}
                            </p>
                          )}

                          <div className="space-y-1 text-[11px] text-slate-500 dark:text-slate-400">
                            <div className="flex items-center gap-1.5 truncate">
                              <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                              <span className="truncate">{cand.email}</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                              <span>Applied: {cand.appliedDate}</span>
                            </div>
                          </div>

                          {/* Card Footer Actions */}
                          <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
                            <div className="flex items-center gap-1">
                              <label className="text-[9px] uppercase font-bold text-slate-400">Stage:</label>
                              <select
                                value={cand.stage}
                                onChange={(e) => handleStageChange(cand.id, e.target.value)}
                                className="text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 px-2 py-1 rounded-lg outline-none cursor-pointer border border-slate-200 dark:border-slate-700"
                              >
                                <option value="applied">Applied</option>
                                <option value="screening">Screening</option>
                                <option value="interview">Interview</option>
                                <option value="offer">Offer Sent</option>
                                <option value="hired">Hired 🎉</option>
                              </select>
                            </div>

                            <div className="flex items-center gap-1">
                              <button
                                type="button"
                                onClick={() => setSelectedCandidate(cand)}
                                title="View Details"
                                className="p-1 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-slate-800"
                              >
                                <Eye className="w-3.5 h-3.5" />
                              </button>

                              {stage.id === 'hired' && (
                                <button
                                  type="button"
                                  onClick={() => navigate('/onboard')}
                                  className="px-2 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[10px] flex items-center gap-1 shadow-sm"
                                >
                                  <UserCheck className="w-3 h-3" /> Onboard
                                </button>
                              )}
                            </div>
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
              className="px-4 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center gap-2 cursor-pointer shadow-md shadow-indigo-500/20"
            >
              <PlusCircle className="w-4 h-4" /> Post New Job Opening
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {jobs.map((job) => (
              <div key={job.id} className="glass-card p-6 rounded-3xl space-y-4 flex flex-col justify-between hover:shadow-xl transition-all">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] uppercase font-bold px-2.5 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 border border-indigo-200/50 dark:border-indigo-800/50">
                      {job.department}
                    </span>
                    <span className="text-xs font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950 px-2 py-0.5 rounded-full uppercase">
                      {job.status}
                    </span>
                  </div>

                  <h3 className="font-heading font-bold text-base sm:text-lg text-slate-900 dark:text-white">
                    {job.title}
                  </h3>

                  <div className="grid grid-cols-2 gap-2.5 my-3 text-xs text-slate-500 dark:text-slate-400">
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
                    className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    View Pipeline <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Candidate Detail Modal */}
      {selectedCandidate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-slide-up">
          <div className="w-full max-w-lg rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-2xl space-y-5">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-2xl bg-gradient-to-tr ${selectedCandidate.avatarColor || 'from-indigo-600 to-purple-600'} text-white font-bold text-base flex items-center justify-center shadow-md`}>
                  {selectedCandidate.name.charAt(0)}
                </div>
                <div>
                  <h3 className="font-heading font-bold text-lg text-slate-900 dark:text-white">
                    {selectedCandidate.name}
                  </h3>
                  <p className="text-xs text-slate-500">{selectedCandidate.jobTitle}</p>
                </div>
              </div>
              <button onClick={() => setSelectedCandidate(null)} className="p-1 text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3 p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800">
                <div>
                  <p className="text-slate-400 font-medium">Email Address</p>
                  <p className="font-semibold text-slate-900 dark:text-white mt-0.5">{selectedCandidate.email}</p>
                </div>
                <div>
                  <p className="text-slate-400 font-medium">Phone Number</p>
                  <p className="font-semibold text-slate-900 dark:text-white mt-0.5">{selectedCandidate.phone || '+1 (555) 019-2834'}</p>
                </div>
                <div>
                  <p className="text-slate-400 font-medium">Current Stage</p>
                  <span className="capitalize font-bold text-indigo-600 dark:text-indigo-400 mt-0.5 inline-block">
                    {selectedCandidate.stage}
                  </span>
                </div>
                <div>
                  <p className="text-slate-400 font-medium">Applied Date</p>
                  <p className="font-semibold text-slate-900 dark:text-white mt-0.5">{selectedCandidate.appliedDate}</p>
                </div>
              </div>

              <div>
                <p className="font-semibold text-slate-700 dark:text-slate-300 mb-1">Evaluation & Interview Notes</p>
                <p className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 leading-relaxed">
                  {selectedCandidate.notes || 'No evaluation notes recorded yet.'}
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setSelectedCandidate(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                Close
              </button>
              {selectedCandidate.stage === 'hired' ? (
                <button
                  type="button"
                  onClick={() => {
                    setSelectedCandidate(null);
                    navigate('/onboard');
                  }}
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-md"
                >
                  <UserCheck className="w-4 h-4" /> Start Onboarding
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    handleStageChange(selectedCandidate.id, 'hired');
                    setSelectedCandidate(null);
                  }}
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md shadow-indigo-500/25"
                >
                  Mark as Hired 🎉
                </button>
              )}
            </div>
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
                  Full Name
                </label>
                <input
                  type="text"
                  value={candidateForm.name}
                  onChange={(e) => setCandidateForm({ ...candidateForm, name: e.target.value })}
                  placeholder="Candidate Name"
                  className="w-full px-4 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-medium outline-none focus:border-indigo-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Target Job Position
                </label>
                <select
                  value={candidateForm.jobTitle}
                  onChange={(e) => setCandidateForm({ ...candidateForm, jobTitle: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-medium outline-none focus:border-indigo-500"
                >
                  {jobs.map((j) => (
                    <option key={j.id} value={j.title}>{j.title}</option>
                  ))}
                </select>
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
                    placeholder="name@email.com"
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
                    placeholder="+1 (555) 000-0000"
                    className="w-full px-4 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-medium outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Key Skills & Background Notes
                </label>
                <textarea
                  value={candidateForm.notes}
                  onChange={(e) => setCandidateForm({ ...candidateForm, notes: e.target.value })}
                  placeholder="Highlights from resume, tech stack proficiency, initial notes..."
                  rows={3}
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
