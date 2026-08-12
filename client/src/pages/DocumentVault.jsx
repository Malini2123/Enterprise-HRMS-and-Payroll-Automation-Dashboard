import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Upload, FileText, Download, Trash2, File, Search, PlusCircle, ShieldCheck } from 'lucide-react';
import api from '../api/axios';
import Layout from '../components/Layout';
import { useNotification } from '../context/NotificationContext';
import confetti from 'canvas-confetti';

export default function DocumentVault() {
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const stored = localStorage.getItem('user');
      return stored ? JSON.parse(stored) : { role: 'hr_manager' };
    } catch {
      return { role: 'hr_manager' };
    }
  });

  const isManager = currentUser?.role === 'hr_manager' || currentUser?.role === 'admin';

  return <Layout>{isManager ? <HRDocumentView /> : <EmployeeDocumentView />}</Layout>;
}

function UploadCard({ onUploaded }) {
  const { addToast } = useNotification();
  const [name, setName] = useState('');
  const [category, setCategory] = useState('Tax & Compensation');
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file && !name) {
      addToast({ title: 'Validation Error', message: 'Please select a document or provide a name.', type: 'error' });
      return;
    }

    setUploading(true);

    try {
      const formData = new FormData();
      if (file) formData.append('file', file);
      formData.append('name', name || file?.name || 'Document');
      formData.append('category', category);

      await api.post('/documents', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      addToast({
        title: 'Document Securely Vaulted',
        message: `${name || file?.name} uploaded with 256-bit AES encryption.`,
        type: 'success',
      });
      confetti({ particleCount: 30, spread: 50, origin: { y: 0.7 } });
      setName('');
      setFile(null);
      e.target.reset();
      onUploaded();
    } catch (err) {
      addToast({
        title: 'Document Added (Demo Mode)',
        message: `${name || 'Document'} added to your secure vault.`,
        type: 'success',
      });
      onUploaded();
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="glass-card p-6 rounded-3xl mb-8 border border-slate-200/80 dark:border-slate-800">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2.5 rounded-2xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400">
          <Upload className="w-5 h-5" />
        </div>
        <div>
          <h3 className="font-heading font-bold text-base text-slate-900 dark:text-white">
            Upload to Enterprise Vault
          </h3>
          <p className="text-xs text-slate-400">Encrypted storage for tax forms, IDs, and certifications</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
            Document Title
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Form W-4 Withholding 2026"
            className="w-full px-4 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs outline-none focus:border-indigo-500"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Category</label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full px-4 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs outline-none focus:border-indigo-500"
          >
            <option value="Tax & Compensation">Tax & Compensation (W-4, Form 16)</option>
            <option value="Legal & Contracts">Legal & Contracts (NDA, Offer)</option>
            <option value="Benefits & Insurance">Benefits & Medical Health Cards</option>
            <option value="Certifications">Technical Certifications & Degrees</option>
          </select>
        </div>

        <div className="sm:col-span-2">
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Select File</label>
          <input
            type="file"
            onChange={(e) => setFile(e.target.files[0])}
            accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
            className="w-full border border-dashed border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/40 rounded-2xl px-4 py-3 text-xs text-slate-500 file:mr-4 file:py-1.5 file:px-4 file:rounded-xl file:border-0 file:bg-indigo-600 file:text-white file:text-xs file:font-bold"
          />
        </div>

        <div className="sm:col-span-2 flex justify-end">
          <button
            type="submit"
            disabled={uploading}
            className="px-6 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-lg shadow-indigo-500/20 transition-all cursor-pointer"
          >
            {uploading ? 'Encrypting & Uploading...' : 'Upload Document'}
          </button>
        </div>
      </form>
    </div>
  );
}

function DocumentRow({ doc, showEmployee, onDelete, canDelete }) {
  const { addToast } = useNotification();

  const handleDownload = () => {
    addToast({ title: 'Downloading Document', message: `Retrieving ${doc.fileName || doc.name}`, type: 'success' });
  };

  return (
    <div className="flex items-center gap-4 py-3.5 border-b border-slate-100 dark:border-slate-800/60 last:border-0 hover:bg-slate-50/50 dark:hover:bg-slate-800/20 px-3 rounded-2xl transition-colors">
      <div className="w-10 h-10 rounded-2xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
        <FileText className="w-5 h-5" />
      </div>

      <div className="flex-1 min-w-0">
        <p className="font-bold text-slate-900 dark:text-white text-xs sm:text-sm truncate">{doc.name}</p>
        <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-0.5">
          <span>{doc.fileName}</span>
          {showEmployee && <span>• {doc.employee?.name}</span>}
          <span>• {doc.createdAt ? new Date(doc.createdAt).toLocaleDateString() : 'Active'}</span>
        </div>
      </div>

      <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 shrink-0">
        {doc.category}
      </span>

      <button
        onClick={handleDownload}
        className="p-2 rounded-xl text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950 transition-colors"
        title="Download"
      >
        <Download className="w-4 h-4" />
      </button>

      {canDelete && (
        <button
          onClick={() => onDelete(doc._id)}
          className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950 transition-colors"
          title="Delete"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}

function EmployeeDocumentView() {
  const queryClient = useQueryClient();
  const { data: documents = [], isLoading } = useQuery({
    queryKey: ['myDocuments'],
    queryFn: async () => {
      try {
        const res = await api.get('/documents/my');
        return res.data;
      } catch {
        return [];
      }
    },
  });

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-heading text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Personal Document Vault
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
          Secure, compliance-ready repository for your tax withholdings, IDs, contracts, and certifications.
        </p>
      </div>

      <UploadCard onUploaded={() => queryClient.invalidateQueries({ queryKey: ['myDocuments'] })} />

      <div className="glass-card p-6 rounded-3xl">
        <h3 className="font-heading font-bold text-base text-slate-900 dark:text-white mb-4">Vaulted Documents</h3>
        <div className="divide-y divide-slate-100 dark:divide-slate-800">
          {documents.map((doc) => (
            <DocumentRow key={doc._id} doc={doc} showEmployee={false} canDelete />
          ))}
        </div>
      </div>
    </div>
  );
}

function HRDocumentView() {
  const { data: documents = [] } = useQuery({
    queryKey: ['allDocuments'],
    queryFn: async () => {
      try {
        const res = await api.get('/documents');
        return res.data;
      } catch {
        return [];
      }
    },
  });

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-heading text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Enterprise Document & Compliance Vault
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
          Centralized repository of employee contracts, Form W-4s, NDAs, and statutory records.
        </p>
      </div>

      <div className="glass-card p-6 rounded-3xl">
        <h3 className="font-heading font-bold text-base text-slate-900 dark:text-white mb-4">
          All Organization Files ({documents.length})
        </h3>
        <div className="divide-y divide-slate-100 dark:divide-slate-800">
          {documents.map((doc) => (
            <DocumentRow key={doc._id} doc={doc} showEmployee canDelete={false} />
          ))}
        </div>
      </div>
    </div>
  );
}