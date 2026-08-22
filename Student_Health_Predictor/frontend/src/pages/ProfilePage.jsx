import React from 'react';
import { useAuth } from '../context/AuthContext';
import { User, Mail, Shield, Calendar, Award } from 'lucide-react';
import GlassCard from '../components/GlassCard';

const ProfilePage = () => {
  const { user } = useAuth();

  return (
    <div className="flex flex-col gap-8 w-full max-w-2xl mx-auto">
      <div>
        <h1 className="text-3xl font-extrabold text-white tracking-tight">Student Account Profile</h1>
        <p className="text-sm text-gray-400 mt-1">Manage your academic credentials and monitor your security clearance.</p>
      </div>

      <GlassCard className="flex flex-col gap-6" glow={true} hoverEffect={false}>
        {/* Top Profile Header */}
        <div className="flex items-center gap-5 border-b border-white/5 pb-6">
          <div className="h-16 w-16 rounded-3xl bg-gradient-to-tr from-primary-500 to-purple-500 flex items-center justify-center font-black text-2xl text-white shadow-xl shadow-primary-500/20">
            {user?.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">{user?.name}</h2>
            <p className="text-sm text-gray-400 mt-0.5">{user?.email}</p>
          </div>
        </div>

        {/* Credentials Details List */}
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/5">
            <div className="flex items-center gap-3">
              <User className="h-5 w-5 text-indigo-400" />
              <span className="text-sm font-medium text-gray-300">Name</span>
            </div>
            <span className="text-sm font-bold text-white">{user?.name}</span>
          </div>

          <div className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/5">
            <div className="flex items-center gap-3">
              <Mail className="h-5 w-5 text-purple-400" />
              <span className="text-sm font-medium text-gray-300">Email Address</span>
            </div>
            <span className="text-sm font-bold text-white">{user?.email}</span>
          </div>

          <div className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/5">
            <div className="flex items-center gap-3">
              <Shield className="h-5 w-5 text-emerald-400" />
              <span className="text-sm font-medium text-gray-300">Role Status</span>
            </div>
            <span className="text-xs font-bold text-emerald-400 px-3 py-1 rounded-md bg-emerald-500/10 border border-emerald-500/20 uppercase tracking-widest">
              {user?.is_admin ? 'Administrator' : 'Student'}
            </span>
          </div>

          <div className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/5">
            <div className="flex items-center gap-3">
              <Calendar className="h-5 w-5 text-pink-400" />
              <span className="text-sm font-medium text-gray-300">Account Created</span>
            </div>
            <span className="text-sm font-bold text-white">
              {new Date(user?.created_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
            </span>
          </div>
        </div>

        {/* Security and clinical compliance disclaimer */}
        <div className="p-4 rounded-2xl bg-gradient-to-r from-purple-500/5 to-transparent border border-purple-500/10 flex gap-3 text-xs leading-normal text-purple-300">
          <Award className="h-5 w-5 flex-shrink-0 text-purple-400" />
          <span>This account is fully secured using industry-standard HS256 JWT protocols and bcrypt hashing context. Student surveys and diagnostic results are stored locally in compliant SQL schemas.</span>
        </div>
      </GlassCard>
    </div>
  );
};

export default ProfilePage;
