import { useQuery } from '@tanstack/react-query';
import api from '../api/axios';
import DataTable from '../components/DataTable';
import Layout from '../components/Layout';

function Dashboard() {
  const user = JSON.parse(localStorage.getItem('user'));

  const { data, isLoading, error } = useQuery({
    queryKey: ['employees'],
    queryFn: async () => {
      const res = await api.get('/employees');
      return res.data;
    },
  });

  const downloadPayslip = async (payrollId) => {
    try {
      const response = await api.get(`/payroll/${payrollId}/payslip`, {
        responseType: 'blob',
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'payslip.pdf');
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      alert('Failed to download payslip');
    }
  };

  const columns = [
    { key: 'name', label: 'Name' },
    { key: 'email', label: 'Email' },
    {
      key: 'department',
      label: 'Department',
      render: (row) => row.departmentInfo?.name || '-',
    },
    {
      key: 'manager',
      label: 'Manager',
      render: (row) => row.managerInfo?.name || '-',
    },
  ];

  return (
    <Layout>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">
          Welcome back, {user?.name || 'User'}
        </h1>
        <p className="text-gray-500 mt-1 capitalize">{user?.role?.replace('_', ' ')}</p>
      </div>

      <h2 className="text-lg font-semibold text-gray-800 mb-3">Employees</h2>
      <DataTable
        columns={columns}
        data={data}
        loading={isLoading}
        error={error?.response?.data?.message || error?.message}
      />

      <div className="mt-6">
        <button
          onClick={() => downloadPayslip('6a56598b03c90f039d449bb8')}
          className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition"
        >
          Download Test Payslip
        </button>
      </div>
    </Layout>
  );
}

export default Dashboard;