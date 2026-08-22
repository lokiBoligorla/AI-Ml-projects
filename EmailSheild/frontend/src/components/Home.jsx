import React from 'react';
import { Shield, ShieldAlert, Cpu, Database, Activity, RefreshCw } from 'lucide-react';
import Charts from './Charts';

function Home({ stats, activeScansCount }) {
  const { safe, spam, phishing } = stats;
  const total = safe + spam + phishing;

  return (
    <div className="space-y-8 animate-fadeIn font-sans">
      
      {/* Visual Telemetry Header Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        
        {/* Core State card */}
        <div className="glass-panel p-6 flex items-center gap-4 relative overflow-hidden border-l-4 border-l-cyber-cyan shadow-neon-cyan/5">
          <div className="w-12 h-12 bg-cyber-cyan/10 border border-cyber-cyan/35 rounded-xl flex items-center justify-center shrink-0">
            <Shield className="text-cyber-cyan w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-cyber-muted font-bold font-mono uppercase tracking-widest block">Core Engine Status</span>
            <span className="text-lg font-extrabold text-white font-mono uppercase tracking-wide block">Shield Online</span>
          </div>
        </div>

        {/* Counter: Phishing */}
        <div className="glass-panel p-6 flex items-center gap-4 relative overflow-hidden border-l-4 border-l-cyber-phish shadow-neon-phish/5">
          <div className="w-12 h-12 bg-cyber-phish/10 border border-cyber-phish/35 rounded-xl flex items-center justify-center shrink-0">
            <ShieldAlert className="text-cyber-phish w-6 h-6 animate-pulse" />
          </div>
          <div>
            <span className="text-xs text-cyber-muted font-bold font-mono uppercase tracking-widest block">Phishing Blocked</span>
            <span className="text-2xl font-black text-white font-mono block">{phishing}</span>
          </div>
        </div>

        {/* Counter: Spam */}
        <div className="glass-panel p-6 flex items-center gap-4 relative overflow-hidden border-l-4 border-l-cyber-spam shadow-neon-spam/5">
          <div className="w-12 h-12 bg-cyber-spam/10 border border-cyber-spam/35 rounded-xl flex items-center justify-center shrink-0">
            <RefreshCw className="text-cyber-spam w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-cyber-muted font-bold font-mono uppercase tracking-widest block">Spam Flagged</span>
            <span className="text-2xl font-black text-white font-mono block">{spam}</span>
          </div>
        </div>

        {/* Counter: Safe */}
        <div className="glass-panel p-6 flex items-center gap-4 relative overflow-hidden border-l-4 border-l-cyber-safe shadow-neon-safe/5">
          <div className="w-12 h-12 bg-cyber-safe/10 border border-cyber-safe/35 rounded-xl flex items-center justify-center shrink-0">
            <Activity className="text-cyber-safe w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-cyber-muted font-bold font-mono uppercase tracking-widest block">Safe Scans Logged</span>
            <span className="text-2xl font-black text-white font-mono block">{safe}</span>
          </div>
        </div>

      </div>

      {/* Embedded SVGA telemetry analytics dashboard cards */}
      <Charts stats={stats} />

      {/* Guidelines Grid details */}
      <div className="glass-panel p-6 md:p-8 space-y-6">
        <div className="border-b border-cyber-border/40 pb-4">
          <h3 className="text-base font-bold font-mono text-white flex items-center gap-2.5 uppercase tracking-widest">
            <Cpu className="text-cyber-cyan w-5 h-5 animate-pulse" />
            AI Node Defensive Operations Manual
          </h3>
          <p className="text-sm md:text-base text-cyber-muted mt-2 leading-relaxed">
            EmailShield combines rule-based heuristic scanning filters with high-dimensional probability models to isolate credential-harvesting triggers.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          <div className="space-y-2">
            <h4 className="text-sm font-extrabold font-mono text-white uppercase tracking-wider">
              1. PASTING CONTENT FOR TESTING
            </h4>
            <p className="text-xs md:text-sm text-cyber-muted leading-relaxed">
              Navigate to the **Threat Scanner** page using the sidebar menu. You can paste custom raw email text blocks or load pre-compiled Safe, Spam, and Phishing templates instantly to verify accuracy rates.
            </p>
          </div>

          <div className="space-y-2">
            <h4 className="text-sm font-extrabold font-mono text-white uppercase tracking-wider">
              2. EVALUATING ALERTS & HEURISTICS
            </h4>
            <p className="text-xs md:text-sm text-cyber-muted leading-relaxed">
              The scanner displays circular gauges for threat confidence. A regex highlighter lists suspicious keyword matches, and a link analyzer flags dangerous IP subdomains, suspicious TLDs, or excessive lengths.
            </p>
          </div>

          <div className="space-y-2">
            <h4 className="text-sm font-extrabold font-mono text-white uppercase tracking-wider">
              3. BAYESIAN EXPLAINABILITY
            </h4>
            <p className="text-xs md:text-sm text-cyber-muted leading-relaxed">
              Every prediction parses the TF-IDF feature index times the Naive Bayes joint conditional probabilities to isolate the top 5 word triggers, explaining precisely why the machine came to its classification.
            </p>
          </div>

        </div>

        <div className="pt-4 border-t border-cyber-border/40 flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs md:text-sm text-cyber-muted">
          <div className="flex items-center gap-2">
            <Database className="w-4.5 h-4.5 text-cyber-cyan" />
            <span>SQLite Database status: active ({total} scan logs registry active)</span>
          </div>
          <span>Security Protocol Level: maximum (operational)</span>
        </div>

      </div>

    </div>
  );
}

export default Home;
