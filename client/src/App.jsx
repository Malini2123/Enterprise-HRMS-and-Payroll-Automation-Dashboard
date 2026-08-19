import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { NotificationProvider } from './context/NotificationContext';

import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import AttendanceTracker from './pages/AttendanceTracker';
import PayrollAutomation from './pages/PayrollAutomation';
import PerformanceOKRs from './pages/PerformanceOKRs';
import OrgChartDirectory from './pages/OrgChartDirectory';
import RecruitmentATS from './pages/RecruitmentATS';
import OnboardEmployee from './pages/OnboardEmployee';
import RequestLeave from './pages/RequestLeave';
import LeaveApprovals from './pages/LeaveApprovals';
import MyPayslips from './pages/MyPayslips';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <ThemeProvider>
      <NotificationProvider>
        <Routes>
          {/* Public Authentication Route */}
          <Route path="/login" element={<Login />} />

          {/* Universal Role-Gated Dashboard */}
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />

          {/* Work & Attendance */}
          <Route path="/attendance" element={<ProtectedRoute><AttendanceTracker /></ProtectedRoute>} />
          <Route path="/request-leave" element={<ProtectedRoute><RequestLeave /></ProtectedRoute>} />
          <Route path="/leave-approvals" element={<ProtectedRoute allowedRoles={['hr_manager', 'admin']}><LeaveApprovals /></ProtectedRoute>} />

          {/* Payroll & Compensation */}
          <Route path="/payroll" element={<ProtectedRoute allowedRoles={['hr_manager', 'admin', 'finance_lead']}><PayrollAutomation /></ProtectedRoute>} />
          <Route path="/my-payslips" element={<ProtectedRoute><MyPayslips /></ProtectedRoute>} />

          {/* Talent, Team & Organization */}
          <Route path="/org-chart" element={<ProtectedRoute><OrgChartDirectory /></ProtectedRoute>} />
          <Route path="/performance" element={<ProtectedRoute><PerformanceOKRs /></ProtectedRoute>} />
          <Route path="/recruitment" element={<ProtectedRoute allowedRoles={['hr_manager', 'admin']}><RecruitmentATS /></ProtectedRoute>} />
          <Route path="/onboard" element={<ProtectedRoute allowedRoles={['hr_manager', 'admin']}><OnboardEmployee /></ProtectedRoute>} />

          {/* Fallback Redirects */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </NotificationProvider>
    </ThemeProvider>
  );
}

export default App;