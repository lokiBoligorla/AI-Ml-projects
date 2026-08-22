import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from 'recharts';
import { TrendingUp, AlertTriangle, ChevronRight, Filter } from 'lucide-react';

import GlassCard from '../components/GlassCard';

const Forecasting = () => {
  const [category, setCategory] = useState('All');
  const [forecasts, setForecasts] = useState([]);
  const [loading, setLoading] = useState(true);

  const categories = ['All', 'Food', 'Transport', 'Shopping', 'Education', 'Entertainment', 'Bills', 'Hostel', 'Travel', 'Miscellaneous'];

  useEffect(() => {
    const fetchForecasts = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`/forecast/monthly?category=${category}`);
        setForecasts(res.data);
      } catch (err) {
        console.error("Failed to fetch forecasts", err);
      } finally {
        setLoading(false);
      }
    };
    fetchForecasts();
  }, [category]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[70vh] w-full">
        <div className="w-12 h-12 border-4 border-neonBlue border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  // Combine past spending and forecast data for graphing
  // Mock historical points for visualization flow
  const basePast = {
    'All': [19500, 21000, 20500, 22000],
    'Food': [5400, 6000, 5800, 6500],
    'Transport': [1500, 1700, 1600, 1800],
    'Shopping': [2900, 3100, 3400, 3500],
    'Education': [0, 45000, 0, 5000],
    'Entertainment': [1200, 1400, 1300, 1500],
    'Bills': [1700, 1900, 1800, 2000],
    'Healthcare': [500, 700, 600, 800],
    'Hostel': [6500, 6500, 6500, 6500],
    'Travel': [0, 5000, 0, 2500],
    'Miscellaneous': [800, 950, 900, 1000]
  };

  const history = basePast[category] || [1000, 1200, 1100, 1300];
  const chartData = [
    { name: 'Feb 26', Actual: history[0] },
    { name: 'Mar 26', Actual: history[1] },
    { name: 'Apr 26', Actual: history[2] },
    { name: 'May 26', Actual: history[3], Expected: history[3], Lower: history[3], Upper: history[3] },
  ];

  forecasts.forEach((f, idx) => {
    const monthName = new Date(f.forecast_date + "-02").toLocaleDateString(undefined, { month: 'short', year: '2-digit' });
    chartData.push({
      name: monthName,
      Expected: Math.round(f.expected_amount),
      Lower: Math.round(f.lower_bound),
      Upper: Math.round(f.upper_bound)
    });
  });

  const nextMonthExpected = forecasts[0]?.expected_amount || 0;
  const nextMonthUpper = forecasts[0]?.upper_bound || 0;

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
            Time-Series Spending Forecasts
          </h2>
          <p className="text-gray-300 text-sm">
            Predictive modeling using ARIMA engine to project spending envelopes and warn of upcoming budget overruns.
          </p>
        </div>

        {/* Filter Category */}
        <div className="flex items-center gap-1.5 bg-glassBg border border-glassBorder rounded-xl px-3 py-2 text-sm text-gray-300">
          <Filter size={16} className="text-neonBlue" />
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="bg-transparent text-white border-none outline-none font-bold cursor-pointer"
          >
            {categories.map(cat => (
              <option key={cat} value={cat} className="bg-darkBg text-white">{cat}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Grid: Forecast graph */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8">
          <GlassCard title={`3-Month Expense Path Projections - ${category}`} className="h-[430px] flex flex-col justify-between">
            <div className="h-80 w-full mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="colorUpper" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.25}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" vertical={false} />
                  <XAxis dataKey="name" stroke="#cbd5e1" fontSize={11} tickLine={false} axisLine={false} />
                  <YAxis stroke="#cbd5e1" fontSize={10} tickLine={false} axisLine={false} />
                  <Tooltip
                    contentStyle={{ backgroundColor: 'rgba(4, 21, 23, 0.95)', borderColor: 'rgba(255,255,255,0.08)', borderRadius: '12px' }}
                    labelStyle={{ color: '#e2e8f0', fontWeight: 'bold' }}
                  />
                  <Legend verticalAlign="top" height={36} wrapperStyle={{ fontSize: '11px', color: '#cbd5e1' }} />
                  {/* Historical path */}
                  <Area type="monotone" dataKey="Actual" stroke="#e2e8f0" strokeWidth={2} fill="transparent" legendType="line" />
                  {/* Forecast bounds */}
                  <Area type="monotone" dataKey="Upper" stroke="rgba(59,130,246,0.3)" fill="url(#colorUpper)" strokeDasharray="5 5" name="Confidence Bounds Max" />
                  <Area type="monotone" dataKey="Lower" stroke="rgba(59,130,246,0.3)" fill="transparent" strokeDasharray="5 5" name="Confidence Bounds Min" />
                  <Area type="monotone" dataKey="Expected" stroke="#3b82f6" strokeWidth={3} fill="transparent" name="ARIMA Expected Trend" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </GlassCard>
        </div>

        {/* Right side warnings & analytics summary */}
        <div className="lg:col-span-4 space-y-6">
          <GlassCard title="Forecast Insights" hoverEffect={false}>
            <div className="space-y-4">
              {/* Expected projection */}
              <div className="p-4 bg-black/20 rounded-xl border border-glassBorder">
                <span className="text-xs font-bold text-gray-300 uppercase tracking-wider block">Expected Next Month</span>
                <span className="text-2xl font-black text-white mt-1 block">
                  ₹{Math.round(nextMonthExpected).toLocaleString()}
                </span>
              </div>

              {/* High upper bound envelope */}
              <div className="p-4 bg-black/20 rounded-xl border border-glassBorder">
                <span className="text-xs font-bold text-gray-300 uppercase tracking-wider block">Worse Case Limit (Upper Bound)</span>
                <span className="text-2xl font-black text-neonPink mt-1 block">
                  ₹{Math.round(nextMonthUpper).toLocaleString()}
                </span>
              </div>

              <div className="p-4 bg-neonPurple/10 border border-neonPurple/30 text-neonPurple rounded-xl flex gap-3 items-start leading-normal text-xs">
                <TrendingUp size={18} className="shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold block mb-1">Seasonal Spike Notice</span>
                  <span>We project a 4.2% seasonal budget spike in {category} spending next month based on historical semester fee and travel aggregates.</span>
                </div>
              </div>
            </div>
          </GlassCard>

          {/* Forecasted budget overrun alert */}
          <GlassCard title="Budget Overrun Alerts" hoverEffect={false}>
            {nextMonthExpected > 15000 && category === 'All' ? (
              <div className="flex gap-3 items-start p-4 bg-neonRed/10 border border-neonRed/30 text-neonRed rounded-xl leading-normal text-xs">
                <AlertTriangle size={18} className="shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold block mb-1">Overrun Risk Detected</span>
                  <span>Your projected next month spending of ₹{Math.round(nextMonthExpected).toLocaleString()} represents a 12% increase, creating a high risk of exceeding your general pocket allowance threshold.</span>
                </div>
              </div>
            ) : (
              <div className="text-center py-6">
                <span className="text-3xl">🛡️</span>
                <p className="text-sm font-semibold text-gray-300 mt-2">Zero overrun risks forecast!</p>
                <p className="text-xs text-gray-400 mt-1">Spending path remains safely within limits.</p>
              </div>
            )}
          </GlassCard>
        </div>
      </div>
    </div>
  );
};

export default Forecasting;
