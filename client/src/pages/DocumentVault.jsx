import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Upload, FileText, Download, Trash2, File } from 'lucide-react';
import api from '../api/axios';
import Layout from '../components/Layout';

const CATEGORY_LABELS = {
  offer_letter: 'Offer Letter',
  id_proof: 'ID Proof',
  certificate: 'Certificate',
  other: 'Other',
};

const CATEGORY_STYLES = {
  offer_letter: 'bg-[#F0EBFA] text-[#A594D1]',
  id_proof: 'bg-[#EAF3EA] text-[#6B8F6B]',
  certificate: 'bg-[#FBF1E1] text-[#C09A52]',
  other: 'bg-[#F3F1EE] text-[#8B8698]',
};

function DocumentVault() {
  const user = JSON.parse(localStorage.getItem('user'));
  const isManager = user?.role === 'hr_manager' || user?.role === 'admin';

  return <Layout>{isManager ? <HRDocumentView /> : <EmployeeDocumentView />}</Layout>;
}

function UploadCard({ onUploaded }) {
  const [name, setName] = useState('');
  const [category, setCategory] = useState('other');
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      setError('Please choose a file');
      return;
    }
    setError('');
    setUploading(true);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('name', name || file.name);
      formData.append('category', category);

      await api.post('/documents', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      setName('');
      setCategory('other');
      setFile(null);
      e.target.reset();
      onUploaded();
    } catch (err) {
      setError(err.response?.data?.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.06)] border border-[#EDE8F5] p-6 mb-8">
      <div className="flex items-center gap-3 mb-5">
        <div className="w-10 h-10 rounded-2xl bg-[#F0EBFA] flex items-center justify-center">
          <Upload size={18} className="text-[#A594D1]" />
        </div>
        <h2 className="font-['Poppins'] text-lg font-semibold text-[#4A4458]">
          Upload a document
        </h2>
      </div>

      {error && (
        <div className="bg-[#FAEBEA] text-[#C97F76] text-sm px-4 py-2.5 rounded-2xl mb-4">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="block text-sm font-medium text-[#4A4458] mb-1.5">
            Document name
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Passport copy"
            className="w-full border border-[#EDE8F5] bg-[#FAF7F2] rounded-2xl px-4 py-2.5 text-[#4A4458] placeholder:text-[#B5B0C2] focus:outline-none focus:ring-2 focus:ring-[#A594D1]/40 focus:bg-white transition"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-[#4A4458] mb-1.5">
            Category
          </label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full border border-[#EDE8F5] bg-[#FAF7F2] rounded-2xl px-4 py-2.5 text-[#4A4458] focus:outline-none focus:ring-2 focus:ring-[#A594D1]/40 focus:bg-white transition"
          >
            <option value="offer_letter">Offer Letter</option>
            <option value="id_proof">ID Proof</option>
            <option value="certificate">Certificate</option>
            <option value="other">Other</option>
          </select>
        </div>

        <div className="sm:col-span-2">
          <label className="block text-sm font-medium text-[#4A4458] mb-1.5">
            File
          </label>
          <input
            type="file"
            onChange={(e) => setFile(e.target.files[0])}
            accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
            className="w-full border border-dashed border-[#D8D2E8] bg-[#FAF7F2] rounded-2xl px-4 py-3 text-sm text-[#8B8698] file:mr-4 file:py-1.5 file:px-4 file:rounded-full file:border-0 file:bg-[#A594D1] file:text-white file:text-sm file:font-medium"
          />
        </div>

        <div className="sm:col-span-2">
          <button
            type="submit"
            disabled={uploading}
            className="bg-[#A594D1] text-white font-medium px-6 py-2.5 rounded-2xl hover:bg-[#9482C4] transition disabled:opacity-50"
          >
            {uploading ? 'Uploading…' : 'Upload document'}
          </button>
        </div>
      </form>
    </div>
  );
}

function DocumentRow({ doc, showEmployee, onDelete, canDelete }) {
  const handleDownload = async () => {
    const res = await api.get(`/documents/${doc._id}/download`, { responseType: 'blob' });
    const url = window.URL.createObjectURL(new Blob([res.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', doc.fileName);
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  return (
    <div className="flex items-center gap-4 py-4 border-b border-[#EDE8F5] last:border-0">
      <div className="w-10 h-10 rounded-2xl bg-[#F0EBFA] flex items-center justify-center shrink-0">
        <File size={18} className="text-[#A594D1]" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-medium text-[#4A4458] text-sm truncate">{doc.name}</p>
        {showEmployee && (
          <p className="text-xs text-[#8B8698] truncate">{doc.employee?.name}</p>
        )}
      </div>
      <span
        className={`px-2.5 py-1 rounded-full text-xs font-medium shrink-0 ${CATEGORY_STYLES[doc.category]}`}
      >
        {CATEGORY_LABELS[doc.category]}
      </span>
      <button
        onClick={handleDownload}
        className="w-9 h-9 rounded-xl flex items-center justify-center text-[#8B8698] hover:bg-[#F0EBFA] hover:text-[#A594D1] transition shrink-0"
        title="Download"
      >
        <Download size={16} />
      </button>
      {canDelete && (
        <button
          onClick={() => onDelete(doc._id)}
          className="w-9 h-9 rounded-xl flex items-center justify-center text-[#8B8698] hover:bg-[#FAEBEA] hover:text-[#C97F76] transition shrink-0"
          title="Delete"
        >
          <Trash2 size={16} />
        </button>
      )}
    </div>
  );
}

function EmployeeDocumentView() {
  const queryClient = useQueryClient();

  const { data: documents, isLoading } = useQuery({
    queryKey: ['myDocuments'],
    queryFn: async () => {
      const res = await api.get('/documents/my');
      return res.data;
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => api.delete(`/documents/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['myDocuments'] }),
  });

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-['Poppins'] text-2xl font-semibold text-[#4A4458]">
          Document Vault
        </h1>
        <p className="text-[#8B8698] mt-1">Upload and manage your personal documents</p>
      </div>

      <UploadCard onUploaded={() => queryClient.invalidateQueries({ queryKey: ['myDocuments'] })} />

      <div className="bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.06)] border border-[#EDE8F5] p-6">
        <h2 className="font-['Poppins'] font-semibold text-[#4A4458] mb-2">My documents</h2>
        {isLoading && <p className="text-[#8B8698] text-sm py-4">Loading…</p>}
        {!isLoading && (!documents || documents.length === 0) && (
          <p className="text-[#8B8698] text-sm py-4">No documents uploaded yet.</p>
        )}
        {documents?.map((doc) => (
          <DocumentRow
            key={doc._id}
            doc={doc}
            showEmployee={false}
            canDelete
            onDelete={(id) => deleteMutation.mutate(id)}
          />
        ))}
      </div>
    </div>
  );
}

function HRDocumentView() {
  const { data: documents, isLoading } = useQuery({
    queryKey: ['allDocuments'],
    queryFn: async () => {
      const res = await api.get('/documents');
      return res.data;
    },
  });

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-['Poppins'] text-2xl font-semibold text-[#4A4458]">
          Document Vault
        </h1>
        <p className="text-[#8B8698] mt-1">All employee documents</p>
      </div>

      <div className="bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.06)] border border-[#EDE8F5] p-6">
        {isLoading && <p className="text-[#8B8698] text-sm py-4">Loading…</p>}
        {!isLoading && (!documents || documents.length === 0) && (
          <p className="text-[#8B8698] text-sm py-4">No documents uploaded yet.</p>
        )}
        {documents?.map((doc) => (
          <DocumentRow key={doc._id} doc={doc} showEmployee canDelete={false} />
        ))}
      </div>
    </div>
  );
}

export default DocumentVault;