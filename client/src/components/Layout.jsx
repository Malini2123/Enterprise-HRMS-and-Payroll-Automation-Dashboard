import { useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  CalendarClock,
  ClipboardCheck,
  UserPlus,
  LogOut,
  FileText,
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
      ]
    : [
        { label: 'My Dashboard', path: '/dashboard', icon: LayoutDashboard },
        { label: 'Request Leave', path: '/request-leave', icon: CalendarClock },
        { label: 'My Payslips', path: '/my-payslips', icon: FileText },
      ];

  return (
    <div className="min-h-screen flex bg-[#FAF9F7]">
      {/* Sidebar */}
      <aside className="w-64 bg-[#14132B] text-white flex flex-col fixed h-full">
        <div className="px-6 py-6 border-b border-white/10">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-linear-to-br from-[#6C5CE7] to-[#FF6B4A] flex items-center justify-center font-bold text-sm">
              H
            </div>
            <span className="font-['Space_Grotesk'] font-bold text-lg tracking-tight">
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
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all relative ${
                  isActive
                    ? 'bg-white/10 text-white'
                    : 'text-white/50 hover:bg-white/5 hover:text-white'
                }`}
              >
                {isActive && (
                  <span className="absolute left-0 top-1/2 -translate-y-1/2 h-5 w-1 rounded-r-full bg-[#FF6B4A]" />
                )}
                <Icon size={18} />
                {item.label}
              </button>
            );
          })}
        </nav>

        <div className="px-3 py-4 border-t border-white/10">
          <div className="flex items-center gap-3 px-3 py-2 mb-2">
            <div className="w-8 h-8 rounded-full bg-linear-to-br from-[#6C5CE7] to-[#FF6B4A] flex items-center justify-center text-xs font-bold">
              {user?.name?.charAt(0) || 'U'}
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-medium truncate">{user?.name}</p>
              <p className="text-xs text-white/50 capitalize truncate">
                {user?.role?.replace('_', ' ')}
              </p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-white/50 hover:bg-[#FF6B4A]/10 hover:text-[#FF6B4A] transition-all"
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