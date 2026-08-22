import React from 'react';
import { Home, Terminal, LayoutDashboard, Info } from 'lucide-react';

function Sidebar({ activeTab, setActiveTab }) {
  const menuItems = [
    { id: 'home', label: 'Operations Center', icon: Home },
    { id: 'scanner', label: 'Threat Scanner', icon: Terminal },
    { id: 'dashboard', label: 'Threat Dashboard', icon: LayoutDashboard },
    { id: 'about', label: 'Pipeline Analytics', icon: Info },
  ];

  return (
    <aside className="fixed bottom-0 left-0 w-full md:w-64 h-16 md:h-[calc(100vh-4rem)] bg-cyber-card border-t md:border-t-0 md:border-r border-cyber-border z-40 flex md:flex-col md:py-6 md:px-4">
      <nav className="flex md:flex-col justify-around md:justify-start w-full gap-2 px-2 md:px-0">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs md:text-sm font-semibold tracking-wide transition-all duration-200 w-full ${
                isActive
                  ? 'bg-cyber-cyan/10 border border-cyber-cyan/35 text-cyber-cyan shadow-neon-cyan/20'
                  : 'border border-transparent text-cyber-muted hover:text-white hover:bg-cyber-panel/50'
              }`}
            >
              <Icon className={`w-4 h-4 md:w-5 md:h-5 ${isActive ? 'animate-pulse' : ''}`} />
              <span className="hidden md:inline font-mono">{item.label}</span>
            </button>
          );
        })}
      </nav>
      
      {/* Decorative Cyber Grid status widget inside sidebar */}
      <div className="hidden md:flex flex-col mt-auto p-4 glass-panel border border-cyber-border/40">
        <span className="text-[10px] text-cyber-muted uppercase tracking-widest font-mono">NODE TELEMETRY</span>
        <div className="flex items-center justify-between mt-2">
          <span className="text-xs text-white font-mono">Status:</span>
          <span className="text-xs text-cyber-safe font-mono font-bold uppercase">SAFE</span>
        </div>
        <div className="flex items-center justify-between mt-1">
          <span className="text-xs text-cyber-muted font-mono">Threat level:</span>
          <span className="text-xs text-cyber-safe font-mono">0.0%</span>
        </div>
        
        {/* Audio feedback simulator or styling line */}
        <div className="h-1 bg-cyber-border rounded-full overflow-hidden mt-3">
          <div className="h-full w-1/3 bg-cyber-cyan rounded-full animate-pulse"></div>
        </div>
      </div>
    </aside>
  );
}

export default Sidebar;
