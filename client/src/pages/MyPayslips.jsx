import { useQuery } from '@tanstack/react-query';
import api from '../api/axios';
import DataTable from '../components/DataTable';
import Layout from '../components/Layout';

function MyPayslips() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['myPayroll'],
    queryFn: async () => {
      const res = await api.get('/payroll/my');
      return res.data;
    },
  });

  const downloadPayslip = async (payrollId) => {
    try {
      const response = await api.get(`/payroll/${payrollId}/payslip`, { responseType: 'blob' });
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
    { key: 'month', label: 'Month' },
    { key: 'year', label: 'Year' },
    { key: 'netSalary', label: 'Net Salary', render: (row) => `Rs. ${row.netSalary.toLocaleString()}` },
    {
      key: 'action',
      label: '',
      render: (row) => (
        <button
          onClick={() => downloadPayslip(row._id)}
          className="bg-indigo-600 text-white px-3 py-1.5 rounded-md text-xs font-medium hover:bg-indigo-700"
        >
          Download
        </button>
      ),
    },
  ];

  return (
    <Layout>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">My Payslips</h1>
        <p className="text-gray-500 mt-1">Download your monthly payroll statements</p>
      </div>
      <DataTable
        columns={columns}
        data={data}
        loading={isLoading}
        error={error?.response?.data?.message || error?.message}
      />
    </Layout>
  );
}

export default MyPayslips;