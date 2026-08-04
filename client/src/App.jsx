import { Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import OnboardEmployee from './pages/OnboardEmployee';
import RequestLeave from './pages/RequestLeave';
import LeaveApprovals from './pages/LeaveApprovals';
import ProtectedRoute from './components/ProtectedRoute';
import MyPayslips from './pages/MyPayslips';
import DocumentVault from './pages/DocumentVault';

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
      <Route path="/onboard" element={<ProtectedRoute><OnboardEmployee /></ProtectedRoute>} />
      <Route path="/request-leave" element={<ProtectedRoute><RequestLeave /></ProtectedRoute>} />
      <Route path="/leave-approvals" element={<ProtectedRoute><LeaveApprovals /></ProtectedRoute>} />
      <Route path="/" element={<Navigate to="/login" />} />
      <Route path="/my-payslips" element={<ProtectedRoute><MyPayslips /></ProtectedRoute>} />
      <Route path="/documents" element={<ProtectedRoute><DocumentVault /></ProtectedRoute>} />
    </Routes>
  );
}

export default App;