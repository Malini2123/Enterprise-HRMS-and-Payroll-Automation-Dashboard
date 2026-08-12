import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '../api/axios';
import Layout from '../components/Layout';
import {
  BookOpen,
  Search,
  ChevronDown,
  ChevronUp,
  FileText,
  ShieldCheck,
  Calendar,
  DollarSign,
  Compass,
  Plane,
  Heart,
  HelpCircle,
} from 'lucide-react';

export default function CompanyPolicies() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [expandedId, setExpandedId] = useState('pol-1');

  // Fetch Policies
  const { data: policies = [] } = useQuery({
    queryKey: ['companyPolicies'],
    queryFn: async () => {
      try {
        const res = await api.get('/policies');
        return res.data;
      } catch {
        return [];
      }
    },
  });

  const filteredPolicies = policies.filter((p) => {
    const textMatch =
      p.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.summary?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.content?.toLowerCase().includes(searchQuery.toLowerCase());
    const catMatch = selectedCategory === 'All' || p.category === selectedCategory;
    return textMatch && catMatch;
  });

  const categories = ['All', 'Leave & Time Off', 'Workplace & Remote', 'Compensation & Benefits', 'Travel & Expenses'];

  return (
    <Layout>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="font-heading text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Company Policies & Knowledge Base
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Official employee handbook, leave guidelines, remote work stipend rules, and benefit coverage documents.
          </p>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="glass-card p-4 sm:p-5 rounded-3xl mb-8 space-y-4">
        <div className="flex items-center gap-3 px-4 py-2 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
          <Search className="w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search policies, FAQs, medical guidelines, travel per diem..."
            className="w-full bg-transparent text-xs font-medium outline-none text-slate-800 dark:text-white placeholder-slate-400"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-indigo-600 text-white'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Main Grid: Policies Accordion & Quick Tools */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Policy Accordions */}
        <div className="lg:col-span-2 space-y-4">
          {filteredPolicies.map((pol) => {
            const isExpanded = expandedId === pol.id;
            return (
              <div
                key={pol.id}
                className="glass-card rounded-3xl overflow-hidden transition-all border border-slate-200/80 dark:border-slate-800"
              >
                <div
                  onClick={() => setExpandedId(isExpanded ? null : pol.id)}
                  className="p-5 sm:p-6 flex items-center justify-between cursor-pointer hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400">
                        {pol.category}
                      </span>
                      <span className="text-xs text-slate-400">Effective: {pol.effectiveDate}</span>
                    </div>
                    <h3 className="font-heading font-bold text-base text-slate-900 dark:text-white">{pol.title}</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">{pol.summary}</p>
                  </div>

                  <div className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 shrink-0 ml-4">
                    {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </div>
                </div>

                {isExpanded && (
                  <div className="px-5 sm:px-6 pb-6 pt-2 border-t border-slate-100 dark:border-slate-800/60 text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed bg-slate-50/50 dark:bg-slate-900/40">
                    <p>{pol.content}</p>

                    <div className="mt-4 p-3 rounded-2xl bg-indigo-50/60 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/40 flex items-center justify-between text-xs">
                      <span className="text-indigo-700 dark:text-indigo-300 font-semibold">
                        Need clarification on this policy?
                      </span>
                      <a href="/helpdesk" className="font-bold text-indigo-600 dark:text-indigo-400 hover:underline">
                        Ask HR on Helpdesk →
                      </a>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Quick Calculator & Assistance Sidebar */}
        <div className="space-y-6">
          {/* Quick FAQ / Assistance Card */}
          <div className="glass-card p-6 rounded-3xl space-y-4">
            <div className="flex items-center gap-2">
              <HelpCircle className="w-5 h-5 text-indigo-500" />
              <h3 className="font-heading font-bold text-base text-slate-900 dark:text-white">Quick Policy FAQs</h3>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
                <p className="font-bold text-slate-900 dark:text-white">How many PTO days roll over?</p>
                <p className="text-slate-500 dark:text-slate-400 mt-1">
                  Up to 5 unused vacation days roll over into the subsequent calendar year automatically.
                </p>
              </div>

              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
                <p className="font-bold text-slate-900 dark:text-white">What is the home office allowance?</p>
                <p className="text-slate-500 dark:text-slate-400 mt-1">
                  Full-time employees receive a one-time $1,000 stipend for ergonomics and office setup.
                </p>
              </div>

              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
                <p className="font-bold text-slate-900 dark:text-white">When is monthly payroll disbursed?</p>
                <p className="text-slate-500 dark:text-slate-400 mt-1">
                  Salaries are directly deposited via ACH on the last business day of every calendar month.
                </p>
              </div>
            </div>
          </div>

          {/* Download Official Handbook */}
          <div className="p-6 rounded-3xl bg-gradient-to-tr from-indigo-900 to-purple-900 text-white shadow-xl flex flex-col justify-between">
            <div>
              <BookOpen className="w-8 h-8 text-indigo-300 mb-3" />
              <h4 className="font-heading font-bold text-base">Download Complete Employee Handbook</h4>
              <p className="text-xs text-indigo-200 mt-1">
                Full 48-page PDF document covering corporate compliance, ethics, security, and global policies.
              </p>
            </div>
            <button
              onClick={() => window.print()}
              className="mt-5 w-full py-2.5 rounded-2xl bg-white text-indigo-900 font-bold text-xs hover:bg-indigo-50 transition-all shadow-md cursor-pointer"
            >
              Download PDF Handbook
            </button>
          </div>
        </div>
      </div>
    </Layout>
  );
}
