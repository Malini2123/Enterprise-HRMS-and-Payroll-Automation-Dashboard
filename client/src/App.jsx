import { Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import OnboardEmployee from './pages/OnboardEmployee';
import RequestLeave from './pages/RequestLeave';
import LeaveApprovals from './pages/LeaveApprovals';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
      <Route path="/onboard" element={<ProtectedRoute><OnboardEmployee /></ProtectedRoute>} />
      <Route path="/request-leave" element={<ProtectedRoute><RequestLeave /></ProtectedRoute>} />
      <Route path="/leave-approvals" element={<ProtectedRoute><LeaveApprovals /></ProtectedRoute>} />
      <Route path="/" element={<Navigate to="/login" />} />
    </Routes>
  );
}

export default App;