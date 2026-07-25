import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import api from '../api/axios';
import DataTable from '../components/DataTable';

function Dashboard() {
  const user = JSON.parse(localStorage.getItem('user'));
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

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
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">
            Welcome, {user?.name || 'User'}!
          </h1>
          <p className="text-gray-600 mt-1">Role: {user?.role}</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => navigate('/request-leave')}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition"
          >
            Request Leave
          </button>
          <button
            onClick={() => navigate('/leave-approvals')}
            className="bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700 transition"
          >
            Leave Approvals
          </button>
          <button
            onClick={() => navigate('/onboard')}
            className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition"
          >
            + Onboard Employee
          </button>
          <button
            onClick={handleLogout}
            className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition"
          >
            Logout
          </button>
        </div>
      </div>

      <h2 className="text-lg font-semibold text-gray-700 mb-3">Employees</h2>
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
    </div>
  );
}

export default Dashboard;