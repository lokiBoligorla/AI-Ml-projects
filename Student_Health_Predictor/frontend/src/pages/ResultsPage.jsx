import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { predictionAPI } from '../services/api';
import { 
  Heart, 
  Activity, 
  Flame, 
  Download, 
  ArrowLeft, 
  CheckCircle, 
  BrainCircuit,
  AlertTriangle,
  Sparkles
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Cell, 
  ResponsiveContainer, 
  Tooltip,
  ReferenceLine,
  CartesianGrid
} from 'recharts';
import GlassCard from '../components/GlassCard';

const ResultsPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  const [prediction, setPrediction] = useState(null);
  const [inputs, setInputs] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadResults = async () => {
      // 1. If loaded from state (immediate questionnaire redirect)
      if (location.state?.results) {
        setPrediction(location.state.results);
        setInputs(location.state.inputs);
        setLoading(false);
        return;
      }
      
      // 2. If loaded from query parameters (dashboard log shortcut click)
      const predId = searchParams.get('id');
      if (predId) {
        try {
          const historyRes = await predictionAPI.getHistory();
          const match = historyRes.data.find(item => item.id === parseInt(predId));
          
          if (match) {
            // Re-map db model fields to fit schema
            const mappedInputs = {
              age: match.age,
              gender: match.gender,
              sleep_hours: match.sleep_hours,
              study_hours: match.study_hours,
              screen_time: match.screen_time,
              exercise_hours: match.exercise_hours,
              social_level: match.social_level,
              academic_pressure: match.academic_pressure,
              attendance_pct: match.attendance_pct,
              diet_quality: match.diet_quality,
              financial_stress: match.financial_stress,
              relationship_stress: match.relationship_stress
            };
            
            // Re-simulate recommendations and SHAP on the fly using submission endpoint, 
            // or mock values based on database fields for clean restoration
            const res = await predictionAPI.submit({
              ...mappedInputs,
              model_type: match.model_used.toLowerCase().includes('xgboost') ? 'xgboost' : 'random_forest'
            });
            
            setPrediction(res.data);
            setInputs(mappedInputs);
          } else {
            navigate('/');
          }
        } catch (err) {
          console.error("Failed to restore previous audit:", err);
          navigate('/');
        }
      } else {
        navigate('/');
      }
      setLoading(false);
    };
    
    loadResults();
  }, [location, searchParams, navigate]);

  const getWellnessColor = (score) => {
    if (score >= 75) return 'text-emerald-400 border-emerald-500/30';
    if (score >= 50) return 'text-amber-400 border-amber-500/30';
    return 'text-red-400 border-red-500/30';
  };

  const getStatusLabel = (level) => {
    return ["Low", "Moderate", "High"][level] || "N/A";
  };

  const getStatusColor = (level) => {
    if (level === 0) return 'text-emerald-400 border-emerald-500/30';
    if (level === 1) return 'text-amber-400 border-amber-500/30';
    return 'text-red-400 border-red-500/30';
  };

  if (loading) {
    return (
      <div className="flex h-full w-full items-center justify-center text-primary-500 py-24">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-t-transparent border-primary-500"></div>
      </div>
    );
  }

  // Format SHAP data for Horizontal Bar Chart
  // In our wellness score model, positive SHAP = better wellness (Green), negative SHAP = worse wellness (Red)
  const shapData = prediction?.feature_contributions
    ? Object.entries(prediction.feature_contributions).map(([name, val]) => ({
        name,
        value: parseFloat(val.toFixed(2)),
      })).sort((a, b) => b.value - a.value)
    : [];

  return (
    <div className="flex flex-col gap-8 w-full max-w-4xl mx-auto">
      {/* Header and buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/')}
            className="p-2.5 rounded-xl bg-white/5 border border-white/5 text-gray-400 hover:text-white transition-all"
          >
            <ArrowLeft className="h-4.5 w-4.5" />
          </button>
          <div>
            <h1 className="text-3xl font-extrabold text-white tracking-tight">Audit Report Card</h1>
            <p className="text-sm text-gray-400 mt-1">Calibrated diagnostics from our {prediction.model_used} model.</p>
          </div>
        </div>
        
        <a
          href={predictionAPI.getReportUrl(prediction.id)}
          className="glow-btn px-6 py-3 rounded-2xl bg-gradient-to-r from-primary-600 to-purple-600 text-white font-bold text-sm shadow-xl shadow-primary-500/10 flex items-center justify-center gap-2 self-start sm:self-auto hover:scale-105 active:scale-95 transition-all"
        >
          <Download className="h-4.5 w-4.5" />
          Download PDF Report
        </a>
      </div>

      {/* Gauges section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <GlassCard className="flex flex-col items-center text-center gap-3 p-8 border-t-4 border-t-primary-500">
          <span className="text-xs text-gray-400 font-semibold uppercase tracking-wider">Wellness Rating</span>
          <div className={`h-28 w-28 rounded-full border-4 flex flex-col items-center justify-center gap-0.5 mt-2 bg-white/[0.01] ${getWellnessColor(prediction.wellness_score)} shadow-inner`}>
            <span className="text-3xl font-extrabold text-white">{prediction.wellness_score}%</span>
            <span className="text-[10px] text-gray-400 uppercase tracking-widest font-bold">Score</span>
          </div>
          <p className="text-xs text-gray-400 mt-2">Overall lifestyle and academic balance index</p>
        </GlassCard>

        <GlassCard className="flex flex-col items-center text-center gap-3 p-8 border-t-4 border-t-amber-500">
          <span className="text-xs text-gray-400 font-semibold uppercase tracking-wider">Stress Intensity</span>
          <div className={`h-28 w-28 rounded-full border-4 flex flex-col items-center justify-center gap-0.5 mt-2 bg-white/[0.01] ${getStatusColor(prediction.stress_level)} shadow-inner`}>
            <span className="text-2xl font-extrabold text-white">{getStatusLabel(prediction.stress_level)}</span>
            <span className="text-[10px] text-gray-400 uppercase tracking-widest font-bold">Strain</span>
          </div>
          <p className="text-xs text-gray-400 mt-2">Corresponds to active academic pressure</p>
        </GlassCard>

        <GlassCard className="flex flex-col items-center text-center gap-3 p-8 border-t-4 border-t-red-500">
          <span className="text-xs text-gray-400 font-semibold uppercase tracking-wider">Burnout Indicators</span>
          <div className={`h-28 w-28 rounded-full border-4 flex flex-col items-center justify-center gap-0.5 mt-2 bg-white/[0.01] ${getStatusColor(prediction.burnout_risk)} shadow-inner`}>
            <span className="text-2xl font-extrabold text-white">{getStatusLabel(prediction.burnout_risk)}</span>
            <span className="text-[10px] text-gray-400 uppercase tracking-widest font-bold">Risk</span>
          </div>
          <p className="text-xs text-gray-400 mt-2">Proximity to physical and mental exhaustion</p>
        </GlassCard>
      </div>

      {/* Explainable AI SHAP Chart */}
      {shapData.length > 0 && (
        <GlassCard className="flex flex-col gap-4">
          <div className="flex items-center gap-2.5 border-b border-white/5 pb-3">
            <BrainCircuit className="h-5 w-5 text-indigo-400" />
            <div>
              <h3 className="font-bold text-lg text-white">Explainable AI (XAI) Analytics</h3>
              <p className="text-xs text-gray-400">Local SHAP contributions explaining your Mental Wellness score</p>
            </div>
          </div>
          
          <p className="text-xs text-gray-400 leading-relaxed px-1">
            SHAP (SHapley Additive exPlanations) values indicate how each variable pushes your score. 
            <span className="text-emerald-400 font-semibold"> Positive values (Green)</span> added points to your wellness, while 
            <span className="text-red-400 font-semibold"> negative values (Red)</span> deducted points.
          </p>

          <div className="h-[360px] w-full mt-4 pr-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={shapData}
                layout="vertical"
                margin={{ top: 5, right: 20, left: 30, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(0, 0, 0, 0.06)" />
                <XAxis type="number" stroke="#475569" fontSize={11} />
                <YAxis dataKey="name" type="category" stroke="#1e293b" fontSize={11} tickLine={false} width={120} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#ffffff',
                    borderColor: 'rgba(0, 0, 0, 0.08)',
                    borderRadius: '16px',
                    color: '#0f172a'
                  }}
                />
                <ReferenceLine x={0} stroke="rgba(0, 0, 0, 0.15)" strokeWidth={1.5} />
                <Bar dataKey="value" name="SHAP Contribution Points">
                  {shapData.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={entry.value >= 0 ? '#10B981' : '#EF4444'} 
                      fillOpacity={0.75}
                      stroke={entry.value >= 0 ? '#10B981' : '#EF4444'}
                      strokeWidth={1}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>
      )}

      {/* AI Recommendations */}
      <GlassCard className="flex flex-col gap-6">
        <div className="flex items-center gap-2.5 border-b border-white/5 pb-3">
          <Sparkles className="h-5 w-5 text-purple-400" />
          <div>
            <h3 className="font-bold text-lg text-white">AI Health Advisor Blueprints</h3>
            <p className="text-xs text-gray-400">Targeted lifestyle changes formulated for your values</p>
          </div>
        </div>

        <div className="flex flex-col gap-4">
          {/* Summary Alert */}
          <div className={`p-4 rounded-2xl flex items-start gap-3 text-sm leading-normal border ${
            prediction.recommendations.status === 'Excellent' 
              ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' 
              : prediction.recommendations.status === 'Moderate'
                ? 'bg-amber-500/10 border-amber-500/20 text-amber-400'
                : 'bg-red-500/10 border-red-500/20 text-red-400'
          }`}>
            {prediction.recommendations.status === 'Excellent' ? (
              <CheckCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
            ) : (
              <AlertTriangle className="h-5 w-5 flex-shrink-0 mt-0.5" />
            )}
            <div>
              <span className="font-bold uppercase tracking-wider text-xs block mb-1">Wellness Status: {prediction.recommendations.status}</span>
              {prediction.recommendations.overall_summary}
            </div>
          </div>

          {/* Core Plan Columns */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-2">
            <div className="flex flex-col gap-2 bg-white/[0.01] border border-white/5 p-4 rounded-2xl">
              <h4 className="font-bold text-sm text-white border-b border-white/5 pb-1.5 mb-1 text-primary-400">Daily Routines</h4>
              <ul className="flex flex-col gap-2">
                {prediction.recommendations.routines.map((item, idx) => (
                  <li key={idx} className="text-xs text-gray-300 leading-relaxed">• {item}</li>
                ))}
              </ul>
            </div>

            <div className="flex flex-col gap-2 bg-white/[0.01] border border-white/5 p-4 rounded-2xl">
              <h4 className="font-bold text-sm text-white border-b border-white/5 pb-1.5 mb-1 text-purple-400">Stress Relievers</h4>
              <ul className="flex flex-col gap-2">
                {prediction.recommendations.stress_reduction.map((item, idx) => (
                  <li key={idx} className="text-xs text-gray-300 leading-relaxed">• {item}</li>
                ))}
              </ul>
            </div>

            <div className="flex flex-col gap-2 bg-white/[0.01] border border-white/5 p-4 rounded-2xl">
              <h4 className="font-bold text-sm text-white border-b border-white/5 pb-1.5 mb-1 text-indigo-400">Study-Life Balance</h4>
              <ul className="flex flex-col gap-2">
                {prediction.recommendations.study_balance.map((item, idx) => (
                  <li key={idx} className="text-xs text-gray-300 leading-relaxed">• {item}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </GlassCard>
    </div>
  );
};

export default ResultsPage;
