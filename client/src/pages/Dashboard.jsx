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

function WelcomeHeader({ name, subtitle }) {
  return (
    <div className="relative overflow-hidden rounded-2xl bg-linear-to-br from-[#6C5CE7] via-[#8B5CF6] to-[#FF6B4A] px-8 py-7 mb-8 shadow-lg shadow-[#6C5CE7]/20">
      <div
        className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/10"
        aria-hidden="true"
      />
      <div
        className="absolute right-16 bottom-0 h-24 w-24 rounded-full bg-white/10"
        aria-hidden="true"
      />
      <div className="relative z-10">
        <h1 className="font-['Space_Grotesk'] text-2xl font-bold text-white">
          Welcome back, {name}
        </h1>
        <p className="text-white/80 mt-1">{subtitle}</p>
      </div>
    </div>
  );
}

function SectionLabel({ children }) {
  return (
    <h2 className="font-['Space_Grotesk'] text-lg font-semibold text-[#14132B] mb-3 flex items-center gap-2">
      <span className="h-4 w-1 rounded-full bg-[#6C5CE7]" />
      {children}
    </h2>
  );
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
      <WelcomeHeader name={user?.name} subtitle="HR Manager Dashboard" />
      <SectionLabel>Employees</SectionLabel>
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
          className={`px-2.5 py-1 rounded-full text-xs font-medium ${
            row.status === 'approved'
              ? 'bg-[#E6FBF5] text-[#00966F]'
              : row.status === 'rejected'
              ? 'bg-[#FFF0ED] text-[#C0442B]'
              : 'bg-[#FFF7E0] text-[#B8860B]'
          }`}
        >
          {row.status}
        </span>
      ),
    },
  ];

  return (
    <Layout>
      <WelcomeHeader name={user?.name} subtitle="Employee Dashboard" />
      <SectionLabel>My Leave Requests</SectionLabel>
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