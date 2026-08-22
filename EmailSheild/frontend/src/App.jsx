import React, { useState, useEffect } from 'react';
import { Shield, LayoutDashboard, Terminal, Info, Activity, Database, AlertTriangle, CheckCircle, Clock } from 'lucide-react';

// Import our custom components (which we will create next)
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import Home from './components/Home';
import PredictCard from './components/PredictCard';
import Charts from './components/Charts';
import HistoryList from './components/HistoryList';
import Explanation from './components/Explanation';

const API_BASE = "http://127.0.0.1:5000/api";

function App() {
  const [activeTab, setActiveTab] = useState('home');
  const [history, setHistory] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    safe: 0,
    spam: 0,
    phishing: 0,
    trends: []
  });
  const [loading, setLoading] = useState(false);
  const [systemStatus, setSystemStatus] = useState("checking");

  // Fetch metrics and history
  const fetchStats = async () => {
    try {
      const res = await fetch(`${API_BASE}/stats`);
      if (res.ok) {
        const data = await res.json();
        setStats(data);
      }
    } catch (err) {
      console.error("Failed to fetch statistics:", err);
    }
  };

  const fetchHistory = async () => {
    try {
      const res = await fetch(`${API_BASE}/history?limit=15`);
      if (res.ok) {
        const data = await res.json();
        setHistory(data);
      }
    } catch (err) {
      console.error("Failed to fetch scan history:", err);
    }
  };

  // Heartbeat check for backend status
  const checkSystemStatus = async () => {
    try {
      const res = await fetch(`${API_BASE}/stats`);
      if (res.ok) {
        setSystemStatus("operational");
      } else {
        setSystemStatus("error");
      }
    } catch (err) {
      setSystemStatus("offline");
    }
  };

  const handleClearHistory = async () => {
    if (!window.confirm("Are you sure you want to purge all scanned logs? This cannot be undone.")) {
      return;
    }
    try {
      const res = await fetch(`${API_BASE}/clear`, { method: "POST" });
      if (res.ok) {
        fetchStats();
        fetchHistory();
      }
    } catch (err) {
      console.error("Failed to clear database logs:", err);
    }
  };

  useEffect(() => {
    checkSystemStatus();
    fetchStats();
    fetchHistory();
    
    // Auto refresh status every 15s
    const interval = setInterval(() => {
      checkSystemStatus();
      fetchStats();
    }, 15000);
    
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative min-h-screen">
      {/* Cybersecurity digital grid backplane */}
      <div className="cyber-grid cyber-grid-pulse"></div>

      {/* Main layout container */}
      <div className="flex flex-col min-h-screen">
        
        {/* Navbar */}
        <Navbar systemStatus={systemStatus} />

        <div className="flex flex-1 pt-16 overflow-hidden">
          
          {/* Sidebar */}
          <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

          {/* Main Dashboard Space */}
          <main className="flex-1 overflow-y-auto px-4 md:px-8 py-6 pb-12">
            <div className="max-w-6xl mx-auto space-y-6">
              
              {/* Tab Router Switch */}
              {activeTab === 'home' && (
                <Home 
                  stats={stats} 
                  setActiveTab={setActiveTab} 
                  systemStatus={systemStatus} 
                />
              )}

              {activeTab === 'scanner' && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-2xl font-bold flex items-center gap-2">
                      <Terminal className="text-cyber-cyan w-6 h-6 animate-pulse" />
                      Email Threat Scanning Terminal
                    </h2>
                    <p className="text-cyber-muted text-sm mt-1">
                      Paste or compose raw email content below. The EmailShield AI scanner will run TF-IDF classification and extract suspicious links or keywords in real-time.
                    </p>
                  </div>
                  
                  <PredictCard onScanCompleted={() => { fetchStats(); fetchHistory(); }} />
                </div>
              )}

              {activeTab === 'dashboard' && (
                <div className="space-y-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <h2 className="text-2xl font-bold flex items-center gap-2">
                        <LayoutDashboard className="text-cyber-cyan w-6 h-6" />
                        Threat Control Dashboard
                      </h2>
                      <p className="text-cyber-muted text-sm mt-1">
                        Aggregated cybersecurity metrics, threat distributions, and historical logging logs recorded on this node.
                      </p>
                    </div>
                    <button
                      onClick={handleClearHistory}
                      className="px-4 py-2 text-xs border border-cyber-phish/40 hover:bg-cyber-phish/10 text-cyber-phish font-semibold rounded-lg transition-all"
                    >
                      Clear Scan Registry
                    </button>
                  </div>

                  {/* Stats Counter cards */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="glass-panel p-4 flex flex-col justify-between">
                      <span className="text-cyber-muted text-xs uppercase tracking-wider font-semibold">Total Scanned</span>
                      <div className="flex items-baseline justify-between mt-2">
                        <span className="text-2xl md:text-3xl font-bold font-mono text-cyber-text">{stats.total}</span>
                        <Activity className="text-cyber-cyan w-5 h-5 opacity-60" />
                      </div>
                    </div>
                    <div className="glass-panel p-4 flex flex-col justify-between border-l-4 border-l-cyber-safe">
                      <span className="text-cyber-muted text-xs uppercase tracking-wider font-semibold text-cyber-safe">Safe Emails</span>
                      <div className="flex items-baseline justify-between mt-2">
                        <span className="text-2xl md:text-3xl font-bold font-mono text-cyber-safe">{stats.safe}</span>
                        <CheckCircle className="text-cyber-safe w-5 h-5 opacity-60" />
                      </div>
                    </div>
                    <div className="glass-panel p-4 flex flex-col justify-between border-l-4 border-l-cyber-spam">
                      <span className="text-cyber-muted text-xs uppercase tracking-wider font-semibold text-cyber-spam">Spam Flagged</span>
                      <div className="flex items-baseline justify-between mt-2">
                        <span className="text-2xl md:text-3xl font-bold font-mono text-cyber-spam">{stats.spam}</span>
                        <Clock className="text-cyber-spam w-5 h-5 opacity-60" />
                      </div>
                    </div>
                    <div className="glass-panel p-4 flex flex-col justify-between border-l-4 border-l-cyber-phish">
                      <span className="text-cyber-muted text-xs uppercase tracking-wider font-semibold text-cyber-phish">Phishing Threats</span>
                      <div className="flex items-baseline justify-between mt-2">
                        <span className="text-2xl md:text-3xl font-bold font-mono text-cyber-phish">{stats.phishing}</span>
                        <AlertTriangle className="text-cyber-phish w-5 h-5 opacity-60" />
                      </div>
                    </div>
                  </div>

                  {/* SVG Charts section */}
                  <Charts stats={stats} />

                  {/* History Registry */}
                  <div className="glass-panel p-6">
                    <h3 className="text-lg font-semibold flex items-center gap-2 mb-4">
                      <Database className="text-cyber-cyan w-5 h-5" />
                      Recent Scans Registry
                    </h3>
                    <HistoryList history={history} />
                  </div>
                </div>
              )}

              {activeTab === 'about' && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-2xl font-bold flex items-center gap-2">
                      <Info className="text-cyber-cyan w-6 h-6" />
                      Security Pipeline Details
                    </h2>
                    <p className="text-cyber-muted text-sm mt-1">
                      Deep-dive documentation explaining the natural language processing math, vector calculations, and machine learning models driving EmailShield.
                    </p>
                  </div>
                  
                  <Explanation />
                </div>
              )}

            </div>
          </main>
        </div>
      </div>
    </div>
  );
}

export default App;
