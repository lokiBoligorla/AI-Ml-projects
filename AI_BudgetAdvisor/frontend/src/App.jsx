import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import axios from 'axios';

import Sidebar from './components/Sidebar';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Upload from './pages/Upload';
import Analytics from './pages/Analytics';
import Forecasting from './pages/Forecasting';
import AIAdvisor from './pages/AIAdvisor';
import Anomalies from './pages/Anomalies';
import Admin from './pages/Admin';

// Configure Axios (using 127.0.0.1 to avoid IPv6 loopback localhost mapping issues)
axios.defaults.baseURL = 'http://127.0.0.1:8000/api';

// Request interceptor to attach JWT token
axios.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Private Route Guard
const PrivateRoute = ({ children }) => {
  return children;
};

const AppLayout = ({ children, user, onLogout }) => {
  const location = useLocation();
  const showSidebar = location.pathname !== '/login';

  return (
    <div className="flex min-h-screen">
      {showSidebar && <Sidebar user={user} onLogout={onLogout} />}
      <main className={`flex-1 ${showSidebar ? 'md:pl-64' : ''} min-h-screen w-full`}>
        <div className="p-4 md:p-8 max-w-7xl mx-auto w-full">
          {children}
        </div>
      </main>
    </div>
  );
};

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async () => {
    try {
      const res = await axios.get('/user/profile');
      setUser(res.data);
    } catch (err) {
      console.error("Failed to load user profile", err);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleLogin = (token) => {
    localStorage.setItem('token', token);
    setLoading(true);
    fetchProfile();
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-darkBg">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-neonBlue border-t-transparent rounded-full animate-spin"></div>
          <div className="absolute inset-0 w-16 h-16 border-4 border-neonPurple border-t-transparent rounded-full animate-ping opacity-25"></div>
        </div>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route 
          path="/login" 
          element={
            user ? <Navigate to="/dashboard" replace /> : <Login onLogin={handleLogin} />
          } 
        />
        
        <Route 
          path="/*" 
          element={
            <PrivateRoute>
              <AppLayout user={user} onLogout={handleLogout}>
                <Routes>
                  <Route path="/dashboard" element={<Dashboard user={user} />} />
                  <Route path="/upload" element={<Upload />} />
                  <Route path="/analytics" element={<Analytics />} />
                  <Route path="/forecasting" element={<Forecasting />} />
                  <Route path="/ai-advisor" element={<AIAdvisor />} />
                  <Route path="/anomalies" element={<Anomalies />} />
                  <Route path="/admin" element={<Admin user={user} />} />
                  <Route path="*" element={<Navigate to="/dashboard" replace />} />
                </Routes>
              </AppLayout>
            </PrivateRoute>
          } 
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
