import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { 
  ArrowUpRight, 
  ArrowDownRight, 
  TrendingUp, 
  AlertTriangle, 
  Sparkles, 
  DollarSign, 
  Calendar,
  Layers,
  ArrowRight
} from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, AreaChart, Area, XAxis, YAxis } from 'recharts';

import GlassCard from '../components/GlassCard';

const COLORS = ['#3b82f6', '#8b5cf6', '#ec4899', '#10b981', '#f59e0b', '#ef4444', '#06b6d4', '#6366f1', '#a855f7', '#6b7280'];

const Dashboard = ({ user }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [month, setMonth] = useState(new Date().strftime?.("%Y-%m") || new Date().toISOString().substring(0, 7));

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`/analytics/summary?month=${month}`);
        setData(res.data);
      } catch (err) {
        console.error("Failed to load dashboard summary", err);
      } finally {
        setLoading(false);
      }
    };
    fetchSummary();
  }, [month]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[70vh] w-full">
        <div className="w-12 h-12 border-4 border-neonBlue border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  // Pre-process categories for Pie Chart
  const categoryData = [];
  if (data?.recent_transactions) {
    const map = {};
    data.recent_transactions.forEach(tx => {
      if (tx.type === 'expense') {
        map[tx.category] = (map[tx.category] || 0) + tx.amount;
      }
    });
    Object.keys(map).forEach(key => {
      categoryData.push({ name: key, value: Math.round(map[key]) });
    });
  }

  // Fallback for Pie Chart if empty
  if (categoryData.length === 0) {
    categoryData.push({ name: 'Fixed costs', value: 8000 }, { name: 'Food', value: 3000 }, { name: 'Transport', value: 1200 });
  }

  // Area chart data (weekly trends)
  const trendData = [
    { name: 'W1', Amount: Math.round((data?.total_expense || 15000) * 0.20) },
    { name: 'W2', Amount: Math.round((data?.total_expense || 15000) * 0.35) },
    { name: 'W3', Amount: Math.round((data?.total_expense || 15000) * 0.25) },
    { name: 'W4', Amount: Math.round((data?.total_expense || 15000) * 0.20) },
  ];

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-white to-gray-200 bg-clip-text text-transparent">
            Welcome back, {user?.full_name || 'Advisor User'}
          </h2>
          <p className="text-gray-300 text-sm">
            Here's a breakdown of your budget health and AI insights for this month.
          </p>
        </div>

        {/* Date Selector */}
        <div className="flex items-center gap-2 bg-glassBg border border-glassBorder rounded-xl p-1">
          <Calendar size={16} className="text-neonBlue ml-2" />
          <input 
            type="month" 
            value={month} 
            onChange={(e) => setMonth(e.target.value)}
            className="bg-transparent text-sm text-white border-0 outline-none p-1.5 cursor-pointer font-semibold"
          />
        </div>
      </div>

      {/* Grid: Financial Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Balance Card */}
        <GlassCard className="relative overflow-hidden group">
          <div className="absolute top-0 inset-x-0 h-1 bg-neonBlue"></div>
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-bold text-gray-300 uppercase tracking-wider">Remaining Balance</span>
            <div className="w-8 h-8 rounded-lg bg-neonBlue/10 flex items-center justify-center text-neonBlue">
              <DollarSign size={16} />
            </div>
          </div>
          <h3 className="text-3xl font-black text-white mb-2">
            ₹{(data?.total_balance || 0).toLocaleString()}
          </h3>
          <p className="text-xs text-gray-300">
            Available budget limits included
          </p>
        </GlassCard>

        {/* Income Card */}
        <GlassCard className="relative overflow-hidden group">
          <div className="absolute top-0 inset-x-0 h-1 bg-neonGreen"></div>
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-bold text-gray-300 uppercase tracking-wider">Monthly Income</span>
            <div className="w-8 h-8 rounded-lg bg-neonGreen/10 flex items-center justify-center text-neonGreen">
              <ArrowUpRight size={16} />
            </div>
          </div>
          <h3 className="text-3xl font-black text-white mb-2">
            ₹{((user?.monthly_income || 0) + (data?.total_income || 0)).toLocaleString()}
          </h3>
          <p className="text-xs text-neonGreen flex items-center gap-1">
            <ArrowUpRight size={14} /> Active cash inflows
          </p>
        </GlassCard>

        {/* Expense Card */}
        <GlassCard className="relative overflow-hidden group">
          <div className="absolute top-0 inset-x-0 h-1 bg-neonPink"></div>
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-bold text-gray-300 uppercase tracking-wider">Total Expenses</span>
            <div className="w-8 h-8 rounded-lg bg-neonPink/10 flex items-center justify-center text-neonPink">
              <ArrowDownRight size={16} />
            </div>
          </div>
          <h3 className="text-3xl font-black text-white mb-2">
            ₹{(data?.total_expense || 0).toLocaleString()}
          </h3>
          <p className="text-xs text-neonPink flex items-center gap-1">
            <ArrowDownRight size={14} /> Outflows including bills
          </p>
        </GlassCard>
      </div>

      {/* Grid: Health Meter & Expense Breakdown Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Health Score & Weekly Trend */}
        <div className="lg:col-span-8 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            {/* Circular Health Meter */}
            <GlassCard className="md:col-span-5 flex flex-col items-center justify-center text-center py-8">
              <span className="text-sm font-bold text-gray-300 uppercase tracking-wider mb-6">Budget Health</span>
              
              {/* Glow Radial Meter */}
              <div className="relative w-36 h-36 flex items-center justify-center mb-4">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                  {/* Track */}
                  <circle cx="50" cy="50" r="40" fill="transparent" stroke="rgba(255,255,255,0.05)" strokeWidth="8" />
                  {/* Progress Indicator */}
                  <circle 
                    cx="50" 
                    cy="50" 
                    r="40" 
                    fill="transparent" 
                    stroke="url(#healthGrad)" 
                    strokeWidth="8" 
                    strokeDasharray={251.2}
                    strokeDashoffset={251.2 - (251.2 * (data?.budget_health_score || 85)) / 100}
                    strokeLinecap="round"
                    className="transition-all duration-1000 ease-out"
                  />
                  <defs>
                    <linearGradient id="healthGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#3b82f6" />
                      <stop offset="100%" stopColor="#8b5cf6" />
                    </linearGradient>
                  </defs>
                </svg>
                {/* Score value */}
                <div className="absolute flex flex-col items-center">
                  <span className="text-3xl font-black text-white">
                    {data?.budget_health_score || 85}
                  </span>
                  <span className="text-[10px] text-gray-400 uppercase tracking-widest font-bold">Rating</span>
                </div>
              </div>

              <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                (data?.budget_health_score || 85) > 80 
                  ? 'bg-neonGreen/20 text-neonGreen' 
                  : (data?.budget_health_score || 85) > 50 
                    ? 'bg-neonYellow/20 text-neonYellow' 
                    : 'bg-neonRed/20 text-neonRed'
              }`}>
                {(data?.budget_health_score || 85) > 80 ? 'Excellent' : (data?.budget_health_score || 85) > 50 ? 'Needs Attention' : 'Critical State'}
              </span>
            </GlassCard>

            {/* Area Weekly Trend Chart */}
            <GlassCard className="md:col-span-7" title="Weekly Spending Trend">
              <div className="h-44 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={trendData}>
                    <defs>
                      <linearGradient id="colorAmt" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4}/>
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="name" stroke="#cbd5e1" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis stroke="#cbd5e1" fontSize={10} tickLine={false} axisLine={false} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: 'rgba(4, 21, 23, 0.95)', borderColor: 'rgba(255,255,255,0.2)', borderRadius: '12px' }}
                      labelStyle={{ color: '#ffffff', fontWeight: 'bold' }}
                    />
                    <Area type="monotone" dataKey="Amount" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorAmt)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </GlassCard>
          </div>

          {/* AI generated Tips / Insights panel */}
          <GlassCard className="border border-neonPurple/20 bg-neonPurple/5" hoverEffect={false}>
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="text-neonPurple animate-pulse" size={20} />
              <h3 className="text-base font-bold text-white">AI-Powered Financial Insights</h3>
            </div>
            
            <div className="space-y-4">
              {data?.savings_insights && data.savings_insights.map((insight, idx) => (
                <div key={idx} className="flex gap-3 items-start bg-black/20 p-4 rounded-xl border border-glassBorder">
                  <div className="w-6 h-6 rounded-lg bg-neonPurple/15 text-neonPurple flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                    {idx + 1}
                  </div>
                  <p className="text-sm text-gray-300 leading-relaxed">
                    {insight}
                  </p>
                </div>
              ))}
            </div>
          </GlassCard>
        </div>

        {/* Right Column: Pie Chart Categories & Alerts */}
        <div className="lg:col-span-4 space-y-6">
          {/* Pie Chart categories breakdown */}
          <GlassCard title="Expense Categories" className="flex flex-col items-center">
            <div className="h-48 w-full relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryData}
                    innerRadius={55}
                    outerRadius={75}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ backgroundColor: 'rgba(4, 21, 23, 0.95)', borderColor: 'rgba(255,255,255,0.2)', borderRadius: '12px' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            {/* Custom Legend */}
            <div className="w-full grid grid-cols-2 gap-2 text-xs text-gray-300 mt-2 max-h-24 overflow-y-auto pr-1">
              {categoryData.slice(0, 6).map((entry, index) => (
                <div key={entry.name} className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: COLORS[index % COLORS.length] }}></div>
                  <span className="truncate">{entry.name}</span>
                </div>
              ))}
            </div>
          </GlassCard>

          {/* Active Budget Alerts */}
          <GlassCard title="Budget Health Warnings" hoverEffect={false}>
            {data?.budget_alerts && data.budget_alerts.length > 0 ? (
              <div className="space-y-3">
                {data.budget_alerts.map((alert, idx) => (
                  <div key={idx} className="flex items-start gap-2.5 p-3 rounded-xl bg-neonYellow/10 border border-neonYellow/30 text-neonYellow text-xs leading-normal">
                    <AlertTriangle size={15} className="shrink-0 mt-0.5" />
                    <span>{alert}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6">
                <span className="text-4xl">🎉</span>
                <p className="text-sm font-semibold text-gray-250 mt-3">All category budgets are fully secure!</p>
                <p className="text-xs text-gray-300 mt-1">Excellent control over variable expenses.</p>
              </div>
            )}
          </GlassCard>
        </div>
      </div>

      {/* Full Width Recent Transactions List */}
      <GlassCard title="Recent Transactions">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse">
            <thead>
              <tr className="border-b border-glassBorder text-gray-300">
                <th className="py-3 px-4 font-bold">Date</th>
                <th className="py-3 px-4 font-bold">Description</th>
                <th className="py-3 px-4 font-bold">Category</th>
                <th className="py-3 px-4 font-bold">Payment Method</th>
                <th className="py-3 px-4 font-bold text-right">Amount</th>
              </tr>
            </thead>
            <tbody>
              {data?.recent_transactions && data.recent_transactions.map((tx) => (
                <tr key={tx.id} className="border-b border-glassBorder/50 hover:bg-white/5 transition-all">
                  <td className="py-3.5 px-4 font-semibold text-gray-300">
                    {new Date(tx.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                  </td>
                  <td className="py-3.5 px-4 font-bold text-white flex items-center gap-2">
                    {tx.description}
                    {tx.is_anomaly && (
                      <span className="px-1.5 py-0.5 rounded bg-neonRed/10 border border-neonRed/30 text-neonRed font-bold text-[9px] uppercase tracking-wider">
                        Risk Alert
                      </span>
                    )}
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="px-2.5 py-1 rounded-lg bg-glassBorder text-xs text-gray-200 font-bold">
                      {tx.category}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-gray-300 font-semibold">{tx.source}</td>
                  <td className={`py-3.5 px-4 text-right font-black ${tx.type === 'income' ? 'text-neonGreen' : 'text-white'}`}>
                    {tx.type === 'income' ? '+' : '-'}₹{tx.amount.toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </GlassCard>
    </div>
  );
};

export default Dashboard;
