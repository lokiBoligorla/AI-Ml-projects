import React, { useState, useEffect } from 'react';
import { adminAPI } from '../services/api';
import { 
  Users, 
  Activity, 
  Flame, 
  Heart, 
  AlertTriangle, 
  ShieldAlert, 
  Cpu, 
  TrendingUp 
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts';
import GlassCard from '../components/GlassCard';

const AdminPanel = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchAdminStats = async () => {
      try {
        const res = await adminAPI.getDashboard();
        setData(res.data);
      } catch (err) {
        console.error(err);
        setError("Unauthorized or failed to load administrative credentials.");
      } finally {
        setLoading(false);
      }
    };
    fetchAdminStats();
  }, []);

  if (loading) {
    return (
      <div className="flex h-full w-full items-center justify-center text-primary-500 py-24">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-t-transparent border-primary-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <GlassCard className="flex flex-col items-center justify-center text-center p-12 gap-5" glow={true}>
        <div className="p-4 rounded-full bg-red-500/10 border border-red-500/20">
          <ShieldAlert className="h-12 w-12 text-red-500" />
        </div>
        <div>
          <h3 className="text-xl font-bold text-white">Access Violation</h3>
          <p className="text-sm text-gray-400 mt-2 max-w-lg leading-relaxed">
            {error} You must be authenticated as an administrative supervisor to access student health records.
          </p>
        </div>
      </GlassCard>
    );
  }

  const { stats, distributions, high_risk_students, model_metrics } = data;

  // Format model validation metrics for Recharts
  // model_metrics = { "random_forest": { "stress_acc": ..., "burnout_acc": ..., "wellness_r2": ... }, "xgboost": { ... } }
  const modelChartData = model_metrics?.random_forest ? [
    {
      metric: 'Stress Level Acc',
      'Random Forest': parseFloat((model_metrics.random_forest.stress_accuracy * 100).toFixed(1)),
      'XGBoost': parseFloat((model_metrics.xgboost.stress_accuracy * 100).toFixed(1)),
    },
    {
      metric: 'Burnout Risk Acc',
      'Random Forest': parseFloat((model_metrics.random_forest.burnout_accuracy * 100).toFixed(1)),
      'XGBoost': parseFloat((model_metrics.xgboost.burnout_accuracy * 100).toFixed(1)),
    },
    {
      metric: 'Wellness Score R2',
      'Random Forest': parseFloat((model_metrics.random_forest.wellness_r2 * 100).toFixed(1)),
      'XGBoost': parseFloat((model_metrics.xgboost.wellness_r2 * 100).toFixed(1)),
    }
  ] : [];

  const getWellnessColor = (score) => {
    if (score >= 70) return 'text-emerald-400';
    if (score >= 50) return 'text-amber-400';
    return 'text-red-400';
  };

  const getStatusLabel = (level) => {
    return ["Low", "Moderate", "High"][level];
  };

  const getStatusColor = (level) => {
    if (level === 0) return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';
    if (level === 1) return 'text-amber-400 bg-amber-500/10 border-amber-500/20';
    return 'text-red-400 bg-red-500/10 border-red-500/20';
  };

  return (
    <div className="flex flex-col gap-8 w-full">
      <div>
        <h1 className="text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
          <ShieldAlert className="h-8 w-8 text-primary-500" />
          Administrative Portal
        </h1>
        <p className="text-sm text-gray-400 mt-1">Global statistics, diagnostic distributions, and machine learning pipeline metrics.</p>
      </div>

      {/* Aggregate Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <GlassCard className="flex items-center gap-4" hoverEffect={false}>
          <div className="p-3.5 rounded-2xl bg-primary-600/10 border border-primary-500/20">
            <Users className="h-6 w-6 text-primary-400" />
          </div>
          <div className="flex flex-col">
            <span className="text-2xl font-extrabold text-white">{stats.total_students}</span>
            <span className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold">Registered Students</span>
          </div>
        </GlassCard>

        <GlassCard className="flex items-center gap-4" hoverEffect={false}>
          <div className="p-3.5 rounded-2xl bg-indigo-600/10 border border-indigo-500/20">
            <TrendingUp className="h-6 w-6 text-indigo-400" />
          </div>
          <div className="flex flex-col">
            <span className="text-2xl font-extrabold text-white">{stats.total_predictions}</span>
            <span className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold">Diagnostic Sessions</span>
          </div>
        </GlassCard>

        <GlassCard className="flex items-center gap-4" hoverEffect={false}>
          <div className="p-3.5 rounded-2xl bg-emerald-600/10 border border-emerald-500/20">
            <Heart className="h-6 w-6 text-emerald-400" />
          </div>
          <div className="flex flex-col">
            <span className="text-2xl font-extrabold text-white">{stats.average_wellness_score}%</span>
            <span className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold">Campus Mean Wellness</span>
          </div>
        </GlassCard>

        <GlassCard className="flex items-center gap-4" hoverEffect={false}>
          <div className="p-3.5 rounded-2xl bg-amber-600/10 border border-amber-500/20">
            <Activity className="h-6 w-6 text-amber-400" />
          </div>
          <div className="flex flex-col">
            <span className="text-2xl font-extrabold text-white">{getStatusLabel(Math.round(stats.average_stress_level))}</span>
            <span className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold">Campus Mean Stress</span>
          </div>
        </GlassCard>
      </div>

      {/* Model validation graphs and distributions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Machine Learning Pipeline Metrics */}
        {modelChartData.length > 0 && (
          <GlassCard className="lg:col-span-2 flex flex-col gap-4">
            <div className="flex items-center gap-2 border-b border-white/5 pb-3">
              <Cpu className="h-5 w-5 text-indigo-400" />
              <div>
                <h3 className="font-bold text-base text-white">ML Core Model Validation</h3>
                <p className="text-xs text-gray-400">Comparing F1 Accuracy and R2 regression indices (%)</p>
              </div>
            </div>
            <div className="h-[250px] w-full mt-2 pr-2">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={modelChartData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(0, 0, 0, 0.06)" />
                  <XAxis dataKey="metric" stroke="#475569" fontSize={11} tickLine={false} />
                  <YAxis domain={[0, 100]} stroke="#1e293b" fontSize={11} tickLine={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#ffffff',
                      borderColor: 'rgba(0, 0, 0, 0.08)',
                      borderRadius: '16px',
                      color: '#0f172a'
                    }}
                  />
                  <Legend fontSize={10} verticalAlign="top" height={36} iconType="circle" />
                  <Bar dataKey="Random Forest" fill="#818cf8" fillOpacity={0.8} stroke="#818cf8" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="XGBoost" fill="#a78bfa" fillOpacity={0.8} stroke="#a78bfa" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </GlassCard>
        )}

        {/* Stress Distributions */}
        <GlassCard className="lg:col-span-1 flex flex-col gap-4">
          <div className="flex items-center gap-2 border-b border-white/5 pb-3">
            <Activity className="h-5 w-5 text-amber-400" />
            <div>
              <h3 className="font-bold text-base text-white">Stress Level Distribution</h3>
              <p className="text-xs text-gray-400">Proportion of campus student records logged</p>
            </div>
          </div>
          <div className="flex flex-col gap-4 mt-2 justify-center h-full">
            <div className="flex justify-between items-center bg-emerald-500/5 border border-emerald-500/10 p-3.5 rounded-2xl">
              <span className="text-sm font-semibold text-emerald-400">Low Stress Students</span>
              <span className="text-lg font-bold text-white">{distributions.stress.low} check-ins</span>
            </div>

            <div className="flex justify-between items-center bg-amber-500/5 border border-amber-500/10 p-3.5 rounded-2xl">
              <span className="text-sm font-semibold text-amber-400">Moderate Stress Students</span>
              <span className="text-lg font-bold text-white">{distributions.stress.medium} check-ins</span>
            </div>

            <div className="flex justify-between items-center bg-red-500/5 border border-red-500/10 p-3.5 rounded-2xl">
              <span className="text-sm font-semibold text-red-400">High Stress Students</span>
              <span className="text-lg font-bold text-white">{distributions.stress.high} check-ins</span>
            </div>
          </div>
        </GlassCard>

      </div>

      {/* High-Risk Student Roster */}
      <GlassCard className="flex flex-col gap-4 overflow-hidden">
        <div className="flex items-center gap-2.5 border-b border-white/5 pb-3">
          <AlertTriangle className="h-5 w-5 text-red-400" />
          <div>
            <h3 className="font-bold text-lg text-white">High-Risk Student Support Roster</h3>
            <p className="text-xs text-gray-400">Students with High Stress, High Burnout, or Wellness Scores &lt; 50%</p>
          </div>
        </div>
        
        {high_risk_students.length === 0 ? (
          <div className="py-8 text-center text-sm text-gray-400">
            No students flagged in high-risk zones currently. Fantastic!
          </div>
        ) : (
          <div className="overflow-x-auto w-full">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="border-b border-white/5 text-gray-400 text-xs uppercase">
                  <th className="py-3 px-4 font-semibold">Student Name</th>
                  <th className="py-3 px-4 font-semibold">Email</th>
                  <th className="py-3 px-4 font-semibold">Wellness Rating</th>
                  <th className="py-3 px-4 font-semibold">Stress level</th>
                  <th className="py-3 px-4 font-semibold">Burnout Risk</th>
                  <th className="py-3 px-4 font-semibold">Logged At</th>
                </tr>
              </thead>
              <tbody>
                {high_risk_students.map((stud) => (
                  <tr key={stud.id} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                    <td className="py-3.5 px-4 font-bold text-white">{stud.student_name}</td>
                    <td className="py-3.5 px-4 text-gray-300">{stud.student_email}</td>
                    <td className={`py-3.5 px-4 font-extrabold ${getWellnessColor(stud.wellness_score)}`}>
                      {stud.wellness_score}%
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`px-2 py-0.5 rounded-md text-xs border ${getStatusColor(stud.stress_level)}`}>
                        {getStatusLabel(stud.stress_level)}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`px-2 py-0.5 rounded-md text-xs border ${getStatusColor(stud.burnout_risk)}`}>
                        {getStatusLabel(stud.burnout_risk)}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-xs text-gray-400">{stud.logged_at}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </GlassCard>
    </div>
  );
};

export default AdminPanel;
