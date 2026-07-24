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
      </div>

      <h2 className="text-lg font-semibold text-gray-700 mb-3">Employees</h2>
      <DataTable
        columns={columns}
        data={data}
        loading={isLoading}
        error={error?.response?.data?.message || error?.message}
      />
    </div>
  );
}

export default Dashboard;