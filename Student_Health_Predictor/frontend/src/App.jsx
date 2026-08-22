import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Sidebar from './components/Sidebar';
import ChatBot from './components/ChatBot';

// Page Imports
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import Dashboard from './pages/Dashboard';
import PredictionForm from './pages/PredictionForm';
import ResultsPage from './pages/ResultsPage';
import AnalyticsPage from './pages/AnalyticsPage';
import AdminPanel from './pages/AdminPanel';
import ProfilePage from './pages/ProfilePage';

// Inner layout component to conditionally render Sidebar and ChatBot based on current route
const AppLayout = () => {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

  // Paths that do not show the Sidebar shell or ChatBot widget
  const fullScreenPaths = ['/landing', '/login'];
  const isFullScreen = fullScreenPaths.includes(location.pathname);

  if (loading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-dark-bg text-primary-500">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-t-transparent border-primary-500"></div>
      </div>
    );
  }

  // 1. Full-screen layout for landing or logins
  if (isFullScreen || !isAuthenticated) {
    return (
      <div className="min-h-screen bg-dark-bg w-full">
        <Routes>
          <Route path="/landing" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="*" element={<Navigate to="/landing" replace />} />
        </Routes>
      </div>
    );
  }

  // 2. Dashboard Shell Layout: Sidebar left, Scrollable Page right, Float ChatBot bottom right
  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-dark-bg text-gray-200">
      <Sidebar />
      <main className="flex-1 h-screen overflow-y-auto px-6 md:px-10 py-24 lg:py-10">
        <Routes>
          <Route path="/" element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } />
          <Route path="/predict" element={
            <ProtectedRoute>
              <PredictionForm />
            </ProtectedRoute>
          } />
          <Route path="/results" element={
            <ProtectedRoute>
              <ResultsPage />
            </ProtectedRoute>
          } />
          <Route path="/analytics" element={
            <ProtectedRoute>
              <AnalyticsPage />
            </ProtectedRoute>
          } />
          <Route path="/profile" element={
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          } />
          <Route path="/admin" element={
            <ProtectedRoute adminOnly={true}>
              <AdminPanel />
            </ProtectedRoute>
          } />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      
      {/* Floating Interactive ChatBot for fast accessibility */}
      <ChatBot />
    </div>
  );
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <AppLayout />
      </AuthProvider>
    </Router>
  );
}

export default App;
