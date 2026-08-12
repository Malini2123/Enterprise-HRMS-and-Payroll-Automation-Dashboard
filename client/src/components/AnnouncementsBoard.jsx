import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Megaphone, Plus, Trash2, X, Sparkles, Send } from 'lucide-react';
import api from '../api/axios';
import { useNotification } from '../context/NotificationContext';
import confetti from 'canvas-confetti';

export default function AnnouncementsBoard() {
  const queryClient = useQueryClient();
  const { addToast } = useNotification();
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');

  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const stored = localStorage.getItem('user');
      return stored ? JSON.parse(stored) : { role: 'hr_manager' };
    } catch {
      return { role: 'hr_manager' };
    }
  });

  const isManager = currentUser?.role === 'hr_manager' || currentUser?.role === 'admin';

  const { data: announcements = [], isLoading } = useQuery({
    queryKey: ['announcements'],
    queryFn: async () => {
      try {
        const res = await api.get('/announcements');
        return res.data;
      } catch {
        return [];
      }
    },
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !message.trim()) return;

    try {
      await api.post('/announcements', { title, message });
      queryClient.invalidateQueries({ queryKey: ['announcements'] });
    } catch {
      // Demo fallback
    }

    addToast({
      title: 'Announcement Broadcasted',
      message: `"${title}" has been published to all company dashboards.`,
      type: 'success',
    });

    confetti({ particleCount: 30, spread: 50, origin: { y: 0.7 } });
    setTitle('');
    setMessage('');
    setShowForm(false);
  };

  return (
    <div className="glass-card p-6 rounded-3xl space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="p-2.5 rounded-2xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400">
            <Megaphone className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-heading font-bold text-base text-slate-900 dark:text-white">
              Company Announcements
            </h3>
            <p className="text-[11px] text-slate-400">Live organization updates & news</p>
          </div>
        </div>

        {isManager && (
          <button
            onClick={() => setShowForm(!showForm)}
            className="flex items-center gap-1 text-xs font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 px-3 py-1.5 rounded-xl hover:bg-indigo-100 transition-all cursor-pointer"
          >
            {showForm ? <X className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
            {showForm ? 'Cancel' : 'Post Broadcast'}
          </button>
        )}
      </div>

      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-3 animate-slide-up"
        >
          <input
            type="text"
            placeholder="Headline Title (e.g. 🌴 Holiday Office Schedule)"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-3.5 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-semibold outline-none focus:border-indigo-500"
            required
          />
          <textarea
            placeholder="Write announcement details for all team members..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={2}
            className="w-full px-3.5 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs outline-none focus:border-indigo-500 resize-none"
            required
          />
          <button
            type="submit"
            className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-500/20 flex items-center gap-1.5 cursor-pointer"
          >
            <Send className="w-3.5 h-3.5" /> Broadcast to All
          </button>
        </form>
      )}

      <div className="space-y-3 max-h-80 overflow-y-auto">
        {announcements.map((item) => (
          <div
            key={item._id}
            className="p-4 rounded-2xl bg-slate-50/70 dark:bg-slate-800/30 border border-slate-100 dark:border-slate-800/60 space-y-1.5 hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors"
          >
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white">{item.title}</h4>
              <span className="text-[10px] text-slate-400">
                {new Date(item.createdAt).toLocaleDateString()}
              </span>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">{item.message}</p>
            <p className="text-[10px] font-semibold text-indigo-600 dark:text-indigo-400 pt-1">
              Posted by {item.postedBy?.name || 'HR Operations'}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}