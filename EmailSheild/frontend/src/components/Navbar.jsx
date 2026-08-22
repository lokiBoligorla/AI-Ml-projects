import React from 'react';
import { Shield, Cpu, RefreshCw, CheckCircle, WifiOff, AlertCircle } from 'lucide-react';

function Navbar({ systemStatus }) {
  return (
    <header className="fixed top-0 left-0 w-full h-16 bg-cyber-card/80 backdrop-blur-md border-b border-cyber-border z-40 px-4 md:px-8 flex items-center justify-between">
      
      {/* Brand logo */}
      <div className="flex items-center gap-2.5">
        <div className="relative flex items-center justify-center w-10 h-10 bg-cyber-cyan/10 border border-cyber-cyan/30 rounded-xl overflow-hidden shadow-neon-cyan">
          <Shield className="text-cyber-cyan w-5 h-5" />
          <div className="absolute inset-0 bg-cyber-cyan/5 animate-pulse"></div>
        </div>
        <div>
          <h1 className="text-lg font-bold tracking-tight text-white flex items-center gap-1.5 font-mono">
            EMAIL<span className="text-cyber-cyan">SHIELD</span>
            <span className="text-[10px] bg-cyber-border text-cyber-muted px-1.5 py-0.5 rounded border border-cyber-border uppercase tracking-widest font-sans">
              v1.0
            </span>
          </h1>
        </div>
      </div>

      {/* Connection and Operations Status */}
      <div className="flex items-center gap-4">
        
        {/* System telemetry status */}
        <div className="hidden sm:flex items-center gap-2.5 px-3 py-1.5 bg-cyber-bg border border-cyber-border rounded-lg">
          <Cpu className="text-cyber-muted w-4 h-4" />
          <span className="text-xs text-cyber-muted font-semibold uppercase tracking-wider font-mono">AI CORE NODE:</span>
          
          {systemStatus === "checking" && (
            <span className="flex items-center gap-1.5 text-xs text-cyber-spam font-semibold font-mono">
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              CONNECTING
            </span>
          )}
          {systemStatus === "operational" && (
            <span className="flex items-center gap-1.5 text-xs text-cyber-safe font-semibold font-mono">
              <CheckCircle className="w-3.5 h-3.5 text-cyber-safe animate-pulse" />
              ONLINE
            </span>
          )}
          {systemStatus === "offline" && (
            <span className="flex items-center gap-1.5 text-xs text-cyber-phish font-semibold font-mono">
              <WifiOff className="w-3.5 h-3.5 text-cyber-phish" />
              OFFLINE
            </span>
          )}
          {systemStatus === "error" && (
            <span className="flex items-center gap-1.5 text-xs text-cyber-phish font-semibold font-mono">
              <AlertCircle className="w-3.5 h-3.5 text-cyber-phish animate-bounce" />
              FAULT
            </span>
          )}
        </div>

        {/* Global Security Level Indicator */}
        <div className="flex items-center gap-2">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyber-safe opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-cyber-safe"></span>
          </span>
          <span className="text-xs text-cyber-safe font-bold uppercase tracking-widest font-mono">
            NODE SECURE
          </span>
        </div>
      </div>

    </header>
  );
}

export default Navbar;
