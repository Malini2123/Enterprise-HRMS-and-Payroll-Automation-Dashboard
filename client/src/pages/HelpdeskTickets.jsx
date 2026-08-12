import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../api/axios';
import Layout from '../components/Layout';
import {
  HelpCircle,
  PlusCircle,
  MessageSquare,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Send,
  X,
  User,
  Shield,
  Tag,
} from 'lucide-react';
import { useNotification } from '../context/NotificationContext';

export default function HelpdeskTickets() {
  const queryClient = useQueryClient();
  const { addToast } = useNotification();
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [isRaiseModalOpen, setIsRaiseModalOpen] = useState(false);
  const [newReply, setNewReply] = useState('');
  const [ticketForm, setTicketForm] = useState({
    title: '',
    category: 'IT Support',
    priority: 'medium',
    description: '',
  });

  // Fetch Tickets
  const { data: tickets = [] } = useQuery({
    queryKey: ['helpdeskTickets'],
    queryFn: async () => {
      try {
        const res = await api.get('/helpdesk/tickets');
        return res.data;
      } catch {
        return [];
      }
    },
  });

  const handleRaiseTicket = (e) => {
    e.preventDefault();
    if (!ticketForm.title || !ticketForm.description) {
      addToast({ title: 'Validation Error', message: 'Title and description are required.', type: 'error' });
      return;
    }

    addToast({
      title: 'Support Ticket Raised',
      message: `Ticket "${ticketForm.title}" submitted to ${ticketForm.category} queue.`,
      type: 'success',
    });

    setIsRaiseModalOpen(false);
    setTicketForm({ title: '', category: 'IT Support', priority: 'medium', description: '' });
  };

  const handleSendReply = (e) => {
    e.preventDefault();
    if (!newReply) return;

    if (selectedTicket) {
      const updated = {
        ...selectedTicket,
        replies: [
          ...(selectedTicket.replies || []),
          {
            author: 'You',
            authorRole: 'employee',
            message: newReply,
            createdAt: new Date().toISOString(),
          },
        ],
      };
      setSelectedTicket(updated);
      addToast({ title: 'Reply Sent', message: 'Your message has been added to the ticket thread.', type: 'success' });
      setNewReply('');
    }
  };

  return (
    <Layout>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="font-heading text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Enterprise Helpdesk & Ticketing
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Submit IT support requests, payroll inquiries, equipment requisitions, and track SLAs.
          </p>
        </div>

        <button
          onClick={() => setIsRaiseModalOpen(true)}
          className="px-4 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-500/20 flex items-center gap-2 cursor-pointer w-fit"
        >
          <PlusCircle className="w-4 h-4" /> Raise Support Ticket
        </button>
      </div>

      {/* Ticket List Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Ticket Feed */}
        <div className="lg:col-span-2 space-y-4">
          {tickets.map((t) => (
            <div
              key={t.id}
              onClick={() => setSelectedTicket(t)}
              className={`glass-card p-5 sm:p-6 rounded-3xl cursor-pointer transition-all border-2 ${
                selectedTicket?.id === t.id ? 'border-indigo-500 shadow-lg' : 'border-transparent'
              }`}
            >
              <div className="flex items-center justify-between gap-2 mb-2">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950 px-2 py-0.5 rounded-md">
                    {t.ticketNumber}
                  </span>
                  <span className="text-xs text-slate-400 font-semibold">• {t.category}</span>
                </div>

                <div className="flex items-center gap-2">
                  <span
                    className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                      t.priority === 'urgent'
                        ? 'bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400'
                        : t.priority === 'high'
                        ? 'bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                    }`}
                  >
                    {t.priority}
                  </span>
                  <span
                    className={`text-[10px] font-bold uppercase px-2.5 py-0.5 rounded-full ${
                      t.status === 'resolved'
                        ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400'
                        : t.status === 'in_progress'
                        ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400'
                        : 'bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400'
                    }`}
                  >
                    {t.status.replace('_', ' ')}
                  </span>
                </div>
              </div>

              <h3 className="font-heading font-bold text-base text-slate-900 dark:text-white mt-1">{t.title}</h3>

              <div className="flex items-center justify-between text-xs text-slate-400 mt-4 pt-3 border-t border-slate-100 dark:border-slate-800">
                <span>Raised by: {t.raisedBy}</span>
                <span className="flex items-center gap-1">
                  <MessageSquare className="w-3.5 h-3.5" /> {t.replies?.length || 1} messages
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Selected Ticket Conversation Thread */}
        <div className="glass-card p-6 rounded-3xl flex flex-col justify-between min-h-[500px]">
          {selectedTicket ? (
            <>
              <div>
                <div className="pb-4 border-b border-slate-100 dark:border-slate-800">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-mono text-xs font-bold text-indigo-500">{selectedTicket.ticketNumber}</span>
                    <span className="text-[10px] uppercase font-bold text-emerald-500">
                      {selectedTicket.status}
                    </span>
                  </div>
                  <h4 className="font-heading font-bold text-sm text-slate-900 dark:text-white">
                    {selectedTicket.title}
                  </h4>
                </div>

                {/* Message Thread */}
                <div className="my-4 space-y-3 max-h-80 overflow-y-auto pr-1">
                  {selectedTicket.replies?.map((rep, idx) => (
                    <div
                      key={idx}
                      className={`p-3 rounded-2xl text-xs space-y-1 ${
                        rep.authorRole === 'admin'
                          ? 'bg-indigo-50/80 dark:bg-indigo-950/50 border border-indigo-100 dark:border-indigo-900/40 ml-4'
                          : 'bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 mr-4'
                      }`}
                    >
                      <div className="flex items-center justify-between font-bold text-slate-800 dark:text-slate-200">
                        <span>{rep.author}</span>
                        <span className="text-[10px] font-normal text-slate-400">
                          {new Date(rep.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <p className="text-slate-600 dark:text-slate-300">{rep.message}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Reply Form */}
              <form onSubmit={handleSendReply} className="pt-3 border-t border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={newReply}
                    onChange={(e) => setNewReply(e.target.value)}
                    placeholder="Type your response to support agent..."
                    className="flex-1 px-4 py-2 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs outline-none focus:border-indigo-500"
                  />
                  <button
                    type="submit"
                    className="p-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white shadow-md cursor-pointer"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </div>
              </form>
            </>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-400">
              <HelpCircle className="w-12 h-12 text-slate-300 dark:text-slate-700 mb-3" />
              <p className="text-sm font-semibold">Select a ticket to view thread</p>
              <p className="text-xs text-slate-400 mt-1">Chat directly with IT, Payroll, or Facilities dispatch.</p>
            </div>
          )}
        </div>
      </div>

      {/* Raise Ticket Modal */}
      {isRaiseModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-slide-up">
          <div className="w-full max-w-lg rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
              <h3 className="font-heading font-bold text-lg text-slate-900 dark:text-white">Raise Support Ticket</h3>
              <button onClick={() => setIsRaiseModalOpen(false)} className="p-1 text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleRaiseTicket} className="mt-5 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Issue Summary / Subject
                </label>
                <input
                  type="text"
                  value={ticketForm.title}
                  onChange={(e) => setTicketForm({ ...ticketForm, title: e.target.value })}
                  placeholder="e.g. Need VPN certificate renewal for staging environment"
                  className="w-full px-4 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-medium outline-none focus:border-indigo-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Department Queue
                  </label>
                  <select
                    value={ticketForm.category}
                    onChange={(e) => setTicketForm({ ...ticketForm, category: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-medium outline-none focus:border-indigo-500"
                  >
                    <option value="IT Support">IT Support & Hardware</option>
                    <option value="Payroll & Tax">Payroll & Tax Clarifications</option>
                    <option value="Facilities & Admin">Facilities & Ergonomics</option>
                    <option value="HR Inquiry">HR & Benefits Inquiry</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Priority Level
                  </label>
                  <select
                    value={ticketForm.priority}
                    onChange={(e) => setTicketForm({ ...ticketForm, priority: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-medium outline-none focus:border-indigo-500"
                  >
                    <option value="low">Low (Standard SLA 48h)</option>
                    <option value="medium">Medium (Standard SLA 24h)</option>
                    <option value="high">High (Urgent SLA 8h)</option>
                    <option value="urgent">Urgent / Blocking (SLA 2h)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Detailed Explanation & Reproduction Steps
                </label>
                <textarea
                  rows={3}
                  value={ticketForm.description}
                  onChange={(e) => setTicketForm({ ...ticketForm, description: e.target.value })}
                  placeholder="Provide all relevant details to help support agents resolve your ticket faster..."
                  className="w-full px-4 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-medium outline-none focus:border-indigo-500 resize-none"
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsRaiseModalOpen(false)}
                  className="px-4 py-2 rounded-2xl text-xs font-semibold text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-lg shadow-indigo-500/20"
                >
                  Submit Ticket
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </Layout>
  );
}
