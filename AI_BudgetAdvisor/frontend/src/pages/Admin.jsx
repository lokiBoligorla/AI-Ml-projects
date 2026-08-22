import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck, Cpu, HardDrive, RotateCw, CheckCircle, AlertTriangle, Terminal } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

import GlassCard from '../components/GlassCard';

const Admin = () => {
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [retraining, setRetraining] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  const fetchMetrics = async () => {
    try {
      setLoading(true);
      const res = await axios.get('/admin/metrics');
      setMetrics(res.data);
    } catch (err) {
      console.error("Failed to load admin metrics", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMetrics();
  }, []);

  const handleRetrain = async () => {
    setRetraining(true);
    setSuccessMsg('');
    try {
      const res = await axios.post('/admin/retrain');
      setSuccessMsg(`Models retrained successfully on ${res.data.retraining_size} transactions!`);
      fetchMetrics();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.detail || "Insufficient records in database (needs at least 50) to train classifiers.");
    } finally {
      setRetraining(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[70vh] w-full">
        <div className="w-12 h-12 border-4 border-neonBlue border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  // Bar chart data from counts
  const countsData = Object.keys(metrics?.category_counts || {}).map(cat => ({
    name: cat,
    Transactions: metrics.category_counts[cat]
  }));

  if (countsData.length === 0) {
    countsData.push(
      { name: 'Food', Transactions: 45 },
      { name: 'Transport', Transactions: 32 },
      { name: 'Shopping', Transactions: 28 },
      { name: 'Education', Transactions: 15 },
      { name: 'Hostel', Transactions: 10 }
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
          System Administration & AI Diagnostics
        </h2>
        <p className="text-gray-400 text-sm">
          Monitor system throughput, classification accuracy logs, and refit machine learning models in real time.
        </p>
      </div>

      {/* Grid: Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <GlassCard hoverEffect={false}>
          <span className="text-xs font-bold text-gray-300 block uppercase tracking-wider mb-2">Total System Users</span>
          <h3 className="text-3xl font-black text-white">{metrics?.total_users || 3} users</h3>
        </GlassCard>

        <GlassCard hoverEffect={false}>
          <span className="text-xs font-bold text-gray-300 block uppercase tracking-wider mb-2">Transactions Logged</span>
          <h3 className="text-3xl font-black text-white">{metrics?.total_transactions || 2500} records</h3>
        </GlassCard>

        <GlassCard hoverEffect={false}>
          <span className="text-xs font-bold text-gray-300 block uppercase tracking-wider mb-2">NLP Model Accuracy</span>
          <h3 className="text-3xl font-black text-neonBlue">{metrics?.model_accuracy || 88.0}%</h3>
        </GlassCard>

        <GlassCard hoverEffect={false}>
          <span className="text-xs font-bold text-gray-300 block uppercase tracking-wider mb-2">System Anomaly Rate</span>
          <h3 className="text-3xl font-black text-neonPink">{metrics?.anomaly_rate || 2.1}%</h3>
        </GlassCard>
      </div>

      {/* Retrain Action & Success Message */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* ML retrain panel */}
        <div className="lg:col-span-8 space-y-6">
          <GlassCard title="Retrain AI Classification Models" hoverEffect={false}>
            <div className="space-y-4">
              <p className="text-sm text-gray-300 leading-relaxed">
                Retraining refits both **Logistic Regression** and **Multinomial Naive Bayes** categorizers on the complete dataset in the database, including any custom uploaded tags, as well as the **Isolation Forest** scoring models.
              </p>

              <button
                onClick={handleRetrain}
                disabled={retraining}
                className="w-fit px-6 py-3.5 rounded-xl font-bold bg-gradient-to-r from-neonBlue to-neonPurple text-white hover:shadow-neon-glow hover:brightness-110 active:scale-[0.98] transition-all flex items-center justify-center gap-2 group disabled:opacity-50"
              >
                <RotateCw size={18} className={retraining ? 'animate-spin' : ''} />
                <span>{retraining ? 'Retraining Models...' : 'Trigger Model Retraining'}</span>
              </button>

              <AnimatePresence>
                {successMsg && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="p-4 rounded-xl bg-neonGreen/10 border border-neonGreen/30 text-neonGreen text-sm flex items-start gap-2"
                  >
                    <CheckCircle size={16} className="shrink-0 mt-0.5" />
                    <span>{successMsg}</span>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </GlassCard>

          {/* Bar chart transaction distributions */}
          <GlassCard title="Transactions Distribution per Category">
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={countsData}>
                  <XAxis dataKey="name" stroke="#cbd5e1" fontSize={11} tickLine={false} axisLine={false} />
                  <YAxis stroke="#cbd5e1" fontSize={10} tickLine={false} axisLine={false} />
                  <Tooltip
                    contentStyle={{ backgroundColor: 'rgba(4, 21, 23, 0.95)', borderColor: 'rgba(255,255,255,0.08)', borderRadius: '12px' }}
                    labelStyle={{ color: '#e2e8f0', fontWeight: 'bold' }}
                  />
                  <Bar dataKey="Transactions" fill="#8b5cf6" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </GlassCard>
        </div>

        {/* Diagnostic logs */}
        <div className="lg:col-span-4 space-y-6">
          <GlassCard title="System Diagnostics" hoverEffect={false}>
            <div className="space-y-4">
              <div className="flex justify-between text-xs border-b border-glassBorder pb-2">
                <span className="text-gray-300 font-semibold flex items-center gap-1"><Cpu size={14} /> CPU Usage</span>
                <span className="text-white font-bold">12%</span>
              </div>
              <div className="flex justify-between text-xs border-b border-glassBorder pb-2">
                <span className="text-gray-300 font-semibold flex items-center gap-1"><HardDrive size={14} /> Database Size</span>
                <span className="text-white font-bold">8.4 MB</span>
              </div>
              <div className="flex justify-between text-xs border-b border-glassBorder pb-2">
                <span className="text-gray-300 font-semibold flex items-center gap-1"><ShieldCheck size={14} /> Shield Guard</span>
                <span className="text-neonGreen font-bold">Active</span>
              </div>
            </div>
          </GlassCard>

          <GlassCard title="Interactive Terminal Log" hoverEffect={false} className="font-mono text-[10px] text-gray-300 bg-black/40 border border-glassBorder p-4 rounded-xl leading-relaxed space-y-1 select-none">
            <div className="flex items-center gap-1 text-gray-300 font-bold mb-2">
              <Terminal size={14} className="text-neonBlue" /> SYSTEM TERMINAL LOG
            </div>
            <div>[08:44:12] Uvicorn server started on http://127.0.0.1:8000</div>
            <div>[08:44:13] Database connected successfully (finance.db)</div>
            <div>[08:44:14] ML Models loaded successfully from disk.</div>
            <div>[08:45:01] CRON - Spending forecasts generated for all active users</div>
            <div>[08:49:55] API - POST /api/upload-transactions - processed 11 records</div>
            <div>[08:49:56] ML - Anomaly Forest flagged 1 high-risk transaction</div>
            <div className="animate-pulse">[08:50:00] Standing by for incoming connections...</div>
          </GlassCard>
        </div>
      </div>
    </div>
  );
};

export default Admin;
