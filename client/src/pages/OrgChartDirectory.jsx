import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '../api/axios';
import Layout from '../components/Layout';
import {
  Users,
  Search,
  ChevronDown,
  ChevronRight,
  Mail,
  Phone,
  MapPin,
  Building,
  LayoutGrid,
  List,
  Shield,
  Sparkles,
} from 'lucide-react';
import { useNotification } from '../context/NotificationContext';

export default function OrgChartDirectory() {
  const { addToast } = useNotification();
  const [viewMode, setViewMode] = useState('chart'); // 'chart', 'directory'
  const [directoryLayout, setDirectoryLayout] = useState('grid'); // 'grid', 'list'
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDept, setSelectedDept] = useState('All');

  // Fetch Hierarchy
  const { data: hierarchy } = useQuery({
    queryKey: ['orgHierarchy'],
    queryFn: async () => {
      try {
        const res = await api.get('/org/hierarchy');
        return res.data;
      } catch {
        return null;
      }
    },
  });

  // Fetch Employees List
  const { data: employees = [] } = useQuery({
    queryKey: ['employeesList'],
    queryFn: async () => {
      try {
        const res = await api.get('/employees');
        return res.data;
      } catch {
        return [];
      }
    },
  });

  const filteredEmployees = employees.filter((emp) => {
    const nameMatch = emp.name?.toLowerCase().includes(searchQuery.toLowerCase());
    const emailMatch = emp.email?.toLowerCase().includes(searchQuery.toLowerCase());
    const deptMatch =
      selectedDept === 'All' ||
      emp.departmentInfo?.name?.toLowerCase().includes(selectedDept.toLowerCase()) ||
      emp.title?.toLowerCase().includes(selectedDept.toLowerCase());
    return (nameMatch || emailMatch) && deptMatch;
  });

  return (
    <Layout>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="font-heading text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Org Hierarchy & Team Directory
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Visual organizational reporting structure, management hierarchy, and staff contact directory.
          </p>
        </div>

        {/* View Switcher Pill */}
        <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-slate-200/80 dark:bg-slate-800/80 border border-slate-300/60 dark:border-slate-700/60 w-fit">
          <button
            onClick={() => setViewMode('chart')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              viewMode === 'chart'
                ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Org Tree View
          </button>
          <button
            onClick={() => setViewMode('directory')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              viewMode === 'directory'
                ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Directory Cards
          </button>
        </div>
      </div>

      {/* VIEW 1: ORGANIZATIONAL TREE VISUALIZER */}
      {viewMode === 'chart' && (
        <div className="glass-card p-6 sm:p-10 rounded-3xl overflow-x-auto animate-slide-up">
          <div className="min-w-[800px] flex flex-col items-center">
            {/* CEO Level */}
            <div className="flex flex-col items-center">
              <div className="p-4 rounded-3xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-xl shadow-indigo-500/20 text-center w-72 border border-white/20">
                <div className="w-12 h-12 rounded-2xl bg-white/20 text-white font-black text-sm flex items-center justify-center mx-auto mb-2 backdrop-blur-md">
                  AH
                </div>
                <h3 className="font-heading font-extrabold text-base">Alexandra Hayes</h3>
                <p className="text-xs text-indigo-200 font-medium">Chief Executive Officer</p>
                <span className="inline-block mt-2 px-2.5 py-0.5 rounded-full bg-white/20 text-[10px] font-bold">
                  Executive Board
                </span>
              </div>

              {/* Vertical connector */}
              <div className="w-0.5 h-10 bg-indigo-300 dark:bg-indigo-700" />
              {/* Horizontal bar */}
              <div className="w-[650px] h-0.5 bg-indigo-300 dark:bg-indigo-700" />
            </div>

            {/* Department Heads Level */}
            <div className="grid grid-cols-3 gap-8 mt-0 w-full max-w-4xl">
              {/* HR VP */}
              <div className="flex flex-col items-center">
                <div className="w-0.5 h-8 bg-indigo-300 dark:bg-indigo-700" />
                <div className="glass-card p-4 rounded-3xl text-center w-full border-2 border-indigo-200 dark:border-indigo-800">
                  <div className="w-10 h-10 rounded-xl bg-pink-500 text-white font-bold text-xs flex items-center justify-center mx-auto mb-2">
                    PS
                  </div>
                  <h4 className="font-heading font-bold text-sm text-slate-900 dark:text-white">Priya Sharma</h4>
                  <p className="text-xs text-slate-400">VP of People & Culture</p>
                  <span className="inline-block mt-1 px-2 py-0.5 rounded-full bg-pink-50 dark:bg-pink-950 text-pink-600 text-[10px] font-bold">
                    HR & Finance (6 Reports)
                  </span>
                </div>

                {/* Sub reports */}
                <div className="w-0.5 h-6 bg-slate-300 dark:bg-slate-700" />
                <div className="space-y-2 w-full">
                  <div className="p-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-center text-xs">
                    <p className="font-bold text-slate-800 dark:text-slate-200">David Miller</p>
                    <p className="text-[10px] text-slate-400">Senior Financial Controller</p>
                  </div>
                  <div className="p-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-center text-xs">
                    <p className="font-bold text-slate-800 dark:text-slate-200">Chloe Bennett</p>
                    <p className="text-[10px] text-slate-400">HR Operations Specialist</p>
                  </div>
                </div>
              </div>

              {/* Engineering VP */}
              <div className="flex flex-col items-center">
                <div className="w-0.5 h-8 bg-indigo-300 dark:bg-indigo-700" />
                <div className="glass-card p-4 rounded-3xl text-center w-full border-2 border-indigo-200 dark:border-indigo-800">
                  <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white font-bold text-xs flex items-center justify-center mx-auto mb-2">
                    MV
                  </div>
                  <h4 className="font-heading font-bold text-sm text-slate-900 dark:text-white">Marcus Vance</h4>
                  <p className="text-xs text-slate-400">Head of Engineering</p>
                  <span className="inline-block mt-1 px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950 text-indigo-600 text-[10px] font-bold">
                    Tech & Ops (22 Reports)
                  </span>
                </div>

                {/* Sub reports */}
                <div className="w-0.5 h-6 bg-slate-300 dark:bg-slate-700" />
                <div className="space-y-2 w-full">
                  <div className="p-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-center text-xs">
                    <p className="font-bold text-slate-800 dark:text-slate-200">Sarah Jenkins</p>
                    <p className="text-[10px] text-slate-400">Senior Full Stack Engineer</p>
                  </div>
                  <div className="p-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-center text-xs">
                    <p className="font-bold text-slate-800 dark:text-slate-200">Carlos Rodriguez</p>
                    <p className="text-[10px] text-slate-400">Backend Core Engineer</p>
                  </div>
                  <div className="p-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-center text-xs">
                    <p className="font-bold text-slate-800 dark:text-slate-200">Emily Zhang</p>
                    <p className="text-[10px] text-slate-400">Cloud DevOps Architect</p>
                  </div>
                </div>
              </div>

              {/* Product VP */}
              <div className="flex flex-col items-center">
                <div className="w-0.5 h-8 bg-indigo-300 dark:bg-indigo-700" />
                <div className="glass-card p-4 rounded-3xl text-center w-full border-2 border-indigo-200 dark:border-indigo-800">
                  <div className="w-10 h-10 rounded-xl bg-purple-600 text-white font-bold text-xs flex items-center justify-center mx-auto mb-2">
                    AP
                  </div>
                  <h4 className="font-heading font-bold text-sm text-slate-900 dark:text-white">Aisha Patel</h4>
                  <p className="text-xs text-slate-400">VP of Product & Experience</p>
                  <span className="inline-block mt-1 px-2 py-0.5 rounded-full bg-purple-50 dark:bg-purple-950 text-purple-600 text-[10px] font-bold">
                    Product & UX (8 Reports)
                  </span>
                </div>

                {/* Sub reports */}
                <div className="w-0.5 h-6 bg-slate-300 dark:bg-slate-700" />
                <div className="space-y-2 w-full">
                  <div className="p-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-center text-xs">
                    <p className="font-bold text-slate-800 dark:text-slate-200">James Wilson</p>
                    <p className="text-[10px] text-slate-400">Enterprise Account Exec</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* VIEW 2: SEARCHABLE EMPLOYEE DIRECTORY */}
      {viewMode === 'directory' && (
        <div className="space-y-6 animate-slide-up">
          {/* Filter Bar */}
          <div className="glass-card p-4 sm:p-5 rounded-3xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex-1 flex items-center gap-3 px-4 py-2 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
              <Search className="w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search staff by name, email, or role..."
                className="w-full bg-transparent text-xs font-medium outline-none text-slate-800 dark:text-white placeholder-slate-400"
              />
            </div>

            <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
              {['All', 'Engineering', 'Human Resources', 'Product', 'Finance'].map((d) => (
                <button
                  key={d}
                  onClick={() => setSelectedDept(d)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                    selectedDept === d
                      ? 'bg-indigo-600 text-white'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
                  }`}
                >
                  {d}
                </button>
              ))}
            </div>
          </div>

          {/* Directory Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {filteredEmployees.map((emp, i) => (
              <div key={i} className="glass-card p-5 rounded-3xl flex flex-col justify-between group">
                <div>
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-indigo-500 to-purple-600 text-white font-bold text-sm flex items-center justify-center shadow-md">
                      {emp.name?.charAt(0) || 'U'}
                    </div>
                    <div className="truncate">
                      <h4 className="font-heading font-bold text-sm text-slate-900 dark:text-white truncate">
                        {emp.name}
                      </h4>
                      <p className="text-[11px] text-slate-400 truncate">{emp.title || 'Team Member'}</p>
                    </div>
                  </div>

                  <div className="space-y-1.5 text-xs text-slate-500 dark:text-slate-400 mb-4">
                    <div className="flex items-center gap-2 truncate">
                      <Building className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="truncate">{emp.departmentInfo?.name || 'Engineering'}</span>
                    </div>
                    <div className="flex items-center gap-2 truncate">
                      <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="truncate">{emp.email}</span>
                    </div>
                    <div className="flex items-center gap-2 truncate">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="truncate">{emp.location || 'San Francisco, CA'}</span>
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500">
                    {emp.role?.replace('_', ' ')}
                  </span>
                  <a
                    href={`mailto:${emp.email}`}
                    className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 transition-colors"
                    title="Send Email"
                  >
                    <Mail className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </Layout>
  );
}
