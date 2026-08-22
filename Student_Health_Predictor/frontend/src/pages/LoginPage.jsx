import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { HeartPulse, User, Mail, Lock, LogIn, UserPlus, AlertCircle } from 'lucide-react';
import GlassCard from '../components/GlassCard';

const LoginPage = () => {
  const { login, register, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Tab control
  const [isRegister, setIsRegister] = useState(false);
  
  // Fields state
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  // UI state
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Sync tab with query params
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get('register') === 'true') {
      setIsRegister(true);
    } else {
      setIsRegister(false);
    }
  }, [location]);

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!email || !password || (isRegister && !name)) {
      setError('Please fill in all required fields.');
      return;
    }
    
    setLoading(true);
    try {
      if (isRegister) {
        await register(name, email, password);
        // Automatically log user in after successful registration
        await login(email, password);
        navigate('/');
      } else {
        await login(email, password);
        navigate('/');
      }
    } catch (err) {
      console.error(err);
      setError(
        err.response?.data?.detail || 
        'Incorrect credentials or connection error. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-dark-bg text-gray-200 flex flex-col justify-center items-center p-6 relative overflow-hidden">
      {/* Decorative Glow Elements */}
      <div className="absolute top-[20%] left-[20%] w-[350px] h-[350px] rounded-full bg-primary-600/10 blur-[80px] pointer-events-none"></div>
      <div className="absolute bottom-[20%] right-[20%] w-[350px] h-[350px] rounded-full bg-purple-600/10 blur-[80px] pointer-events-none"></div>

      {/* Main card container */}
      <div className="w-full max-w-md z-10 flex flex-col gap-6">
        {/* Logo and title */}
        <div className="flex flex-col items-center gap-2 text-center">
          <div 
            onClick={() => navigate('/')} 
            className="p-3 rounded-2xl bg-primary-600/10 border border-primary-500/20 shadow-inner flex items-center justify-center cursor-pointer hover:scale-105 active:scale-95 transition-all"
          >
            <HeartPulse className="h-8 w-8 text-primary-500 text-glow-indigo animate-pulse" />
          </div>
          <h2 className="font-extrabold text-2xl tracking-tight bg-gradient-to-r from-primary-400 to-purple-400 bg-clip-text text-transparent mt-2">
            WellnessAI Portal
          </h2>
          <p className="text-xs text-gray-400">Student Mental Health & Stress Diagnostics</p>
        </div>

        {/* Auth form Glass Card */}
        <GlassCard className="flex flex-col gap-6" glow={true}>
          {/* Tab buttons */}
          <div className="flex p-1 bg-white/5 border border-white/5 rounded-2xl">
            <button
              onClick={() => {
                setIsRegister(false);
                setError('');
                navigate('/login');
              }}
              className={`flex-1 py-2.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all ${!isRegister ? 'bg-primary-600 text-white shadow-lg' : 'text-gray-400 hover:text-white'}`}
            >
              <LogIn className="h-4 w-4" />
              Login
            </button>
            <button
              onClick={() => {
                setIsRegister(true);
                setError('');
                navigate('/login?register=true');
              }}
              className={`flex-1 py-2.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all ${isRegister ? 'bg-primary-600 text-white shadow-lg' : 'text-gray-400 hover:text-white'}`}
            >
              <UserPlus className="h-4 w-4" />
              Sign Up
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {error && (
              <div className="p-3.5 rounded-2xl bg-red-500/10 border border-red-500/20 text-xs text-red-400 flex items-start gap-2.5 leading-normal animate-fade-in">
                <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            {isRegister && (
              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-gray-400 font-semibold px-1">Full Name</label>
                <div className="relative">
                  <User className="absolute left-3.5 top-3.5 h-4 w-4 text-gray-500" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter your name"
                    className="w-full pl-11 pr-4 py-3 rounded-2xl bg-white/5 border border-white/10 text-white placeholder-gray-500 text-sm focus:outline-none focus:border-primary-500 focus:bg-white/[0.07] transition-all"
                  />
                </div>
              </div>
            )}

            <div className="flex flex-col gap-1.5">
              <label className="text-xs text-gray-400 font-semibold px-1">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-3.5 h-4 w-4 text-gray-500" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="student@university.edu"
                  className="w-full pl-11 pr-4 py-3 rounded-2xl bg-white/5 border border-white/10 text-white placeholder-gray-500 text-sm focus:outline-none focus:border-primary-500 focus:bg-white/[0.07] transition-all"
                />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs text-gray-400 font-semibold px-1">Password</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-3.5 h-4 w-4 text-gray-500" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-11 pr-4 py-3 rounded-2xl bg-white/5 border border-white/10 text-white placeholder-gray-500 text-sm focus:outline-none focus:border-primary-500 focus:bg-white/[0.07] transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="glow-btn mt-2 py-3.5 rounded-2xl bg-gradient-to-r from-primary-600 to-purple-600 text-white font-bold text-sm shadow-xl shadow-primary-600/20 hover:scale-[1.02] active:scale-95 disabled:scale-100 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
            >
              {loading ? (
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-t-transparent border-white"></div>
              ) : (
                <>
                  {isRegister ? <UserPlus className="h-4.5 w-4.5" /> : <LogIn className="h-4.5 w-4.5" />}
                  <span>{isRegister ? 'Create Account' : 'Sign In'}</span>
                </>
              )}
            </button>
          </form>
        </GlassCard>
      </div>
    </div>
  );
};

export default LoginPage;
