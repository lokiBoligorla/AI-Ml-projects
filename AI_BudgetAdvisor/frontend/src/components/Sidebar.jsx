import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Sliders, 
  PieChart, 
  TrendingUp, 
  Bot, 
  AlertTriangle, 
  ShieldCheck, 
  LogOut, 
  Menu, 
  X,
  Wallet
} from 'lucide-react';

const Sidebar = ({ user, onLogout }) => {
  const [isOpen, setIsOpen] = useState(false);

  const menuItems = [
    { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/upload', label: 'Profile Planner', icon: Sliders },
    { path: '/analytics', label: 'Analytics', icon: PieChart },
    { path: '/forecasting', label: 'Forecasting', icon: TrendingUp },
    { path: '/ai-advisor', label: 'AI Advisor', icon: Bot },
    { path: '/anomalies', label: 'Anomaly Alerts', icon: AlertTriangle },
  ];

  if (user?.role === 'admin') {
    menuItems.push({ path: '/admin', label: 'Admin Dashboard', icon: ShieldCheck });
  }

  const toggleSidebar = () => setIsOpen(!isOpen);

  return (
    <>
      {/* Mobile Toggle Button */}
      <button 
        onClick={toggleSidebar}
        className="md:hidden fixed top-4 right-4 z-50 p-2 rounded-xl bg-glassBg border border-glassBorder backdrop-blur-md text-white hover:bg-opacity-80 transition-all"
      >
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Main Sidebar Wrapper */}
      <aside className={`
        fixed inset-y-0 left-0 z-40 w-64 glass-panel border-r border-glassBorder flex flex-col justify-between transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        md:translate-x-0
      `}>
        {/* Brand Logo */}
        <div className="p-6 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-neonBlue to-neonPurple flex items-center justify-center shadow-neon-glow">
            <Wallet size={20} className="text-white" />
          </div>
          <div>
            <h1 className="font-extrabold text-base tracking-tight bg-gradient-to-r from-white via-gray-200 to-gray-400 bg-clip-text text-transparent">
              TASKFLOW
            </h1>
            <p className="text-xs font-semibold text-neonBlue tracking-widest uppercase">
              Finance AI
            </p>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 px-4 space-y-1 overflow-y-auto py-4">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={() => setIsOpen(false)}
                className={({ isActive }) => `
                  flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold tracking-wide transition-all duration-200 group
                  ${isActive 
                    ? 'bg-gradient-to-r from-neonBlue/20 to-neonPurple/10 border-l-4 border-neonBlue text-white shadow-neon-glow' 
                    : 'text-gray-300 hover:text-white hover:bg-white/5 border-l-4 border-transparent'
                  }
                `}
              >
                <Icon size={18} className="group-hover:scale-110 transition-transform" />
                {item.label}
              </NavLink>
            );
          })}
        </nav>

        {/* User Card Profile & Logout */}
        <div className="p-4 border-t border-glassBorder bg-black/20">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-neonPurple to-neonPink flex items-center justify-center font-bold text-white text-sm">
              {user?.full_name?.charAt(0).toUpperCase() || 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-white truncate">
                {user?.full_name || 'Finance User'}
              </p>
              <p className="text-xs text-gray-300 truncate lowercase">
                {user?.email || 'user@domain.com'}
              </p>
            </div>
          </div>
        </div>
      </aside>

      {/* Backdrop for Mobile overlay */}
      {isOpen && (
        <div 
          onClick={toggleSidebar}
          className="fixed inset-0 z-30 bg-black/60 backdrop-blur-sm md:hidden"
        />
      )}
    </>
  );
};

export default Sidebar;
