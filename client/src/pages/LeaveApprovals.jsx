import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import DataTable from '../components/DataTable';

function LeaveApprovals() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data, isLoading, error } = useQuery({
    queryKey: ['pendingLeaves'],
    queryFn: async () => {
      const res = await api.get('/leaves/pending');
      return res.data;
    },
  });

  const mutation = useMutation({
    mutationFn: async ({ id, status }) => {
      const res = await api.patch(`/leaves/${id}`, { status });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pendingLeaves'] });
    },
  });

  const columns = [
    { key: 'name', label: 'Employee', render: (row) => row.employeeInfo?.name },
    { key: 'leaveType', label: 'Type' },
    {
      key: 'startDate',
      label: 'Start',
      render: (row) => new Date(row.startDate).toLocaleDateString(),
    },
    {
      key: 'endDate',
      label: 'End',
      render: (row) => new Date(row.endDate).toLocaleDateString(),
    },
    { key: 'reason', label: 'Reason' },
    {
      key: 'actions',
      label: 'Actions',
      render: (row) => (
        <div className="flex gap-2">
          <button
            onClick={() => mutation.mutate({ id: row._id, status: 'approved' })}
            className="bg-green-600 text-white px-3 py-1 rounded text-xs hover:bg-green-700"
          >
            Approve
          </button>
          <button
            onClick={() => mutation.mutate({ id: row._id, status: 'rejected' })}
            className="bg-red-600 text-white px-3 py-1 rounded text-xs hover:bg-red-700"
          >
            Reject
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Pending Leave Approvals</h1>
        <button
          onClick={() => navigate('/dashboard')}
          className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
        >
          Back to Dashboard
        </button>
      </div>

      <DataTable
        columns={columns}
        data={data}
        loading={isLoading}
        error={error?.response?.data?.message || error?.message}
      />
    </div>
  );
}

export default LeaveApprovals;