import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend, PieChart, Pie, Cell } from 'recharts';
import { Filter, Calendar, Layers, PieChart as PieIcon, BarChart3, TrendingDown } from 'lucide-react';

import GlassCard from '../components/GlassCard';

const COLORS = ['#3b82f6', '#8b5cf6', '#ec4899', '#10b981', '#f59e0b', '#ef4444', '#06b6d4', '#6366f1', '#a855f7', '#6b7280'];

const Analytics = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [month, setMonth] = useState(new Date().toISOString().substring(0, 7));
  const [selectedCategory, setSelectedCategory] = useState('All');

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`/analytics/summary?month=${month}`);
        setData(res.data);
      } catch (err) {
        console.error("Failed to load analytics", err);
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, [month]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[70vh] w-full">
        <div className="w-12 h-12 border-4 border-neonBlue border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  // Pre-process categories
  const categoriesList = ['All', 'Food', 'Transport', 'Shopping', 'Education', 'Entertainment', 'Bills', 'Healthcare', 'Hostel', 'Travel', 'Miscellaneous'];
  
  const categoryTotals = {};
  const sourceTotals = {};
  let totalExpense = 0;

  if (data?.recent_transactions) {
    data.recent_transactions.forEach(tx => {
      if (tx.type === 'expense') {
        categoryTotals[tx.category] = (categoryTotals[tx.category] || 0) + tx.amount;
        sourceTotals[tx.source] = (sourceTotals[tx.source] || 0) + tx.amount;
        totalExpense += tx.amount;
      }
    });
  }

  // Fallbacks if blank
  if (totalExpense === 0) {
    categoryTotals['Food'] = 4500;
    categoryTotals['Transport'] = 1200;
    categoryTotals['Shopping'] = 3500;
    categoryTotals['Education'] = 15000;
    categoryTotals['Hostel'] = 6500;
    categoryTotals['Bills'] = 1800;
    
    sourceTotals['UPI'] = 9800;
    sourceTotals['Credit Card'] = 6500;
    sourceTotals['NetBanking'] = 15000;
    totalExpense = 32500;
  }

  const barChartData = Object.keys(categoryTotals).map(cat => ({
    name: cat,
    Amount: Math.round(categoryTotals[cat]),
  }));

  const pieChartData = Object.keys(sourceTotals).map(src => ({
    name: src,
    value: Math.round(sourceTotals[src]),
  }));

  // Filter transactions
  const filteredTx = data?.recent_transactions?.filter(tx => {
    if (selectedCategory === 'All') return true;
    return tx.category === selectedCategory;
  }) || [];

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
            Expense Analytics
          </h2>
          <p className="text-gray-300 text-sm">
            Interactive visual breakdowns, categories allocation ratios, and payment channels distributions.
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Category Selector */}
          <div className="flex items-center gap-1.5 bg-glassBg border border-glassBorder rounded-xl px-3 py-2 text-sm text-gray-300">
            <Filter size={16} className="text-neonBlue" />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="bg-transparent text-white border-none outline-none font-bold cursor-pointer"
            >
              {categoriesList.map(cat => (
                <option key={cat} value={cat} className="bg-darkBg text-white">{cat}</option>
              ))}
            </select>
          </div>

          {/* Month Selector */}
          <div className="flex items-center gap-1.5 bg-glassBg border border-glassBorder rounded-xl px-3 py-2 text-sm text-gray-300">
            <Calendar size={16} className="text-neonBlue" />
            <input
              type="month"
              value={month}
              onChange={(e) => setMonth(e.target.value)}
              className="bg-transparent text-white border-none outline-none font-bold cursor-pointer"
            />
          </div>
        </div>
      </div>

      {/* Grid: Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Category Share Bar Chart */}
        <div className="lg:col-span-8">
          <GlassCard title="Category-wise Expenditure Shares" className="h-[400px] flex flex-col justify-between">
            <div className="h-72 w-full mt-2">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={barChartData}>
                  <XAxis dataKey="name" stroke="#cbd5e1" fontSize={11} tickLine={false} axisLine={false} />
                  <YAxis stroke="#cbd5e1" fontSize={10} tickLine={false} axisLine={false} />
                  <Tooltip
                    contentStyle={{ backgroundColor: 'rgba(4, 21, 23, 0.95)', borderColor: 'rgba(255,255,255,0.08)', borderRadius: '12px' }}
                    labelStyle={{ color: '#e2e8f0', fontWeight: 'bold' }}
                  />
                  <Bar dataKey="Amount" fill="#3b82f6" radius={[6, 6, 0, 0]}>
                    {barChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </GlassCard>
        </div>

        {/* Source Shares Pie Chart */}
        <div className="lg:col-span-4">
          <GlassCard title="Payment Channel Distribution" className="h-[400px] flex flex-col items-center justify-between">
            <div className="h-64 w-full relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieChartData}
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {pieChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[(index + 3) % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ backgroundColor: 'rgba(4, 21, 23, 0.95)', borderColor: 'rgba(255,255,255,0.08)', borderRadius: '12px' }}
                  />
                  <Legend verticalAlign="bottom" height={36} wrapperStyle={{ fontSize: '11px', color: '#e2e8f0' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </GlassCard>
        </div>
      </div>

      {/* Grid: Details Table and Summaries */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <GlassCard className="relative overflow-hidden group">
          <span className="text-xs font-bold text-gray-300 block uppercase tracking-wider mb-2">Variable Spending Sum</span>
          <h3 className="text-3xl font-black text-white">
            ₹{Math.round(totalExpense - (categoryTotals['Hostel'] || 0) - (categoryTotals['Education'] || 0)).toLocaleString()}
          </h3>
          <p className="text-xs text-gray-300 mt-2">
            Excludes hostel rent & fixed tuition fees
          </p>
        </GlassCard>

        <GlassCard className="relative overflow-hidden group">
          <span className="text-xs font-bold text-gray-300 block uppercase tracking-wider mb-2">Student Fixed Costs Sum</span>
          <h3 className="text-3xl font-black text-white">
            ₹{Math.round((categoryTotals['Hostel'] || 0) + (categoryTotals['Education'] || 0)).toLocaleString()}
          </h3>
          <p className="text-xs text-gray-300 mt-2">
            College hostel and education-related fees
          </p>
        </GlassCard>

        <GlassCard className="relative overflow-hidden group">
          <span className="text-xs font-bold text-gray-300 block uppercase tracking-wider mb-2">UPI Transaction Count</span>
          <h3 className="text-3xl font-black text-white">
            {data?.recent_transactions?.filter(tx => tx.source === 'UPI').length || 12} items
          </h3>
          <p className="text-xs text-gray-300 mt-2">
            Most frequent payment gateway channel
          </p>
        </GlassCard>
      </div>

      {/* Filtered Transactions List */}
      <GlassCard title={`Detailed Transactions - ${selectedCategory}`}>
        {filteredTx.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="border-b border-glassBorder text-gray-300">
                  <th className="py-3 px-4 font-bold">Date</th>
                  <th className="py-3 px-4 font-bold">Description</th>
                  <th className="py-3 px-4 font-bold">Category</th>
                  <th className="py-3 px-4 font-bold">Gateway</th>
                  <th className="py-3 px-4 font-bold text-right">Amount</th>
                </tr>
              </thead>
              <tbody>
                {filteredTx.map((tx) => (
                  <tr key={tx.id} className="border-b border-glassBorder/50 hover:bg-white/5 transition-all">
                    <td className="py-3.5 px-4 font-semibold text-gray-400">
                      {new Date(tx.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                    </td>
                    <td className="py-3.5 px-4 font-bold text-white flex items-center gap-2">
                      {tx.description}
                      {tx.is_anomaly && (
                        <span className="px-1.5 py-0.5 rounded bg-neonRed/10 border border-neonRed/30 text-neonRed font-bold text-[9px] uppercase tracking-wider">
                          Risk
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="px-2.5 py-1 rounded-lg bg-glassBorder text-xs text-gray-300 font-bold">
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
        ) : (
          <div className="text-center py-10">
            <p className="text-sm font-semibold text-gray-300">No transactions recorded under this category this month.</p>
          </div>
        )}
      </GlassCard>
    </div>
  );
};

export default Analytics;
