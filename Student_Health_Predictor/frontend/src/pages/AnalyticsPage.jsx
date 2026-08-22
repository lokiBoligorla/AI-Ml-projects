import React, { useState, useEffect } from 'react';
import { analyticsAPI } from '../services/api';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts';
import { BarChart2, Moon, Clock, GraduationCap, Video } from 'lucide-react';
import GlassCard from '../components/GlassCard';

const AnalyticsPage = () => {
  const [trends, setTrends] = useState({ has_data: false, summary: {}, chart_data: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadAnalytics = async () => {
      try {
        const res = await analyticsAPI.getTrends();
        setTrends(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadAnalytics();
  }, []);

  if (loading) {
    return (
      <div className="flex h-full w-full items-center justify-center text-primary-500 py-24">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-t-transparent border-primary-500"></div>
      </div>
    );
  }

  const { has_data, summary, chart_data } = trends;

  if (!has_data) {
    return (
      <GlassCard className="flex flex-col items-center justify-center text-center p-12 gap-5" glow={true}>
        <div className="p-4 rounded-full bg-primary-600/10 border border-primary-500/20">
          <BarChart2 className="h-12 w-12 text-primary-500" />
        </div>
        <div>
          <h3 className="text-xl font-bold text-white">No Analytics Available Yet</h3>
          <p className="text-sm text-gray-400 mt-2 max-w-lg leading-relaxed">
            Once you log at least one mental check-in survey, this page will unlock multi-dimensional charts comparing your screen time budgets, sleep schedules, and exercise trends directly against your mental health indexes.
          </p>
        </div>
      </GlassCard>
    );
  }

  return (
    <div className="flex flex-col gap-8 w-full">
      <div>
        <h1 className="text-3xl font-extrabold text-white tracking-tight">Advanced Wellness Analytics</h1>
        <p className="text-sm text-gray-400 mt-1">Multi-dimensional correlation charts detailing physical baseline habits vs. mental wellness ratings.</p>
      </div>

      {/* Habits Summary Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <GlassCard className="flex flex-col gap-1.5" hoverEffect={false}>
          <div className="flex items-center gap-2 text-indigo-400">
            <Moon className="h-4.5 w-4.5" />
            <span className="text-xs font-bold uppercase tracking-wider">Mean Sleep</span>
          </div>
          <span className="text-3xl font-extrabold text-white tracking-tight">{summary.average_sleep}h</span>
          <span className="text-[10px] text-gray-500">Target baseline: 7.5 hrs/night</span>
        </GlassCard>

        <GlassCard className="flex flex-col gap-1.5" hoverEffect={false}>
          <div className="flex items-center gap-2 text-purple-400">
            <Clock className="h-4.5 w-4.5" />
            <span className="text-xs font-bold uppercase tracking-wider">Mean Study</span>
          </div>
          <span className="text-3xl font-extrabold text-white tracking-tight">{summary.average_study}h</span>
          <span className="text-[10px] text-gray-500">Active classroom & reading prep</span>
        </GlassCard>

        <GlassCard className="flex flex-col gap-1.5" hoverEffect={false}>
          <div className="flex items-center gap-2 text-emerald-400">
            <GraduationCap className="h-4.5 w-4.5" />
            <span className="text-xs font-bold uppercase tracking-wider">Mean Exercise</span>
          </div>
          <span className="text-3xl font-extrabold text-white tracking-tight">{summary.average_exercise}h</span>
          <span className="text-[10px] text-gray-500">Cardio & weights balance</span>
        </GlassCard>

        <GlassCard className="flex flex-col gap-1.5" hoverEffect={false}>
          <div className="flex items-center gap-2 text-pink-400">
            <Video className="h-4.5 w-4.5" />
            <span className="text-xs font-bold uppercase tracking-wider">Mean Screen</span>
          </div>
          <span className="text-3xl font-extrabold text-white tracking-tight">{summary.average_screen}h</span>
          <span className="text-[10px] text-gray-500">Digital screen exposure index</span>
        </GlassCard>
      </div>

      {/* Grid of charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Chart 1: Sleep vs Screen time vs Wellness Score */}
        <GlassCard className="flex flex-col gap-4">
          <div>
            <h3 className="font-bold text-base text-white">Habits vs. Wellness Correlation</h3>
            <p className="text-xs text-gray-400">Comparing your sleep hours, screen time, and wellness score over time</p>
          </div>
          <div className="h-[260px] w-full mt-2">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chart_data} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(0, 0, 0, 0.06)" />
                <XAxis dataKey="date" stroke="#475569" fontSize={11} tickLine={false} />
                <YAxis stroke="#1e293b" fontSize={11} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#ffffff',
                    borderColor: 'rgba(0, 0, 0, 0.08)',
                    borderRadius: '16px',
                    color: '#0f172a'
                  }}
                />
                <Legend fontSize={10} verticalAlign="top" height={36} iconType="circle" />
                <Line type="monotone" dataKey="sleep_hours" name="Sleep Hours" stroke="#818cf8" strokeWidth={2} dot={{ r: 3 }} />
                <Line type="monotone" dataKey="screen_time" name="Screen Time" stroke="#f472b6" strokeWidth={2} dot={{ r: 3 }} />
                <Line type="monotone" dataKey="wellness_score" name="Wellness %" stroke="#10b981" strokeWidth={2.5} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>

        {/* Chart 2: Study Hours vs Academic Pressure */}
        <GlassCard className="flex flex-col gap-4">
          <div>
            <h3 className="font-bold text-base text-white">Study Load vs. Stress Level</h3>
            <p className="text-xs text-gray-400">Plotting study hours alongside your predicted stress levels (0=Low, 2=High)</p>
          </div>
          <div className="h-[260px] w-full mt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chart_data} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(0, 0, 0, 0.06)" />
                <XAxis dataKey="date" stroke="#475569" fontSize={11} tickLine={false} />
                <YAxis stroke="#1e293b" fontSize={11} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#ffffff',
                    borderColor: 'rgba(0, 0, 0, 0.08)',
                    borderRadius: '16px',
                    color: '#0f172a'
                  }}
                />
                <Legend fontSize={10} verticalAlign="top" height={36} iconType="circle" />
                <Bar dataKey="study_hours" name="Study Hours" fill="#a78bfa" fillOpacity={0.75} stroke="#a78bfa" strokeWidth={1} radius={[4, 4, 0, 0]} />
                <Bar dataKey="academic_pressure" name="Academic Pressure" fill="#f59e0b" fillOpacity={0.75} stroke="#f59e0b" strokeWidth={1} radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>

      </div>
    </div>
  );
};

export default AnalyticsPage;
