import React from 'react';
import { Link } from 'react-router-dom';
import { HeartPulse, BrainCircuit, Activity, BarChart2, MessageSquare, ShieldCheck } from 'lucide-react';
import GlassCard from '../components/GlassCard';

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-dark-bg text-gray-200 overflow-x-hidden relative flex flex-col justify-between">
      {/* Decorative Glow Elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full bg-primary-600/10 blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] rounded-full bg-purple-600/10 blur-[120px] pointer-events-none"></div>

      {/* Navigation Header */}
      <header className="w-full px-6 md:px-12 py-6 border-b border-white/5 backdrop-blur-md sticky top-0 z-50 bg-dark-bg/85 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <HeartPulse className="h-6 w-6 text-primary-500 text-glow-indigo animate-pulse" />
          <span className="font-extrabold text-xl tracking-tight bg-gradient-to-r from-primary-400 to-purple-400 bg-clip-text text-transparent">WellnessAI</span>
        </div>
        <div className="flex items-center gap-4">
          <Link to="/login" className="px-5 py-2.5 rounded-xl border border-white/10 text-sm font-medium hover:bg-white/5 transition-all">
            Login
          </Link>
          <Link to="/login?register=true" className="glow-btn px-5 py-2.5 rounded-xl bg-gradient-to-r from-primary-600 to-purple-600 text-sm font-bold text-white shadow-lg shadow-primary-500/20 hover:scale-105 active:scale-95 transition-all">
            Get Started
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 max-w-7xl mx-auto px-6 md:px-12 py-16 md:py-24 flex flex-col items-center text-center gap-8 z-10">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-500/10 border border-primary-500/20 text-xs font-semibold text-primary-400 uppercase tracking-widest animate-fade-in">
          <BrainCircuit className="h-4 w-4 animate-spin" style={{ animationDuration: '4s' }} />
          Explainable AI Health Technology
        </div>
        
        <h1 className="text-4xl sm:text-5xl md:text-7xl font-extrabold tracking-tight text-white leading-tight max-w-4xl animate-slide-up">
          Predict, Understand, and Manage{' '}
          <span className="bg-gradient-to-r from-primary-400 via-indigo-400 to-purple-400 bg-clip-text text-transparent">
            Student Burnout
          </span>
        </h1>
        
        <p className="text-base sm:text-lg md:text-xl text-gray-400 max-w-2xl leading-relaxed animate-fade-in" style={{ animationDelay: '200ms' }}>
          Analyze sleep hours, screen time, study workloads, and lifestyle metrics. Learn exact clinical stress drivers using serialized Random Forest & XGBoost pipelines explained by SHAP.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-4 mt-4 animate-fade-in" style={{ animationDelay: '400ms' }}>
          <Link 
            to="/login?register=true" 
            className="glow-btn px-8 py-4 rounded-2xl bg-gradient-to-r from-primary-600 via-indigo-600 to-purple-600 text-base font-bold text-white shadow-xl shadow-primary-600/25 hover:scale-105 active:scale-95 transition-all"
          >
            Start Personal Assessment
          </Link>
          <a 
            href="#features" 
            className="px-8 py-4 rounded-2xl border border-white/10 text-base font-semibold hover:bg-white/5 transition-all"
          >
            Explore Methodology
          </a>
        </div>

        {/* Feature Highlights Grid */}
        <section id="features" className="w-full grid grid-cols-1 md:grid-cols-3 gap-6 mt-16 md:mt-24 text-left">
          <GlassCard className="flex flex-col gap-4">
            <div className="h-12 w-12 rounded-2xl bg-primary-500/10 border border-primary-500/20 flex items-center justify-center">
              <Activity className="h-6 w-6 text-primary-400" />
            </div>
            <h3 className="text-xl font-bold text-white">Dual ML Pipeline</h3>
            <p className="text-sm text-gray-400 leading-relaxed">
              Trained on 27,000+ student observations comparing calibrated Random Forest and XGBoost classification/regression for Stress Level, Burnout Risk, and Wellness Scores.
            </p>
          </GlassCard>

          <GlassCard className="flex flex-col gap-4">
            <div className="h-12 w-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center">
              <BrainCircuit className="h-6 w-6 text-indigo-400" />
            </div>
            <h3 className="text-xl font-bold text-white">Explainable AI (XAI)</h3>
            <p className="text-sm text-gray-400 leading-relaxed">
              Understand the "Why". Get interactive local SHAP explanation charts detailing which specific lifestyle or academic factors contribute directly to your wellness index.
            </p>
          </GlassCard>

          <GlassCard className="flex flex-col gap-4">
            <div className="h-12 w-12 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center">
              <MessageSquare className="h-6 w-6 text-purple-400" />
            </div>
            <h3 className="text-xl font-bold text-white">AI Health Advisor</h3>
            <p className="text-sm text-gray-400 leading-relaxed">
              Unlock clinical sleep habits, active recall study structures, and meal planners. Receive downloadable reports and consult a context-aware AI wellness chatbot.
            </p>
          </GlassCard>
        </section>

        {/* Admin trust section */}
        <section className="w-full max-w-4xl mt-10 p-6 rounded-3xl border border-white/5 bg-gradient-to-br from-white/[0.02] to-transparent flex flex-col md:flex-row items-center gap-6 text-left">
          <div className="p-3 rounded-2xl bg-purple-500/10 border border-purple-500/20">
            <ShieldCheck className="h-8 w-8 text-purple-400" />
          </div>
          <div>
            <h4 className="font-bold text-white text-base">Campus Administration Ready</h4>
            <p className="text-xs text-gray-400 mt-1 leading-relaxed">
              Built with an Admin Dashboard allowing directors and counselors to audit average campus wellness scores, identify high-risk students automatically, and monitor machine learning cross-validation performance.
            </p>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="w-full py-8 border-t border-white/5 bg-[#05070B] text-center text-xs text-gray-500 z-10">
        © 2026 WellnessAI Diagnostics Inc. Fully compliant with Vercel, Render, and Relational Database Schemas.
      </footer>
    </div>
  );
};

export default LandingPage;
