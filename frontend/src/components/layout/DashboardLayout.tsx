import React, { useState } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../store';
import { logout } from '../../store/slices/authSlice';
import api from '../../services/api';
import { 
  LayoutDashboard, 
  Users, 
  GraduationCap, 
  LogOut, 
  Menu,
  Moon,
  Sun
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

const DashboardLayout = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(
    document.documentElement.classList.contains('dark')
  );

  const toggleDarkMode = () => {
    document.documentElement.classList.toggle('dark');
    setIsDarkMode(!isDarkMode);
  };

  const handleLogout = async () => {
    try {
      await api.post('/auth/logout');
      dispatch(logout());
      toast.success('Logged out successfully');
      navigate('/login');
    } catch (error) {
      toast.error('Failed to logout');
    }
  };

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Students', path: '/dashboard/students', icon: GraduationCap },
    { name: 'Staff', path: '/dashboard/staff', icon: Users },
    { name: 'Attendance', path: '/dashboard/attendance', icon: Menu },
  ];

  return (
    <div className="flex h-screen bg-muted/20">
      {/* Sidebar */}
      <aside 
        className={`${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } fixed inset-y-0 left-0 z-50 w-64 bg-background border-r transition-transform duration-200 ease-in-out md:relative md:translate-x-0`}
      >
        <div className="flex items-center justify-center h-16 border-b">
          <h1 className="text-xl font-bold tracking-tight">ERP System</h1>
        </div>
        <nav className="p-4 space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname.startsWith(item.path);
            return (
              <Link key={item.name} to={item.path}>
                <span className={`flex items-center gap-3 px-3 py-2 rounded-md transition-colors ${
                  isActive ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'
                }`}>
                  <Icon size={20} />
                  {item.name}
                </span>
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="h-16 bg-background border-b flex items-center justify-between px-4 sm:px-6 z-10">
          <div className="flex items-center">
            <Button 
              variant="ghost" 
              size="icon" 
              className="md:hidden mr-2"
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              <Menu size={20} />
            </Button>
            <h2 className="text-lg font-medium hidden sm:block">
              Welcome, {user?.firstName}
            </h2>
          </div>
          
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={toggleDarkMode}>
              {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
            </Button>
            
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-medium">
                {user?.firstName?.[0]}{user?.lastName?.[0]}
              </div>
              <Button variant="ghost" size="icon" onClick={handleLogout} title="Logout">
                <LogOut size={20} />
              </Button>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-muted/10 p-4 md:p-6">
          <Outlet />
        </main>
      </div>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
};

export default DashboardLayout;
