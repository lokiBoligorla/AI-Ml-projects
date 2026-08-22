import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { predictionAPI } from '../services/api';
import { 
  User, 
  Clock, 
  GraduationCap, 
  Heart, 
  Sparkles, 
  HelpCircle, 
  CheckCircle2, 
  Cpu 
} from 'lucide-react';
import GlassCard from '../components/GlassCard';

const PredictionForm = () => {
  const navigate = useNavigate();
  
  // Fields state
  const [age, setAge] = useState(21);
  const [gender, setGender] = useState('Male');
  const [sleepHours, setSleepHours] = useState(7.0);
  const [studyHours, setStudyHours] = useState(5.5);
  const [screenTime, setScreenTime] = useState(4.0);
  const [exerciseHours, setExerciseHours] = useState(1.5);
  const [socialLevel, setSocialLevel] = useState(3);
  const [academicPressure, setAcademicPressure] = useState(3);
  const [attendancePct, setAttendancePct] = useState(88.0);
  const [dietQuality, setDietQuality] = useState('Moderate');
  const [financialStress, setFinancialStress] = useState(2);
  const [relationshipStress, setRelationshipStress] = useState(2);
  const [modelType, setModelType] = useState('xgboost');

  // UI state
  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    // Simulate multi-step visual ML process for deep user engagement!
    const steps = [
      "Standardizing student feature metrics...",
      "Executing XGBoost gradient matrices...",
      "Extracting local model outputs...",
      "Calculating SHAP tree explanations...",
      "Writing diagnostic logs..."
    ];

    for (let i = 0; i < steps.length; i++) {
      setLoadingStep(i);
      await new Promise(resolve => setTimeout(resolve, 800));
    }

    try {
      const payload = {
        age: parseInt(age),
        gender,
        sleep_hours: parseFloat(sleepHours),
        study_hours: parseFloat(studyHours),
        screen_time: parseFloat(screenTime),
        exercise_hours: parseFloat(exerciseHours),
        social_level: parseInt(socialLevel),
        academic_pressure: parseInt(academicPressure),
        attendance_pct: parseFloat(attendancePct),
        diet_quality: dietQuality,
        financial_stress: parseInt(financialStress),
        relationship_stress: parseInt(relationshipStress),
        model_type: modelType
      };
      
      const res = await predictionAPI.submit(payload);
      
      // Navigate to results page, passing prediction results as state
      navigate('/results', { state: { results: res.data, inputs: payload } });
    } catch (err) {
      console.error(err);
      alert("Diagnostic submission failed. Please check backend connection.");
      setLoading(false);
    }
  };

  const renderDots = (value, setValue) => {
    return (
      <div className="flex gap-2.5 mt-1.5">
        {[1, 2, 3, 4, 5].map((num) => (
          <button
            key={num}
            type="button"
            onClick={() => setValue(num)}
            className={`h-9 w-9 rounded-xl font-bold text-sm flex items-center justify-center transition-all ${value === num ? 'bg-primary-600 text-white shadow-md' : 'bg-white/5 border border-white/5 text-gray-400 hover:text-white'}`}
          >
            {num}
          </button>
        ))}
      </div>
    );
  };

  if (loading) {
    const loadingSteps = [
      "Standardizing student feature metrics...",
      "Executing XGBoost gradient matrices...",
      "Extracting local model outputs...",
      "Calculating SHAP tree explanations...",
      "Writing diagnostic logs..."
    ];
    
    return (
      <div className="flex flex-col items-center justify-center h-full w-full py-24 text-center">
        <GlassCard className="max-w-md w-full p-8 flex flex-col items-center gap-6" glow={true} hoverEffect={false}>
          {/* Animated Spinner with Pulsing Inner Rings */}
          <div className="relative h-20 w-20 flex items-center justify-center">
            <div className="absolute inset-0 rounded-full border-4 border-primary-500/10 border-t-primary-500 animate-spin"></div>
            <div className="absolute h-12 w-12 rounded-full border border-purple-500/20 animate-ping opacity-60"></div>
            <Cpu className="h-8 w-8 text-primary-400 animate-pulse text-glow-indigo" />
          </div>
          
          <div>
            <h3 className="text-xl font-extrabold text-white">Diagnostics Engine Running</h3>
            <p className="text-xs text-gray-400 mt-1 uppercase tracking-widest font-semibold text-primary-400">
              {modelType === 'xgboost' ? 'XGBoost v3.2.0 Active' : 'Random Forest v1.8.0 Active'}
            </p>
          </div>

          {/* Checklist */}
          <div className="w-full flex flex-col gap-3 text-left bg-white/[0.02] border border-white/5 p-4 rounded-2xl">
            {loadingSteps.map((step, idx) => (
              <div key={idx} className="flex items-center gap-3 text-sm">
                <div className={`h-4 w-4 rounded-full flex items-center justify-center flex-shrink-0`}>
                  {idx < loadingStep ? (
                    <CheckCircle2 className="h-4.5 w-4.5 text-emerald-400" />
                  ) : idx === loadingStep ? (
                    <div className="h-2 w-2 bg-primary-500 rounded-full animate-ping"></div>
                  ) : (
                    <div className="h-2 w-2 bg-gray-600 rounded-full"></div>
                  )}
                </div>
                <span className={`transition-all ${idx === loadingStep ? 'text-white font-medium' : idx < loadingStep ? 'text-gray-400 line-through decoration-emerald-500/20' : 'text-gray-600'}`}>
                  {step}
                </span>
              </div>
            ))}
          </div>
        </GlassCard>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8 w-full max-w-4xl mx-auto">
      <div>
        <h1 className="text-3xl font-extrabold text-white tracking-tight">Lifestyle & Academic Check-in</h1>
        <p className="text-sm text-gray-400 mt-1">Please provide accurate lifestyle variables. Our machine learning models will audit your scores.</p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        
        {/* Section 1: Demographics & Time Budgets */}
        <GlassCard className="flex flex-col gap-5">
          <div className="flex items-center gap-3 border-b border-white/5 pb-3">
            <User className="h-5 w-5 text-primary-400" />
            <h3 className="font-bold text-lg text-white">Demographics & Time Budgets</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Age */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs text-gray-400 font-semibold px-1">Student Age (years)</label>
              <input
                type="number"
                required
                min={12}
                max={99}
                value={age}
                onChange={(e) => setAge(e.target.value)}
                className="px-4 py-3 rounded-2xl bg-white/5 border border-white/10 text-white placeholder-gray-500 text-sm focus:outline-none focus:border-primary-500 focus:bg-white/[0.07] transition-all"
              />
            </div>

            {/* Gender */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs text-gray-400 font-semibold px-1">Gender Identification</label>
              <div className="flex gap-2">
                {['Male', 'Female', 'Other'].map((g) => (
                  <button
                    key={g}
                    type="button"
                    onClick={() => setGender(g)}
                    className={`flex-1 py-3.5 rounded-2xl font-bold text-sm transition-all ${gender === g ? 'bg-primary-600 text-white border border-primary-500/20' : 'bg-white/5 border border-white/5 text-gray-400 hover:text-white'}`}
                  >
                    {g}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-2">
            {/* Sleep Hours */}
            <div className="flex flex-col gap-1.5">
              <div className="flex justify-between items-center px-1">
                <label className="text-xs text-gray-400 font-semibold">Sleep Duration</label>
                <span className="text-xs font-bold text-primary-400">{sleepHours.toFixed(1)} hrs/night</span>
              </div>
              <input
                type="range"
                min="2.0"
                max="12.0"
                step="0.5"
                value={sleepHours}
                onChange={(e) => setSleepHours(parseFloat(e.target.value))}
                className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-primary-500 mt-2"
              />
            </div>

            {/* Study Hours */}
            <div className="flex flex-col gap-1.5">
              <div className="flex justify-between items-center px-1">
                <label className="text-xs text-gray-400 font-semibold">Study Duration</label>
                <span className="text-xs font-bold text-primary-400">{studyHours.toFixed(1)} hrs/day</span>
              </div>
              <input
                type="range"
                min="0.0"
                max="16.0"
                step="0.5"
                value={studyHours}
                onChange={(e) => setStudyHours(parseFloat(e.target.value))}
                className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-primary-500 mt-2"
              />
            </div>

            {/* Screen Time */}
            <div className="flex flex-col gap-1.5 mt-2">
              <div className="flex justify-between items-center px-1">
                <label className="text-xs text-gray-400 font-semibold">Device Screen Exposure</label>
                <span className="text-xs font-bold text-primary-400">{screenTime.toFixed(1)} hrs/day</span>
              </div>
              <input
                type="range"
                min="0.0"
                max="18.0"
                step="0.5"
                value={screenTime}
                onChange={(e) => setScreenTime(parseFloat(e.target.value))}
                className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-primary-500 mt-2"
              />
            </div>

            {/* Exercise Hours */}
            <div className="flex flex-col gap-1.5 mt-2">
              <div className="flex justify-between items-center px-1">
                <label className="text-xs text-gray-400 font-semibold">Physical Activity / Gym</label>
                <span className="text-xs font-bold text-primary-400">{exerciseHours.toFixed(1)} hrs/day</span>
              </div>
              <input
                type="range"
                min="0.0"
                max="6.0"
                step="0.5"
                value={exerciseHours}
                onChange={(e) => setExerciseHours(parseFloat(e.target.value))}
                className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-primary-500 mt-2"
              />
            </div>
          </div>
        </GlassCard>

        {/* Section 2: Academic & Lifestyle Pressure */}
        <GlassCard className="flex flex-col gap-5">
          <div className="flex items-center gap-3 border-b border-white/5 pb-3">
            <GraduationCap className="h-5 w-5 text-indigo-400" />
            <h3 className="font-bold text-lg text-white">Academic & Lifestyle Pressure</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Academic Pressure */}
            <div className="flex flex-col gap-1">
              <label className="text-xs text-gray-400 font-semibold px-1">Academic Pressure Index</label>
              {renderDots(academicPressure, setAcademicPressure)}
              <span className="text-[10px] text-gray-500 mt-1">1: Relaxed/Low, 5: Critical Exam Cramming</span>
            </div>

            {/* Class Attendance */}
            <div className="flex flex-col gap-1.5">
              <div className="flex justify-between items-center px-1">
                <label className="text-xs text-gray-400 font-semibold">Class Attendance Ratio</label>
                <span className="text-xs font-bold text-primary-400">{attendancePct.toFixed(0)}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                step="1"
                value={attendancePct}
                onChange={(e) => setAttendancePct(parseFloat(e.target.value))}
                className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-primary-500 mt-2.5"
              />
            </div>

            {/* Diet Quality */}
            <div className="flex flex-col gap-1.5 mt-2">
              <label className="text-xs text-gray-400 font-semibold px-1">Dietary Quality</label>
              <div className="flex gap-2">
                {['Healthy', 'Moderate', 'Unhealthy'].map((d) => (
                  <button
                    key={d}
                    type="button"
                    onClick={() => setDietQuality(d)}
                    className={`flex-1 py-3 rounded-2xl font-semibold text-sm transition-all ${dietQuality === d ? 'bg-primary-600 text-white border border-primary-500/20' : 'bg-white/5 border border-white/5 text-gray-400 hover:text-white'}`}
                  >
                    {d}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </GlassCard>

        {/* Section 3: Social & Emotional Strain */}
        <GlassCard className="flex flex-col gap-5">
          <div className="flex items-center gap-3 border-b border-white/5 pb-3">
            <Heart className="h-5 w-5 text-purple-400" />
            <h3 className="font-bold text-lg text-white">Social & Emotional Strain</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* Social Level */}
            <div className="flex flex-col gap-1">
              <label className="text-xs text-gray-400 font-semibold px-1">Social Engagement</label>
              {renderDots(socialLevel, setSocialLevel)}
              <span className="text-[10px] text-gray-500 mt-1">1: Deep isolation, 5: High connection</span>
            </div>

            {/* Financial Stress */}
            <div className="flex flex-col gap-1">
              <label className="text-xs text-gray-400 font-semibold px-1">Financial Strain</label>
              {renderDots(financialStress, setFinancialStress)}
              <span className="text-[10px] text-gray-500 mt-1">1: Debt-free/Peace, 5: Active job hunts</span>
            </div>

            {/* Relationship Stress */}
            <div className="flex flex-col gap-1">
              <label className="text-xs text-gray-400 font-semibold px-1">Relationship Strain</label>
              {renderDots(relationshipStress, setRelationshipStress)}
              <span className="text-[10px] text-gray-500 mt-1">1: Fully supported, 5: Heavy friction</span>
            </div>
          </div>
        </GlassCard>

        {/* Model Selection and Submit */}
        <div className="flex flex-col md:flex-row md:items-center justify-between p-6 rounded-3xl border border-white/5 bg-gradient-to-r from-white/[0.02] to-transparent gap-4">
          <div className="flex flex-col">
            <span className="text-sm font-bold text-white flex items-center gap-1.5">
              <Cpu className="h-4.5 w-4.5 text-primary-400" />
              Machine Learning Model
            </span>
            <div className="flex gap-2 mt-2">
              <button
                type="button"
                onClick={() => setModelType('xgboost')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border ${modelType === 'xgboost' ? 'bg-primary-600/20 text-primary-400 border-primary-500/40 shadow-inner' : 'bg-white/5 border-transparent text-gray-400 hover:text-white'}`}
              >
                XGBoost Model (98.3% F1)
              </button>
              <button
                type="button"
                onClick={() => setModelType('random_forest')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border ${modelType === 'random_forest' ? 'bg-primary-600/20 text-primary-400 border-primary-500/40 shadow-inner' : 'bg-white/5 border-transparent text-gray-400 hover:text-white'}`}
              >
                Random Forest (97.0% F1)
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="glow-btn px-10 py-4 rounded-2xl bg-gradient-to-r from-primary-600 via-indigo-600 to-purple-600 text-white font-bold text-base shadow-xl shadow-primary-500/25 hover:scale-105 active:scale-95 transition-all self-end md:self-auto"
          >
            Run ML Diagnostic Audit
          </button>
        </div>

      </form>
    </div>
  );
};

export default PredictionForm;
