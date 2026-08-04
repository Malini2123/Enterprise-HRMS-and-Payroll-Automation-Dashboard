import { useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  CalendarClock,
  ClipboardCheck,
  UserPlus,
  LogOut,
  FileText,
  FolderOpen,
} from 'lucide-react';

function Layout({ children }) {
  const navigate = useNavigate();
  const location = useLocation();
  const user = JSON.parse(localStorage.getItem('user'));

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const isManager = user?.role === 'hr_manager' || user?.role === 'admin';

  const navItems = isManager
    ? [
        { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
        { label: 'Leave Approvals', path: '/leave-approvals', icon: ClipboardCheck },
        { label: 'Onboard Employee', path: '/onboard', icon: UserPlus },
        { label: 'Document Vault', path: '/documents', icon: FolderOpen },
      ]
    : [
        { label: 'My Dashboard', path: '/dashboard', icon: LayoutDashboard },
        { label: 'Request Leave', path: '/request-leave', icon: CalendarClock },
        { label: 'My Payslips', path: '/my-payslips', icon: FileText },
        { label: 'Document Vault', path: '/documents', icon: FolderOpen },
      ];

  return (
    <div className="min-h-screen flex bg-[#FAF7F2]">
      {/* Sidebar */}
      <aside className="w-64 bg-white text-[#4A4458] flex flex-col fixed h-full border-r border-[#EDE8F5]">
        <div className="px-6 py-6 border-b border-[#EDE8F5]">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-[#F0EBFA] flex items-center justify-center font-semibold text-sm text-[#A594D1]">
              H
            </div>
            <span className="font-['Poppins'] font-semibold text-lg tracking-tight">
              HRMS
            </span>
          </div>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-2xl text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-[#F0EBFA] text-[#A594D1]'
                    : 'text-[#8B8698] hover:bg-[#FAF7F2] hover:text-[#4A4458]'
                }`}
              >
                <Icon size={18} />
                {item.label}
              </button>
            );
          })}
        </nav>

        <div className="px-3 py-4 border-t border-[#EDE8F5]">
          <div className="flex items-center gap-3 px-3 py-2 mb-2">
            <div className="w-8 h-8 rounded-full bg-[#F0EBFA] flex items-center justify-center text-xs font-semibold text-[#A594D1]">
              {user?.name?.charAt(0) || 'U'}
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-medium truncate">{user?.name}</p>
              <p className="text-xs text-[#8B8698] capitalize truncate">
                {user?.role?.replace('_', ' ')}
              </p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-2xl text-sm font-medium text-[#8B8698] hover:bg-[#FAEBEA] hover:text-[#C97F76] transition-all"
          >
            <LogOut size={18} />
            Logout
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 ml-64 p-8">{children}</main>
    </div>
  );
}

export default Layout;