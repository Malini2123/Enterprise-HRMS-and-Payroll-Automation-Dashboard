import { useQuery } from '@tanstack/react-query';
import api from '../api/axios';
import DataTable from '../components/DataTable';
import Layout from '../components/Layout';

function Dashboard() {
  const user = JSON.parse(localStorage.getItem('user'));
  const isManager = user?.role === 'hr_manager' || user?.role === 'admin';

  if (isManager) {
    return <ManagerDashboard user={user} />;
  }
  return <EmployeeDashboard user={user} />;
}

function ManagerDashboard({ user }) {
  const { data, isLoading, error } = useQuery({
    queryKey: ['employees'],
    queryFn: async () => {
      const res = await api.get('/employees');
      return res.data;
    },
  });

  const columns = [
    { key: 'name', label: 'Name' },
    { key: 'email', label: 'Email' },
    { key: 'department', label: 'Department', render: (row) => row.departmentInfo?.name || '-' },
    { key: 'manager', label: 'Manager', render: (row) => row.managerInfo?.name || '-' },
  ];

  return (
    <Layout>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Welcome back, {user?.name}</h1>
        <p className="text-gray-500 mt-1">HR Manager Dashboard</p>
      </div>
      <h2 className="text-lg font-semibold text-gray-800 mb-3">Employees</h2>
      <DataTable
        columns={columns}
        data={data}
        loading={isLoading}
        error={error?.response?.data?.message || error?.message}
      />
    </Layout>
  );
}

function EmployeeDashboard({ user }) {
  const { data: leaves, isLoading, error } = useQuery({
    queryKey: ['myLeaves'],
    queryFn: async () => {
      const res = await api.get('/leaves/my');
      return res.data;
    },
  });

  const columns = [
    { key: 'leaveType', label: 'Type' },
    { key: 'startDate', label: 'Start', render: (row) => new Date(row.startDate).toLocaleDateString() },
    { key: 'endDate', label: 'End', render: (row) => new Date(row.endDate).toLocaleDateString() },
    {
      key: 'status',
      label: 'Status',
      render: (row) => (
        <span
          className={`px-2 py-1 rounded-full text-xs font-medium ${
            row.status === 'approved'
              ? 'bg-green-100 text-green-700'
              : row.status === 'rejected'
              ? 'bg-red-100 text-red-700'
              : 'bg-yellow-100 text-yellow-700'
          }`}
        >
          {row.status}
        </span>
      ),
    },
  ];

  return (
    <Layout>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Welcome back, {user?.name}</h1>
        <p className="text-gray-500 mt-1">Employee Dashboard</p>
      </div>
      <h2 className="text-lg font-semibold text-gray-800 mb-3">My Leave Requests</h2>
      <DataTable
        columns={columns}
        data={leaves}
        loading={isLoading}
        error={error?.response?.data?.message || error?.message}
      />
    </Layout>
  );
}

export default Dashboard;