import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertOctagon, CheckCircle2, ShieldAlert, XCircle, Info, Calendar } from 'lucide-react';

import GlassCard from '../components/GlassCard';

const Anomalies = () => {
  const [anomalies, setAnomalies] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchAnomalies = async () => {
    try {
      setLoading(true);
      const res = await axios.get('/anomalies');
      setAnomalies(res.data);
    } catch (err) {
      console.error("Failed to load anomalies", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnomalies();
  }, []);

  const handleAction = async (id, newStatus) => {
    try {
      await axios.put(`/anomalies/${id}`, { status: newStatus });
      // Remove from list or refresh status in local state
      setAnomalies(prev => prev.map(a => {
        if (a.id === id) return { ...a, status: newStatus };
        return a;
      }));
    } catch (err) {
      console.error("Failed to update anomaly status", err);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[70vh] w-full">
        <div className="w-12 h-12 border-4 border-neonBlue border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const activeAnomalies = anomalies.filter(a => a.status === 'open');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
          Suspicious Activity & Anomaly Alerts
        </h2>
        <p className="text-gray-300 text-sm">
          Unsupervised Isolation Forest scanning flags transaction spikes, bizarre timestamps, or abnormal volume metrics.
        </p>
      </div>

      {/* Grid count alerts */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <GlassCard className="relative overflow-hidden group">
          <span className="text-xs font-bold text-gray-300 block uppercase tracking-wider mb-2">Flagged Incidents</span>
          <h3 className={`text-3xl font-black mb-1 ${activeAnomalies.length > 0 ? 'text-neonRed font-black' : 'text-neonGreen'}`}>
            {activeAnomalies.length} active
          </h3>
          <p className="text-xs text-gray-300">Requires manual confirmation review</p>
        </GlassCard>

        <GlassCard className="relative overflow-hidden group">
          <span className="text-xs font-bold text-gray-300 block uppercase tracking-wider mb-2">Isolation Contamination</span>
          <h3 className="text-3xl font-black text-white mb-1">2.0%</h3>
          <p className="text-xs text-gray-300">Configured baseline sensitivity margin</p>
        </GlassCard>

        <GlassCard className="relative overflow-hidden group">
          <span className="text-xs font-bold text-gray-300 block uppercase tracking-wider mb-2">Security Status</span>
          <h3 className="text-3xl font-black text-neonGreen mb-1">Fully Guarded</h3>
          <p className="text-xs text-gray-300">Real-time isolation filters running</p>
        </GlassCard>
      </div>

      {/* Anomalies List cards */}
      <div className="space-y-4">
        {activeAnomalies.length > 0 ? (
          <AnimatePresence>
            {activeAnomalies.map((a) => (
              <motion.div
                key={a.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.2 }}
                className="w-full"
              >
                <GlassCard 
                  hoverEffect={false}
                  className="border border-neonRed/20 bg-neonRed/5 relative overflow-hidden"
                >
                  {/* Neon Glow Side bar */}
                  <div className="absolute top-0 bottom-0 left-0 w-1.5 bg-neonRed"></div>

                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 pl-4">
                    {/* Anomaly Details */}
                    <div className="flex-1 space-y-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="px-2 py-0.5 rounded bg-neonRed/20 border border-neonRed/40 text-neonRed font-black text-[10px] uppercase tracking-wider">
                          Risk Score: {a.risk_score.toFixed(0)}%
                        </span>
                        <span className="text-xs text-gray-300 flex items-center gap-1 font-semibold">
                          <Calendar size={14} /> 
                          {new Date(a.transaction.date).toLocaleDateString()} at {new Date(a.transaction.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      
                      <h3 className="text-xl font-bold text-white">
                        {a.transaction.description}
                      </h3>
                      
                      <p className="text-sm text-gray-300 flex items-center gap-1.5">
                        <ShieldAlert size={16} className="text-neonRed shrink-0" />
                        <span className="font-semibold text-neonRed">Flags:</span> 
                        <span className="text-gray-300">{a.reason}</span>
                      </p>

                      <div className="flex gap-4 text-xs text-gray-300 font-semibold pt-1">
                        <span>Category: <strong className="text-gray-300">{a.transaction.category}</strong></span>
                        <span>Gateway: <strong className="text-gray-300">{a.transaction.source}</strong></span>
                      </div>
                    </div>

                    {/* Cost Amount & Action Buttons */}
                    <div className="text-left md:text-right space-y-3 shrink-0 w-full md:w-auto">
                      <span className="text-2xl font-black text-neonRed block">
                        -₹{a.transaction.amount.toLocaleString()}
                      </span>
                      
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleAction(a.id, 'ignored')}
                          className="px-3.5 py-2 border border-glassBorder hover:border-white/10 bg-white/5 text-xs font-bold text-gray-300 rounded-xl hover:text-white transition-all flex items-center gap-1 cursor-pointer"
                        >
                          <XCircle size={14} />
                          Dismiss
                        </button>
                        <button
                          onClick={() => handleAction(a.id, 'confirmed')}
                          className="px-3.5 py-2 bg-neonRed text-white text-xs font-bold rounded-xl hover:brightness-110 active:scale-[0.98] transition-all flex items-center gap-1 cursor-pointer hover:shadow-neon-glow"
                        >
                          <CheckCircle2 size={14} />
                          Confirm Alert
                        </button>
                      </div>
                    </div>
                  </div>
                </GlassCard>
              </motion.div>
            ))}
          </AnimatePresence>
        ) : (
          <div className="text-center py-12 glass-panel rounded-2xl p-8 border border-glassBorder">
            <span className="text-5xl">🛡️</span>
            <h4 className="text-lg font-bold text-white mt-4">Zero Suspicious Spikes Detected</h4>
            <p className="text-sm text-gray-300 mt-2">
              All transactions parsed successfully within expected Isolation Forest bounds.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Anomalies;
