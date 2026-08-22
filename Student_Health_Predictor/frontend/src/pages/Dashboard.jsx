import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { analyticsAPI, predictionAPI } from '../services/api';
import { 
  Heart, 
  Activity, 
  Flame, 
  Moon, 
  Clock, 
  Calendar, 
  Download, 
  ChevronRight, 
  AlertTriangle 
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';
import GlassCard from '../components/GlassCard';

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [trends, setTrends] = useState({ has_data: false, summary: {}, chart_data: [] });
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = async () => {
    try {
      const trendsRes = await analyticsAPI.getTrends();
      setTrends(trendsRes.data);
      
      const historyRes = await predictionAPI.getHistory();
      setHistory(historyRes.data);
    } catch (err) {
      console.error("Error loading dashboard metrics:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const getWellnessColor = (score) => {
    if (score >= 75) return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';
    if (score >= 50) return 'text-amber-400 bg-amber-500/10 border-amber-500/20';
    return 'text-red-400 bg-red-500/10 border-red-500/20';
  };

  const getStatusLabel = (level) => {
    return ["Low", "Moderate", "High"][level] || "N/A";
  };

  const getStatusColor = (level) => {
    if (level === 0) return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';
    if (level === 1) return 'text-amber-400 bg-amber-500/10 border-amber-500/20';
    return 'text-red-400 bg-red-500/10 border-red-500/20';
  };

  if (loading) {
    return (
      <div className="flex h-full w-full items-center justify-center text-primary-500 py-24">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-t-transparent border-primary-500"></div>
      </div>
    );
  }

  const { has_data, summary, chart_data } = trends;

  return (
    <div className="flex flex-col gap-8 w-full">
      {/* Header Bio banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">
            Welcome back, <span className="bg-gradient-to-r from-primary-600 to-purple-600 bg-clip-text text-transparent">{user?.name}</span>!
          </h1>
          <p className="text-sm text-gray-400 mt-1">Here is a diagnostics overview of your current academic wellness and lifestyle trends.</p>
        </div>
        <button
          onClick={() => navigate('/predict')}
          className="glow-btn px-6 py-3 rounded-2xl bg-gradient-to-r from-primary-600 to-purple-600 text-white font-bold text-sm shadow-xl shadow-primary-500/10 self-start md:self-auto hover:scale-105 active:scale-95 transition-all"
        >
          New Mental Check-in
        </button>
      </div>

      {/* If no check-ins logged yet */}
      {!has_data ? (
        <GlassCard className="flex flex-col items-center justify-center text-center p-12 gap-5" glow={true}>
          <div className="p-4 rounded-full bg-primary-600/10 border border-primary-500/20">
            <Heart className="h-12 w-12 text-primary-500 animate-pulse" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-white">Unlock Your Personalized Wellness Blueprint</h3>
            <p className="text-sm text-gray-400 mt-2 max-w-lg leading-relaxed">
              Submit your academic pressure level, sleep duration, exercise hours, and study habits. Our machine learning models will immediately calculate your burnout indicators and build a health roadmap.
            </p>
          </div>
          <button
            onClick={() => navigate('/predict')}
            className="px-6 py-3.5 rounded-2xl bg-primary-600 text-white font-bold text-sm shadow-xl shadow-primary-500/20 hover:bg-primary-500 transition-all"
          >
            Take First Assessment Now
          </button>
        </GlassCard>
      ) : (
        <>
          {/* Diagnostic Core Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <GlassCard className="flex items-center justify-between border-l-4 border-l-primary-500">
              <div className="flex flex-col gap-1">
                <span className="text-xs text-gray-400 font-semibold uppercase tracking-wider">Wellness Score</span>
                <span className="text-4xl font-extrabold text-white tracking-tight">{summary.latest_wellness}%</span>
                <span className="text-[10px] text-gray-400 mt-1">Calibrated diagnostics score</span>
              </div>
              <div className={`p-4 rounded-2xl border ${getWellnessColor(summary.latest_wellness)}`}>
                <Heart className="h-6 w-6 text-current" />
              </div>
            </GlassCard>

            <GlassCard className="flex items-center justify-between border-l-4 border-l-amber-500">
              <div className="flex flex-col gap-1">
                <span className="text-xs text-gray-400 font-semibold uppercase tracking-wider">Stress Index</span>
                <span className="text-4xl font-extrabold text-white tracking-tight">
                  {getStatusLabel(summary.latest_stress)}
                </span>
                <span className="text-[10px] text-gray-400 mt-1">Academic & Financial strains</span>
              </div>
              <div className={`p-4 rounded-2xl border ${getStatusColor(summary.latest_stress)}`}>
                <Activity className="h-6 w-6 text-current" />
              </div>
            </GlassCard>

            <GlassCard className="flex items-center justify-between border-l-4 border-l-red-500">
              <div className="flex flex-col gap-1">
                <span className="text-xs text-gray-400 font-semibold uppercase tracking-wider">Burnout Risk</span>
                <span className="text-4xl font-extrabold text-white tracking-tight">
                  {getStatusLabel(summary.latest_burnout)}
                </span>
                <span className="text-[10px] text-gray-400 mt-1">Hours study vs sleep ratio</span>
              </div>
              <div className={`p-4 rounded-2xl border ${getStatusColor(summary.latest_burnout)}`}>
                <Flame className="h-6 w-6 text-current" />
              </div>
            </GlassCard>
          </div>

          {/* Core Analytics Chart (Recharts) */}
          <GlassCard className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-lg text-white">Mental Wellness Trajectory</h3>
                <p className="text-xs text-gray-400">Chronological analysis of calibrated health ratings</p>
              </div>
            </div>
            <div className="h-[280px] w-full mt-2">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chart_data} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorWellness" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0.0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(0, 0, 0, 0.06)" />
                  <XAxis dataKey="date" stroke="#475569" fontSize={11} tickLine={false} />
                  <YAxis domain={[0, 100]} stroke="#1e293b" fontSize={11} tickLine={false} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#ffffff', 
                      borderColor: 'rgba(0,0,0,0.08)',
                      borderRadius: '16px',
                      color: '#0f172a' 
                    }} 
                  />
                  <Area type="monotone" dataKey="wellness_score" name="Wellness Score" stroke="#6366f1" strokeWidth={2.5} fillOpacity={1} fill="url(#colorWellness)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </GlassCard>

          {/* Quick Metrics Bar & Historical Table */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Quick Metrics Bar */}
            <GlassCard className="lg:col-span-1 flex flex-col gap-4">
              <h4 className="font-bold text-white text-base">Lifestyle Baseline</h4>
              <div className="flex flex-col gap-3.5">
                <div className="flex items-center justify-between p-3 rounded-2xl bg-white/5 border border-white/5">
                  <div className="flex items-center gap-3">
                    <Moon className="h-5 w-5 text-indigo-400" />
                    <span className="text-sm font-medium text-gray-300">Average Sleep</span>
                  </div>
                  <span className="text-sm font-bold text-white">{summary.average_sleep} hrs</span>
                </div>

                <div className="flex items-center justify-between p-3 rounded-2xl bg-white/5 border border-white/5">
                  <div className="flex items-center gap-3">
                    <Clock className="h-5 w-5 text-purple-400" />
                    <span className="text-sm font-medium text-gray-300">Average Study</span>
                  </div>
                  <span className="text-sm font-bold text-white">{summary.average_study} hrs</span>
                </div>

                <div className="flex items-center justify-between p-3 rounded-2xl bg-white/5 border border-white/5">
                  <div className="flex items-center gap-3">
                    <Calendar className="h-5 w-5 text-emerald-400" />
                    <span className="text-sm font-medium text-gray-300">Exercise Duration</span>
                  </div>
                  <span className="text-sm font-bold text-white">{summary.average_exercise} hrs</span>
                </div>

                {/* If Wellness score is critical */}
                {summary.latest_wellness < 50.0 && (
                  <div className="p-3.5 rounded-2xl bg-red-500/10 border border-red-500/20 text-xs text-red-400 flex gap-2.5 leading-normal">
                    <AlertTriangle className="h-5 w-5 flex-shrink-0 mt-0.5" />
                    <span>Your wellness index is critical. Consider talking to university counselors or clicking our AI Advisor bot for tips.</span>
                  </div>
                )}
              </div>
            </GlassCard>

            {/* Check-in Log Table */}
            <GlassCard className="lg:col-span-2 flex flex-col gap-4 overflow-hidden">
              <h4 className="font-bold text-white text-base">Check-in Logs</h4>
              <div className="overflow-x-auto w-full">
                <table className="w-full text-left text-sm border-collapse">
                  <thead>
                    <tr className="border-b border-white/5 text-gray-400 text-xs uppercase">
                      <th className="py-3 px-4 font-semibold">Date</th>
                      <th className="py-3 px-4 font-semibold">Wellness Score</th>
                      <th className="py-3 px-4 font-semibold">Stress Index</th>
                      <th className="py-3 px-4 font-semibold">Engine Used</th>
                      <th className="py-3 px-4 font-semibold text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {history.slice(0, 5).map((log) => (
                      <tr key={log.id} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                        <td className="py-3.5 px-4 font-medium text-gray-300">
                          {new Date(log.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: '2-digit' })}
                        </td>
                        <td className="py-3.5 px-4 font-bold text-white">
                          <span className={`px-2.5 py-1 rounded-md text-xs font-bold border ${getWellnessColor(log.wellness_score)}`}>
                            {roundValue(log.wellness_score)}%
                          </span>
                        </td>
                        <td className="py-3.5 px-4">
                          <span className={`px-2 py-0.5 rounded-full text-xs border ${getStatusColor(log.stress_level)}`}>
                            {getStatusLabel(log.stress_level)}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-xs text-gray-400">{log.model_used}</td>
                        <td className="py-3.5 px-4 text-right flex items-center justify-end gap-2.5">
                          <a
                            href={predictionAPI.getReportUrl(log.id)}
                            className="p-2 text-gray-400 hover:text-white rounded-lg hover:bg-white/5 transition-all"
                            title="Download PDF report"
                          >
                            <Download className="h-4.5 w-4.5" />
                          </a>
                          <button
                            onClick={() => navigate(`/results?id=${log.id}`)}
                            className="p-2 text-primary-400 hover:text-white rounded-lg hover:bg-white/5 transition-all"
                            title="View details"
                          >
                            <ChevronRight className="h-4.5 w-4.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </GlassCard>
          </div>
        </>
      )}
    </div>
  );
};

const roundValue = (val) => {
  return typeof val === 'number' ? val.toFixed(1) : val;
};

export default Dashboard;
