import React, { useState } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, Mail, User, Info, ArrowRight, Wallet } from 'lucide-react';

const Login = ({ onLogin }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [income, setIncome] = useState('25000');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isLogin) {
        // Standard OAuth2 form submission
        const params = new URLSearchParams();
        params.append('username', email);
        params.append('password', password);

        const res = await axios.post('/auth/login', params, {
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
        });
        onLogin(res.data.access_token);
      } else {
        await axios.post('/auth/register', {
          email,
          password,
          full_name: fullName,
          monthly_income: parseFloat(income) || 0.0,
          currency: 'INR'
        });
        // Auto login on successful register
        const params = new URLSearchParams();
        params.append('username', email);
        params.append('password', password);

        const res = await axios.post('/auth/login', params, {
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
        });
        onLogin(res.data.access_token);
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.detail || 'An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative p-4 bg-radial">
      {/* Background Neon Orbs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-neonBlue/10 blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full bg-neonPurple/10 blur-[120px] pointer-events-none"></div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md glass-panel rounded-3xl p-8 relative overflow-hidden shadow-glass"
      >
        {/* Decorative Top Line */}
        <div className="absolute top-0 inset-x-0 h-[3px] bg-gradient-to-r from-neonBlue via-neonPurple to-neonPink"></div>

        {/* Brand Header */}
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-neonBlue to-neonPurple flex items-center justify-center mx-auto mb-4 shadow-neon-glow">
            <Wallet size={24} className="text-white" />
          </div>
          <h2 className="text-2xl font-black tracking-tight text-white">
            TASKFLOW FINANCE AI
          </h2>
          <p className="text-gray-300 text-sm mt-1">
            AI-Powered Personal Finance & Budget Advisor
          </p>
        </div>

        {/* Toggle Tabs */}
        <div className="flex border-b border-glassBorder mb-6">
          <button
            onClick={() => { setIsLogin(true); setError(''); }}
            className={`flex-1 pb-3 text-sm font-bold transition-all relative ${isLogin ? 'text-white' : 'text-gray-500'}`}
          >
            Login
            {isLogin && (
              <motion.div layoutId="activeTab" className="absolute bottom-0 inset-x-0 h-0.5 bg-neonBlue" />
            )}
          </button>
          <button
            onClick={() => { setIsLogin(false); setError(''); }}
            className={`flex-1 pb-3 text-sm font-bold transition-all relative ${!isLogin ? 'text-white' : 'text-gray-500'}`}
          >
            Register
            {!isLogin && (
              <motion.div layoutId="activeTab" className="absolute bottom-0 inset-x-0 h-0.5 bg-neonBlue" />
            )}
          </button>
        </div>

        {/* Errors Alert */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-6 p-4 rounded-xl bg-neonRed/10 border border-neonRed/30 text-neonRed text-sm flex items-start gap-2"
            >
              <Info size={16} className="mt-0.5 shrink-0" />
              <span>{error}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Form Details */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <AnimatePresence mode="popLayout">
            {!isLogin && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="space-y-4"
              >
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Full Name</label>
                  <div className="relative">
                    <User size={18} className="absolute left-4 top-3.5 text-gray-500" />
                    <input
                      type="text"
                      required={!isLogin}
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="John Doe"
                      className="w-full glass-input pl-12"
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Monthly Income (INR)</label>
                  <div className="relative">
                    <Wallet size={18} className="absolute left-4 top-3.5 text-gray-500" />
                    <input
                      type="number"
                      required={!isLogin}
                      value={income}
                      onChange={(e) => setIncome(e.target.value)}
                      placeholder="25000"
                      className="w-full glass-input pl-12"
                    />
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Email Address</label>
            <div className="relative">
              <Mail size={18} className="absolute left-4 top-3.5 text-gray-500" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="student@college.edu"
                className="w-full glass-input pl-12"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Password</label>
            <div className="relative">
              <Lock size={18} className="absolute left-4 top-3.5 text-gray-500" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full glass-input pl-12"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-6 py-4 rounded-xl font-bold bg-gradient-to-r from-neonBlue to-neonPurple text-white hover:shadow-neon-glow hover:brightness-110 active:scale-[0.98] transition-all flex items-center justify-center gap-2 group disabled:opacity-50"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <>
                <span>{isLogin ? 'Log In' : 'Create Account'}</span>
                <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </button>
        </form>
      </motion.div>
    </div>
  );
};

export default Login;
