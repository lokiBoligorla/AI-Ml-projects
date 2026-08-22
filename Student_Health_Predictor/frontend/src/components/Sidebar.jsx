import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  Home, 
  Activity, 
  TrendingUp, 
  ShieldAlert, 
  User, 
  LogOut, 
  Menu, 
  X, 
  HeartPulse 
} from 'lucide-react';

const Sidebar = () => {
  const { user, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navLinks = [
    { to: '/', name: 'Dashboard', icon: Home },
    { to: '/predict', name: 'Assessment', icon: Activity },
    { to: '/analytics', name: 'Analytics', icon: TrendingUp },
    { to: '/profile', name: 'Profile', icon: User },
  ];

  // Admin link (only show if is_admin is true)
  if (user?.is_admin) {
    navLinks.push({ to: '/admin', name: 'Admin Portal', icon: ShieldAlert });
  }

  const activeStyle = "flex items-center gap-3 px-4 py-3 rounded-xl bg-gradient-to-r from-primary-600/30 to-purple-600/10 border border-primary-500/20 text-white font-medium shadow-md shadow-primary-500/5 transition-all duration-300";
  const inactiveStyle = "flex items-center gap-3 px-4 py-3 rounded-xl text-gray-400 hover:text-gray-200 hover:bg-white/5 border border-transparent transition-all duration-300";

  return (
    <>
      {/* Mobile Header */}
      <div className="lg:hidden flex items-center justify-between px-6 py-4 bg-dark-bg/90 border-b border-white/5 backdrop-blur-md fixed top-0 w-full z-40">
        <div className="flex items-center gap-2">
          <HeartPulse className="h-6 w-6 text-primary-500" />
          <span className="font-bold text-lg bg-gradient-to-r from-primary-600 to-purple-600 bg-clip-text text-transparent">WellnessAI</span>
        </div>
        <button 
          onClick={() => setIsOpen(!isOpen)}
          className="p-2 text-gray-400 hover:text-white rounded-lg hover:bg-white/5"
        >
          {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Slide-over Mobile Sidebar Drawer */}
      <div className={`fixed inset-y-0 left-0 transform ${isOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 transition-transform duration-300 ease-in-out z-50 w-64 lg:w-72 bg-dark-bg/95 lg:bg-transparent lg:static border-r border-white/5 p-6 flex flex-col justify-between h-screen`}>
        <div className="flex flex-col gap-8">
          {/* Logo Section */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-primary-600/10 border border-primary-500/20 shadow-inner">
                <HeartPulse className="h-6 w-6 text-primary-500 text-glow-indigo" />
              </div>
              <span className="font-bold text-xl bg-gradient-to-r from-primary-600 to-purple-600 bg-clip-text text-transparent">WellnessAI</span>
            </div>
            {/* Close Button on Mobile Drawer */}
            <button onClick={() => setIsOpen(false)} className="lg:hidden p-1 text-gray-400 hover:text-white">
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* User Bio Card */}
          <div className="p-4 rounded-2xl bg-gradient-to-br from-white/5 to-white/[0.01] border border-white/5 shadow-lg backdrop-blur-sm">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-primary-500 to-purple-500 flex items-center justify-center font-bold text-white shadow-md shadow-primary-500/10">
                {user?.name.charAt(0).toUpperCase()}
              </div>
              <div className="overflow-hidden">
                <h4 className="font-semibold text-sm text-white truncate">{user?.name}</h4>
                <p className="text-xs text-gray-400 truncate">{user?.email}</p>
              </div>
            </div>
            {user?.is_admin && (
              <div className="mt-3 text-center py-1 rounded-md bg-purple-500/10 border border-purple-500/20 text-[10px] text-purple-400 font-semibold uppercase tracking-wider">
                System Administrator
              </div>
            )}
          </div>

          {/* Navigation Links */}
          <nav className="flex flex-col gap-1.5">
            {navLinks.map((link) => (
              <NavLink 
                key={link.to} 
                to={link.to}
                onClick={() => setIsOpen(false)}
                className={({ isActive }) => isActive ? activeStyle : inactiveStyle}
              >
                <link.icon className="h-5 w-5" />
                <span>{link.name}</span>
              </NavLink>
            ))}
          </nav>
        </div>

        {/* Footer actions */}
        <div className="flex flex-col gap-4">
          <button 
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-red-400 hover:text-red-300 hover:bg-red-500/5 border border-transparent hover:border-red-500/10 transition-all duration-300 group"
          >
            <LogOut className="h-5 w-5 group-hover:translate-x-0.5 transition-transform" />
            <span className="font-medium">Logout Session</span>
          </button>
          <div className="text-[10px] text-gray-600 text-center border-t border-white/5 pt-3">
            WellnessAI Diagnostics v1.0.0
          </div>
        </div>
      </div>
      
      {/* Mobile Drawer Overlay Backdrop */}
      {isOpen && (
        <div 
          onClick={() => setIsOpen(false)}
          className="lg:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-30 transition-opacity duration-300"
        />
      )}
    </>
  );
};

export default Sidebar;
