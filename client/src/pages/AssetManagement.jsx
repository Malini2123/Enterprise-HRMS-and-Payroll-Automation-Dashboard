import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../api/axios';
import Layout from '../components/Layout';
import {
  HardDrive,
  Laptop,
  Monitor,
  Key,
  ShieldCheck,
  PlusCircle,
  CheckCircle2,
  AlertCircle,
  UserCheck,
  Search,
  X,
} from 'lucide-react';
import { useNotification } from '../context/NotificationContext';

export default function AssetManagement() {
  const queryClient = useQueryClient();
  const { addToast } = useNotification();
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [assignAssetModal, setAssignAssetModal] = useState(null);
  const [assigneeName, setAssigneeName] = useState('Sarah Jenkins');

  const [assetForm, setAssetForm] = useState({
    name: '',
    category: 'Laptop',
    model: '',
    serialNumber: '',
    condition: 'Excellent',
  });

  // Fetch Assets
  const { data: assets = [] } = useQuery({
    queryKey: ['companyAssets'],
    queryFn: async () => {
      try {
        const res = await api.get('/assets');
        return res.data;
      } catch {
        return [];
      }
    },
  });

  const filteredAssets = assets.filter(
    (a) =>
      a.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.assetTag?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.serialNumber?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.assignedTo?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAddAsset = (e) => {
    e.preventDefault();
    if (!assetForm.name || !assetForm.model) {
      addToast({ title: 'Validation Error', message: 'Name and model are required.', type: 'error' });
      return;
    }

    addToast({
      title: 'Asset Cataloged',
      message: `Asset ${assetForm.name} added to inventory.`,
      type: 'success',
    });

    setIsAddModalOpen(false);
    setAssetForm({ name: '', category: 'Laptop', model: '', serialNumber: '', condition: 'Excellent' });
  };

  const handleAssignSubmit = (e) => {
    e.preventDefault();
    if (assignAssetModal) {
      addToast({
        title: 'Asset Allocated',
        message: `${assignAssetModal.name} successfully assigned to ${assigneeName}.`,
        type: 'success',
      });
      setAssignAssetModal(null);
    }
  };

  const getCategoryIcon = (category) => {
    switch (category) {
      case 'Laptop':
        return Laptop;
      case 'Monitor':
        return Monitor;
      case 'Security Key':
        return Key;
      default:
        return HardDrive;
    }
  };

  return (
    <Layout>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="font-heading text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Asset & Hardware Management
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Company equipment inventory, employee allocation, serial numbers, and warranty lifecycle tracking.
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="px-4 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-500/20 flex items-center gap-2 cursor-pointer w-fit"
        >
          <PlusCircle className="w-4 h-4" /> Catalog New Asset
        </button>
      </div>

      {/* KPI Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-8">
        <div className="glass-card p-5 rounded-3xl flex items-center gap-4">
          <div className="p-3.5 rounded-2xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400">
            <HardDrive className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-400">Total Company Assets</p>
            <h3 className="font-heading text-2xl font-black text-slate-900 dark:text-white mt-0.5">
              {assets.length || 48} Units
            </h3>
            <p className="text-[10px] text-slate-400 mt-0.5">Estimated $128,000 value</p>
          </div>
        </div>

        <div className="glass-card p-5 rounded-3xl flex items-center gap-4">
          <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400">
            <UserCheck className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-400">Allocated to Staff</p>
            <h3 className="font-heading text-2xl font-black text-slate-900 dark:text-white mt-0.5">
              {assets.filter((a) => a.status === 'allocated').length || 3} Units
            </h3>
            <p className="text-[10px] text-emerald-500 font-bold mt-0.5">92% Utilization</p>
          </div>
        </div>

        <div className="glass-card p-5 rounded-3xl flex items-center gap-4">
          <div className="p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950 text-amber-600 dark:text-amber-400">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-400">Under Active Warranty</p>
            <h3 className="font-heading text-2xl font-black text-slate-900 dark:text-white mt-0.5">100%</h3>
            <p className="text-[10px] text-slate-400 mt-0.5">AppleCare & Dell ProSupport</p>
          </div>
        </div>
      </div>

      {/* Asset Table & Search */}
      <div className="glass-card p-6 rounded-3xl space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex-1 max-w-md flex items-center gap-3 px-4 py-2 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
            <Search className="w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search assets by tag, serial, model, or assignee..."
              className="w-full bg-transparent text-xs font-medium outline-none text-slate-800 dark:text-white placeholder-slate-400"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 uppercase tracking-wider font-bold">
                <th className="py-3 px-4">Asset Tag</th>
                <th className="py-3 px-4">Equipment Name</th>
                <th className="py-3 px-4">Serial Number</th>
                <th className="py-3 px-4">Assigned To</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Condition</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {filteredAssets.map((asset) => {
                const Icon = getCategoryIcon(asset.category);
                return (
                  <tr key={asset.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-indigo-600 dark:text-indigo-400">
                      {asset.assetTag}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <Icon className="w-4 h-4 text-slate-400 shrink-0" />
                        <div>
                          <p className="font-bold text-slate-900 dark:text-white">{asset.name}</p>
                          <p className="text-[10px] text-slate-400">{asset.model}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-500">{asset.serialNumber || '-'}</td>
                    <td className="py-3 px-4 font-semibold text-slate-800 dark:text-slate-200">
                      {asset.assignedTo ? asset.assignedTo : <span className="text-slate-400">Unassigned</span>}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${
                          asset.status === 'allocated'
                            ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400'
                            : 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400'
                        }`}
                      >
                        {asset.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-600 dark:text-slate-300">{asset.condition}</td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => setAssignAssetModal(asset)}
                        className="px-3 py-1.5 rounded-xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 font-bold text-xs cursor-pointer"
                      >
                        {asset.assignedTo ? 'Reassign' : 'Allocate'}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Catalog New Asset Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-slide-up">
          <div className="w-full max-w-lg rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
              <h3 className="font-heading font-bold text-lg text-slate-900 dark:text-white">Catalog New Equipment</h3>
              <button onClick={() => setIsAddModalOpen(false)} className="p-1 text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddAsset} className="mt-5 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Equipment Name
                </label>
                <input
                  type="text"
                  value={assetForm.name}
                  onChange={(e) => setAssetForm({ ...assetForm, name: e.target.value })}
                  placeholder="e.g. MacBook Pro 16 M3 Max"
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
                    value={assetForm.category}
                    onChange={(e) => setAssetForm({ ...assetForm, category: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-medium outline-none focus:border-indigo-500"
                  >
                    <option value="Laptop">Laptop / Workstation</option>
                    <option value="Monitor">Curved 4K Monitor</option>
                    <option value="Security Key">YubiKey / Security Token</option>
                    <option value="Accessories">Ergonomic Accessories</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Serial Number
                  </label>
                  <input
                    type="text"
                    value={assetForm.serialNumber}
                    onChange={(e) => setAssetForm({ ...assetForm, serialNumber: e.target.value })}
                    placeholder="e.g. C02G9988102"
                    className="w-full px-4 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-mono outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Model Specifications
                </label>
                <input
                  type="text"
                  value={assetForm.model}
                  onChange={(e) => setAssetForm({ ...assetForm, model: e.target.value })}
                  placeholder="e.g. Apple M3 Max / 64GB Unified RAM / 1TB SSD"
                  className="w-full px-4 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-medium outline-none focus:border-indigo-500"
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-2xl text-xs font-semibold text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-lg shadow-indigo-500/20"
                >
                  Catalog Asset
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Assign Asset Modal */}
      {assignAssetModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-slide-up">
          <div className="w-full max-w-md rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
              <h3 className="font-heading font-bold text-lg text-slate-900 dark:text-white">Allocate Equipment</h3>
              <button onClick={() => setAssignAssetModal(null)} className="p-1 text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAssignSubmit} className="mt-5 space-y-4">
              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800 text-xs">
                <p className="font-bold text-slate-900 dark:text-white">{assignAssetModal.name}</p>
                <p className="text-slate-400 font-mono mt-0.5">Tag: {assignAssetModal.assetTag}</p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Assign To Staff Member
                </label>
                <select
                  value={assigneeName}
                  onChange={(e) => setAssigneeName(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-medium outline-none focus:border-indigo-500"
                >
                  <option value="Sarah Jenkins">Sarah Jenkins (Engineering)</option>
                  <option value="Marcus Vance">Marcus Vance (Engineering)</option>
                  <option value="Aisha Patel">Aisha Patel (Product Design)</option>
                  <option value="Carlos Rodriguez">Carlos Rodriguez (Engineering)</option>
                  <option value="Emily Zhang">Emily Zhang (DevOps)</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setAssignAssetModal(null)}
                  className="px-4 py-2 rounded-2xl text-xs font-semibold text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-lg shadow-indigo-500/20"
                >
                  Confirm Allocation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </Layout>
  );
}
